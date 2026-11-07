import { Component, computed, input } from '@angular/core';
import { ApiEntry, ApiMember } from '../content/content.models';
import { TrustedHtmlPipe } from '../content/trusted-html.pipe';

const KIND_LABELS: Record<string, string> = {
  component: 'Component',
  directive: 'Directive',
  pipe: 'Pipe',
  undecorated_class: 'Class',
  interface: 'Interface',
  type_alias: 'Type',
  enum: 'Enum',
  constant: 'Constant',
  function: 'Function',
  ng_module: 'NgModule',
};

const MEMBER_GROUPS: { kind: ApiMember['kind']; title: string }[] = [
  { kind: 'input', title: 'Inputs' },
  { kind: 'model', title: 'Two-way bindings' },
  { kind: 'output', title: 'Outputs' },
  { kind: 'property', title: 'Properties' },
  { kind: 'method', title: 'Methods' },
];

/** One exported symbol: its summary and a table per kind of member. */
@Component({
  selector: 'docs-api-entry',
  imports: [TrustedHtmlPipe],
  template: `
    @let item = entry();
    <section class="api-entry" [class.is-deprecated]="item.deprecated">
      <h3 [id]="item.name">
        <a class="anchor" [href]="anchorBase() + '#' + item.name" aria-hidden="true" tabindex="-1">#</a>
        <code>{{ item.name }}</code>
        <span class="kind">{{ kindLabel() }}</span>
        @if (item.deprecated) {
          <span class="kind is-deprecated">Deprecated</span>
        }
      </h3>
      @if (item.selector) {
        <p class="meta">
          {{ item.kind === 'pipe' ? 'Pipe name' : 'Selector' }}: <code>{{ item.selector }}</code>
          @if (item.exportAs) {
            · Exported as: <code>{{ item.exportAs.join(', ') }}</code>
          }
        </p>
      }
      @if (item.deprecated) {
        <div class="deprecated-note" [innerHTML]="item.deprecated | trustedHtml"></div>
      }
      <div class="api-description" [innerHTML]="item.description | trustedHtml"></div>
      @if (item.signature) {
        <pre class="signature"><code>{{ item.signature }}</code></pre>
      }
      @for (group of groups(); track group.title) {
        <h4>{{ group.title }}</h4>
        <div class="table-wrap">
          <table class="api-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              @for (member of group.members; track member.name) {
                <tr>
                  <td class="member-name">
                    <code>{{ member.alias ?? member.name }}</code>
                    @if (member.required) {
                      <span class="tag">required</span>
                    }
                    @if (member.type) {
                      <code class="member-type">{{ member.type }}</code>
                    }
                  </td>
                  <td>
                    @if (member.deprecated) {
                      <div class="deprecated-note" [innerHTML]="member.deprecated | trustedHtml"></div>
                    }
                    <div [innerHTML]="member.description | trustedHtml"></div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styleUrl: './api-entry.scss',
})
export class ApiEntryView {
  public readonly entry = input.required<ApiEntry>();
  /** The page path anchors are relative to, e.g. `api/library`. */
  public readonly anchorBase = input.required<string>();

  protected readonly kindLabel = computed(() => KIND_LABELS[this.entry().kind] ?? this.entry().kind);

  protected readonly groups = computed(() => {
    // Enums show their members in the signature; interfaces list theirs as properties.
    if (this.entry().kind === 'enum') return [];
    return MEMBER_GROUPS.map((group) => ({
      title: group.title,
      members: this.entry().members.filter((m) => m.kind === group.kind),
    })).filter((group) => group.members.length);
  });
}
