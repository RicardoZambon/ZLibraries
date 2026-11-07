// Builds the data the documentation site (apps/docs) renders.
//
//   node tools/docs-content/build.mjs
//
// Reads the Markdown in docs/guides and docs/components, the changelog, the example registry in
// libs/ui-examples and the package's public API, and writes:
//
//   dist/docs-content/              page data the site fetches at build and run time
//   apps/docs/src/generated/        the route manifest the site imports (navigation, prerender)
//
// It fails, listing every problem, when a link points nowhere, a page names an unknown example,
// a page is missing from docs/site.yml, or a public input, output or model has no description.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { createHighlighter } from 'shiki';
import YAML from 'yaml';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'dist/docs-content');
const GENERATED = join(ROOT, 'apps/docs/src/generated');
const REPO_URL = 'https://github.com/RicardoZambon/ZLibraries';
const BLOB = `${REPO_URL}/blob/main`;
const STORYBOOK = 'storybook/'; // relative to the site's base href
const ENTRY_POINTS = ['library', 'framework', 'shared', 'testing'];

const problems = [];
const problem = (message) => problems.push(message);

// ---------------------------------------------------------------------------------------------
// Helpers

const posix = (p) => p.replace(/\\/g, '/');
const repoPath = (abs) => posix(relative(ROOT, abs));

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}

function readFrontMatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!match) return { data: {}, body: source };
  return { data: YAML.parse(match[1]) ?? {}, body: source.slice(match[0].length) };
}

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------------------------
// Site map: which Markdown file becomes which route.

const site = YAML.parse(readFileSync(join(ROOT, 'docs/site.yml'), 'utf8'));
const guideSlugs = site.guides.flatMap((group) => group.pages);
const componentSlugs = (site.components ?? []).flatMap((group) => group.pages ?? []);

const pages = new Map(); // absolute md path -> route
for (const slug of guideSlugs) pages.set(join(ROOT, 'docs/guides', `${slug}.md`), `guides/${slug}`);
for (const slug of componentSlugs) pages.set(join(ROOT, 'docs/components', `${slug}.md`), `components/${slug}`);
pages.set(join(ROOT, 'libs/ui/CHANGELOG.md'), 'changelog');

for (const [file] of pages)
  if (!existsSync(file)) problem(`docs/site.yml lists ${repoPath(file)}, which does not exist`);
for (const [dir, listed] of [
  ['docs/guides', guideSlugs],
  ['docs/components', componentSlugs],
]) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.md'))) {
    if (!listed.includes(basename(file, '.md'))) problem(`${dir}/${file} is not listed in docs/site.yml`);
  }
}

// ---------------------------------------------------------------------------------------------
// Example registry, read from source so this script needs no TypeScript build.

function readRegistry() {
  const file = join(ROOT, 'libs/ui-examples/src/registry.ts');
  if (!existsSync(file)) return new Map();
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const examples = new Map();
  // `files` entries may be written as `file('button/x.example.ts')`, a helper that prefixes ROOT.
  const root = /const ROOT = '([^']+)'/.exec(source.text)?.[1] ?? '';
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = Object.fromEntries(
        node.properties
          .filter((p) => ts.isPropertyAssignment(p) && p.name && ts.isIdentifier(p.name))
          .map((p) => [p.name.text, p.initializer]),
      );
      if (props.id && props.files && ts.isStringLiteralLike(props.id)) {
        const text = (n) => {
          if (n && ts.isStringLiteralLike(n)) return n.text;
          if (
            n &&
            ts.isCallExpression(n) &&
            n.expression.getText() === 'file' &&
            ts.isStringLiteralLike(n.arguments[0])
          ) {
            return `${root}/${n.arguments[0].text}`;
          }
          return '';
        };
        examples.set(props.id.text, {
          id: props.id.text,
          title: text(props.title),
          description: text(props.description),
          files: ts.isArrayLiteralExpression(props.files) ? props.files.elements.map(text) : [],
        });
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return examples;
}

const registry = readRegistry();

// ---------------------------------------------------------------------------------------------
// Public API, from Angular's own extractor.

async function readApi() {
  const cli = await import(pathToFileURL(join(ROOT, 'node_modules/@angular/compiler-cli/bundles/index.js')).href);
  const parsed = cli.readConfiguration(join(ROOT, 'libs/ui/tsconfig.lib.json'));
  const host = cli.createCompilerHost({ options: parsed.options });
  const program = new cli.NgtscProgram(parsed.rootNames, parsed.options, host);
  const api = {};
  for (const entryPoint of ENTRY_POINTS) {
    const entry = posix(join(ROOT, 'libs/ui/src', entryPoint, 'index.ts'));
    api[entryPoint] = program.getApiDocumentation(entry, new Set()).entries;
  }
  return api;
}

