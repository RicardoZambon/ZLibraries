/** Shapes written by tools/docs-content/build.mjs. Keep the two in step. */

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export type PageBlock = { type: 'html'; html: string } | { type: 'example'; id: string };

export interface ExampleFile {
  name: string;
  path: string;
  url?: string;
  html: string;
}

export interface ExampleData {
  id: string;
  title: string;
  description: string;
  files: ExampleFile[];
}

export interface PageData {
  route: string;
  title: string;
  summary: string;
  entryPoint?: string | null;
  api: { name: string; entryPoint: string | null }[];
  storybook?: string | null;
  editUrl: string;
  toc: TocEntry[];
  blocks: PageBlock[];
  examples: Record<string, ExampleData>;
}

export interface ApiMember {
  name: string;
  kind: 'input' | 'output' | 'model' | 'method' | 'property';
  alias: string | null;
  required: boolean;
  type: string;
  description: string;
  deprecated: string | null;
}

export interface ApiEntry {
  name: string;
  kind: string;
  entryPoint: string;
  selector: string | null;
  exportAs: string[] | null;
  description: string;
  deprecated: string | null;
  members: ApiMember[];
  signature: string | null;
}

export interface ApiData {
  entryPoint: string;
  entries: ApiEntry[];
}

export interface NavItem {
  title: string;
  path: string;
  summary?: string;
  entryPoint?: string | null;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface Manifest {
  nav: { guides: NavGroup[]; components: NavGroup[] };
  routes: { guides: string[]; components: string[]; api: string[] };
  examples: string[];
}