const PUBLIC_MEMBER_TAGS = new Set(['input', 'output']);
const isHidden = (member) => (member.memberTags ?? []).some((t) => t === 'protected' || t === 'private');
const isLifecycle = (name) => /^ng[A-Z]/.test(name);
const isDecorated = (entry) => ['component', 'directive', 'pipe'].includes(entry.entryType);
const deprecation = (doc) => (doc.jsdocTags ?? []).find((t) => t.name === 'deprecated');

function memberKind(member) {
  const tags = member.memberTags ?? [];
  if (tags.includes('input') && tags.includes('output')) return 'model';
  if (tags.includes('input')) return 'input';
  if (tags.includes('output')) return 'output';
  return member.memberType === 'method' ? 'method' : 'property';
}

function memberType(member) {
  const type = member.type ?? member.returnType ?? '';
  // InputSignal<T> / ModelSignal<T> / OutputEmitterRef<T> read better as their T.
  const unwrapped =
    /^(?:InputSignal(?:WithTransform)?|ModelSignal|OutputEmitterRef|EventEmitter|Signal|WritableSignal)<([\s\S]*)>$/.exec(
      type.trim(),
    );
  if (member.memberType === 'method') {
    const params = (member.implementation?.params ?? member.params ?? []).map(
      (p) => `${p.name}${p.isOptional ? '?' : ''}: ${p.type}`,
    );
    return `(${params.join(', ')}) => ${member.implementation?.returnType ?? member.returnType ?? 'void'}`;
  }
  return unwrapped ? unwrapped[1].split(',')[0].trim() : type;
}

function checkDocumented(api) {
  for (const [entryPoint, entries] of Object.entries(api)) {
    for (const entry of entries) {
      if (!isDecorated(entry)) continue;
      for (const member of entry.members ?? []) {
        if (isHidden(member)) continue;
        if (!(member.memberTags ?? []).some((t) => PUBLIC_MEMBER_TAGS.has(t))) continue;
        if (!member.description?.trim()) {
          // `--warn-jsdoc` is for local work in progress only; CI runs without it.
          (process.argv.includes('--warn-jsdoc') ? console.warn : problem)(
            `@zambon-dev/ui/${entryPoint}: ${entry.name}.${member.name} has no JSDoc description`,
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Markdown

const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: ['typescript', 'javascript', 'html', 'scss', 'css', 'json', 'bash', 'yaml', 'diff'],
});
const LANG_ALIASES = { ts: 'typescript', js: 'javascript', sh: 'bash', shell: 'bash', jsonc: 'json', yml: 'yaml' };

export function highlight(code, lang) {
  const resolved = LANG_ALIASES[lang] ?? lang;
  const known = highlighter.getLoadedLanguages().includes(resolved) ? resolved : 'text';
  return highlighter.codeToHtml(code, {
    lang: known,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}

/** Turns a link written for GitHub into one that works on the site. */
function rewriteHref(href, fromFile, context, route) {
  if (/^(https?:|mailto:)/.test(href)) return href;
  // In-page anchors carry the page path: under a base href, a bare #id would leave the page.
  if (href.startsWith('#')) return `${route}${href}`;
  const [path, anchor] = href.split('#');
  const target = resolve(dirname(fromFile), decodeURIComponent(path));
  const hash = anchor ? `#${anchor}` : '';
  if (pages.has(target)) return `${pages.get(target)}${hash}`;
  if (existsSync(target)) return `${BLOB}/${repoPath(target)}${hash}`;
  problem(`${context}: link to ${href} points nowhere`);
  return href;
}

const EXAMPLE_MARKER = /^<!--\s*example:\s*([a-z0-9-]+)\s*-->\s*$/;

function renderMarkdown(source, file, route = pages.get(file)) {
  const context = repoPath(file);
  const toc = [];
  const usedIds = new Map();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        let id = slugify(text);
        const seen = usedIds.get(id) ?? 0;
        usedIds.set(id, seen + 1);
        if (seen) id = `${id}-${seen}`;
        if (depth === 2 || depth === 3) toc.push({ id, text: text.replace(/<[^>]+>/g, ''), level: depth });
        return `<h${depth} id="${id}"><a class="anchor" href="${route}#${id}" aria-hidden="true" tabindex="-1">#</a>${text}</h${depth}>\n`;
      },
      code({ text, lang }) {
        return `<div class="code-block">${highlight(text, (lang ?? '').split(/\s/)[0])}</div>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const rewritten = rewriteHref(href, file, context, route);
        const external = /^https?:/.test(rewritten);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const rel = external ? ' rel="noopener" target="_blank"' : '';
        return `<a href="${escapeHtml(rewritten)}"${titleAttr}${rel}>${text}</a>`;
      },
      table(token) {
        // Default rendering, wrapped so a wide table scrolls instead of widening the page.
        return `<div class="table-wrap">${marked.Renderer.prototype.table.call(this, token)}</div>`;
      },
    },
  });

  // Split the top-level tokens at example markers so the site can place a live example there.
  const tokens = marked.lexer(source);
  const blocks = [];
  const examples = [];
  let chunk = [];
  const flush = () => {
    if (!chunk.length) return;
    chunk.links = tokens.links;
    blocks.push({ type: 'html', html: marked.parser(chunk) });
    chunk = [];
  };
  let title = '';
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1 && !title) {
      title = token.text.replace(/`/g, '');
      continue; // The site renders the title itself.
    }
    const marker = token.type === 'html' ? EXAMPLE_MARKER.exec(token.raw.trim()) : null;
    if (marker) {
      flush();
      const id = marker[1];
      if (!registry.has(id)) problem(`${context}: unknown example "${id}"`);
      blocks.push({ type: 'example', id });
      examples.push(id);
      continue;
    }
    chunk.push(token);
  }
  flush();
  return { title, blocks, toc, examples };
}

function exampleData(ids) {
  const data = {};
  for (const id of ids) {
    const entry = registry.get(id);
    if (!entry) continue;
    data[id] = {
      id,
      title: entry.title,
      description: entry.description,
      files: entry.files.map((path) => {
        const abs = join(ROOT, path);
        if (!existsSync(abs)) {
          problem(`example "${id}": file ${path} does not exist`);
          return { name: basename(path), path, html: '' };
        }
        const ext = path.split('.').pop();
        return {
          name: basename(path),
          path,
          url: `${BLOB}/${path}`,
          html: highlight(readFileSync(abs, 'utf8'), ext === 'ts' ? 'typescript' : ext),
        };
      }),
    };
  }
  return data;
}

// ---------------------------------------------------------------------------------------------
// API rendering

const inlineMarked = new Marked({ gfm: true });
const md = (text) => (text ? inlineMarked.parse(text) : '');

function apiEntry(entry, entryPoint) {
  const dep = deprecation(entry);
  return {
    name: entry.name,
    kind: entry.entryType,
    entryPoint,
    selector: entry.selector ?? entry.pipeName ?? null,
    exportAs: entry.exportAs?.length ? entry.exportAs : null,
    description: md(entry.description),
    deprecated: dep ? md(dep.comment || 'Deprecated.') : null,
    members: (entry.members ?? [])
      .filter((m) => !isHidden(m) && !isLifecycle(m.name) && m.memberType !== 'constructor')
      .map((m) => {
        const mdep = deprecation(m);
        return {
          name: m.name,
          kind: memberKind(m),
          alias:
            m.inputAlias && m.inputAlias !== m.name
              ? m.inputAlias
              : m.outputAlias && m.outputAlias !== m.name
                ? m.outputAlias
                : null,
          required: !!m.isRequiredInput,
          type: memberType(m),
          description: md(m.description),
          deprecated: mdep ? md(mdep.comment || 'Deprecated.') : null,
        };
      }),
    // For type aliases, enums, constants and functions, show the declaration itself.
    signature:
      entry.entryType === 'type_alias'
        ? `type ${entry.name} = ${entry.type}`
        : entry.entryType === 'constant'
          ? `const ${entry.name}: ${entry.type}`
          : entry.entryType === 'function'
            ? `function ${entry.name}(${(entry.implementation?.params ?? entry.params ?? []).map((p) => `${p.name}${p.isOptional ? '?' : ''}: ${p.type}`).join(', ')}): ${entry.implementation?.returnType ?? entry.returnType ?? 'void'}`
            : entry.entryType === 'enum'
              ? `enum ${entry.name} { ${(entry.members ?? []).map((m) => m.name).join(', ')} }`
              : null,
  };
}

// ---------------------------------------------------------------------------------------------
// Build

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'pages'), { recursive: true });
mkdirSync(join(OUT, 'api'), { recursive: true });
mkdirSync(GENERATED, { recursive: true });

const api = await readApi();
checkDocumented(api);

const apiIndex = {}; // class name -> entry points that export it, for component pages
for (const [entryPoint, entries] of Object.entries(api)) {
  const rendered = entries.map((e) => apiEntry(e, entryPoint)).sort((a, b) => a.name.localeCompare(b.name));
  for (const e of rendered) (apiIndex[e.name] ??= []).push(entryPoint);
  writeFileSync(join(OUT, 'api', `${entryPoint}.json`), JSON.stringify({ entryPoint, entries: rendered }));
}

const nav = { guides: [], components: [] };
const searchable = [];

function writePage(route, file, extra = {}) {
  const source = readFileSync(file, 'utf8');
  const { data, body } = readFrontMatter(source);
  const rendered = renderMarkdown(body, file);
  const title = data.title ?? rendered.title ?? route;
  const page = {
    route,
    title,
    summary: data.summary ?? '',
    entryPoint: data.entryPoint ?? null,
    // A name exported by two entry points (ButtonComponent) resolves to the page's own entry point.
    // `framework:ButtonComponent` picks one explicitly.
    api: (data.api ?? []).map((spec) => {
      const [explicit, name] = spec.includes(':') ? spec.split(':') : [null, spec];
      const candidates = apiIndex[name] ?? [];
      const entryPoint = [explicit, data.entryPoint, candidates[0]].find((ep) => ep && candidates.includes(ep)) ?? null;
      if (!entryPoint) problem(`${repoPath(file)}: api lists ${spec}, which no entry point exports`);
      return { name, entryPoint };
    }),
    storybook: data.storybook ? `${STORYBOOK}?path=/story/${data.storybook}` : null,
    editUrl: `${REPO_URL}/edit/main/${repoPath(file)}`,
    toc: rendered.toc,
    blocks: rendered.blocks,
    examples: exampleData(rendered.examples),
    ...extra,
  };
  const out = join(OUT, 'pages', `${route}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(page));
  searchable.push(route);
  return page;
}

for (const group of site.guides) {
  nav.guides.push({
    title: group.title,
    items: group.pages.map((slug) => {
      const page = writePage(`guides/${slug}`, join(ROOT, 'docs/guides', `${slug}.md`));
      return { title: page.title, path: `guides/${slug}` };
    }),
  });
}
for (const group of site.components ?? []) {
  nav.components.push({
    title: group.title,
    items: (group.pages ?? []).map((slug) => {
      const page = writePage(`components/${slug}`, join(ROOT, 'docs/components', `${slug}.md`));
      return { title: page.title, path: `components/${slug}`, summary: page.summary, entryPoint: page.entryPoint };
    }),
  });
}

// The changelog: the curated release notes, without the retired packages' long history.
{
  const file = join(ROOT, 'libs/ui/CHANGELOG.md');
  const full = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const cut = full.indexOf('\n## Package history');
  const links = full.slice(full.search(/^\[Unreleased\]:/m));
  const source = `${cut === -1 ? full : full.slice(0, cut)}\n\nReleases of the retired packages are in the [full changelog](${BLOB}/libs/ui/CHANGELOG.md#package-history).\n\n${links}`;
  const tmp = { title: 'Changelog' };
  const rendered = renderMarkdown(source, file);
  writeFileSync(
    join(OUT, 'pages', 'changelog.json'),
    JSON.stringify({
      route: 'changelog',
      title: tmp.title,
      summary: '',
      api: [],
      toc: rendered.toc.filter((t) => t.level === 2),
      blocks: rendered.blocks,
      examples: {},
      editUrl: `${REPO_URL}/edit/main/libs/ui/CHANGELOG.md`,
    }),
  );
}

writeFileSync(
  join(GENERATED, 'manifest.json'),
  JSON.stringify(
    {
      nav,
      routes: {
        guides: guideSlugs,
        components: componentSlugs,
        api: ENTRY_POINTS,
      },
      examples: [...registry.keys()],
    },
    null,
    2,
  ) + '\n',
);

if (problems.length) {
  console.error(`docs content: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(
  `docs content: ${searchable.length} pages, ${registry.size} examples, ${Object.values(api).reduce((n, e) => n + e.length, 0)} API entries`,
);
