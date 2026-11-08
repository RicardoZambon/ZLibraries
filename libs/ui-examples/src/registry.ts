import { Type } from '@angular/core';

export interface ExampleEntry {
  /** Stable kebab-case id, unique, e.g. 'button-intents'. Used in docs Markdown and URLs. */
  id: string;
  /** Short human title, e.g. 'Intents'. */
  title: string;
  /** One sentence shown under the title. */
  description: string;
  /** Lazy-loads the component class. */
  load: () => Promise<Type<unknown>>;
  /** Repo-relative paths of the source files to show as code tabs, first is the main one. */
  files: string[];
}

const ROOT = 'libs/ui-examples/src/examples';

/** The repo-relative path of an example file, from its path under `src/examples`. */
const file = (path: string): string => `${ROOT}/${path}`;

export const EXAMPLES: readonly ExampleEntry[] = [
  // Button
  {
    id: 'button-overview',
    title: 'Overview',
    description: 'A primary button with an icon and a label.',
    load: () => import('./examples/button/button-overview.example').then((m) => m.ButtonOverviewExample),
    files: [file('button/button-overview.example.ts')],
  },
  {
    id: 'button-intents',
    title: 'Intents',
    description: 'An intent says what the button is for; the theme picks the colour.',
    load: () => import('./examples/button/button-intents.example').then((m) => m.ButtonIntentsExample),
    files: [file('button/button-intents.example.ts')],
  },
  {
    id: 'button-states',
    title: 'States',
    description: 'Loading, success, error and disabled, next to an idle button.',
    load: () => import('./examples/button/button-states.example').then((m) => m.ButtonStatesExample),
    files: [file('button/button-states.example.ts')],
  },
  {
    id: 'button-icon-only',
    title: 'Icon only',
    description: 'Without text the button stays square. Give it an accessible name with ariaLabel.',
    load: () => import('./examples/button/button-icon-only.example').then((m) => m.ButtonIconOnlyExample),
    files: [file('button/button-icon-only.example.ts')],
  },

  // Data grid
  {
    id: 'data-grid-basic',
    title: 'Basic grid',
    description: 'A grid fed by its own dataset, which defines the columns and loads the rows.',
    load: () => import('./examples/data-grid/data-grid-basic.example').then((m) => m.DataGridBasicExample),
    files: [file('data-grid/data-grid-basic.example.ts')],
  },
  {
    id: 'data-grid-toolbar',
    title: 'Toolbar',
    description: 'Buttons projected into the slot above the rows.',
    load: () => import('./examples/data-grid/data-grid-toolbar.example').then((m) => m.DataGridToolbarExample),
    files: [file('data-grid/data-grid-toolbar.example.ts')],
  },
  {
    id: 'data-grid-child-list',
    title: 'Child list',
    description: 'A shorter grid that loads rows as they scroll into view, with its own actions.',
    load: () => import('./examples/data-grid/data-grid-child-list.example').then((m) => m.DataGridChildListExample),
    files: [file('data-grid/data-grid-child-list.example.ts')],
  },
  {
    id: 'data-grid-multi-select',
    title: 'Multi-select',
    description: 'Row selection with checkboxes, over rows taller than the default.',
    load: () => import('./examples/data-grid/data-grid-multi-select.example').then((m) => m.DataGridMultiSelectExample),
    files: [file('data-grid/data-grid-multi-select.example.ts')],
  },

  // Catalog select
  {
    id: 'catalog-select-basic',
    title: 'Static list',
    description: 'A searchable pick list over a fixed list of entries.',
    load: () =>
      import('./examples/catalog-select/catalog-select-basic.example').then((m) => m.CatalogSelectBasicExample),
    files: [file('catalog-select/catalog-select-basic.example.ts')],
  },
  {
    id: 'catalog-select-enum',
    title: 'Enum values',
    description: 'Entries with string values, starting with one already chosen.',
    load: () => import('./examples/catalog-select/catalog-select-enum.example').then((m) => m.CatalogSelectEnumExample),
    files: [file('catalog-select/catalog-select-enum.example.ts')],
  },
  {
    id: 'catalog-select-remote',
    title: 'Remote search',
    description: 'Entries searched on an API endpoint, with filters sent along.',
    load: () =>
      import('./examples/catalog-select/catalog-select-remote.example').then((m) => m.CatalogSelectRemoteExample),
    files: [file('catalog-select/catalog-select-remote.example.ts')],
  },
  {
    id: 'catalog-select-short-list',
    title: 'Short list without search',
    description: 'With searchable off, the field is a plain picker that takes no typing.',
    load: () =>
      import('./examples/catalog-select/catalog-select-short-list.example').then(
        (m) => m.CatalogSelectShortListExample,
      ),
    files: [file('catalog-select/catalog-select-short-list.example.ts')],
  },

  // Form group
  {
    id: 'form-group-overview',
    title: 'Overview',
    description: 'A titled group of fields inside a reactive form.',
    load: () => import('./examples/form-group/form-group-overview.example').then((m) => m.FormGroupOverviewExample),
    files: [file('form-group/form-group-overview.example.ts')],
  },

  // Form input group
  {
    id: 'form-input-group-basic',
    title: 'Basic field',
    description: 'One labelled field bound to a control by name.',
    load: () =>
      import('./examples/form-input-group/form-input-group-basic.example').then((m) => m.FormInputGroupBasicExample),
    files: [file('form-input-group/form-input-group-basic.example.ts')],
  },
  {
    id: 'form-input-group-types',
    title: 'Field types',
    description: 'Text, date, number, checkbox, textarea and date-time fields.',
    load: () =>
      import('./examples/form-input-group/form-input-group-types.example').then((m) => m.FormInputGroupTypesExample),
    files: [file('form-input-group/form-input-group-types.example.ts')],
  },
  {
    id: 'form-input-group-validation',
    title: 'Validation messages',
    description: 'Each validator error key maps to the message shown under the field.',
    load: () =>
      import('./examples/form-input-group/form-input-group-validation.example').then(
        (m) => m.FormInputGroupValidationExample,
      ),
    files: [file('form-input-group/form-input-group-validation.example.ts')],
  },

  // Form input
  {
    id: 'form-input-basic',
    title: 'Bare inputs',
    description: 'Text, number, date and textarea inputs in a layout of your own.',
    load: () => import('./examples/form-input/form-input-basic.example').then((m) => m.FormInputBasicExample),
    files: [file('form-input/form-input-basic.example.ts')],
  },

  // Group accordion
  {
    id: 'group-accordion-overview',
    title: 'Overview',
    description: 'A section that folds away when its header is clicked.',
    load: () =>
      import('./examples/group-accordion/group-accordion-overview.example').then(
        (m) => m.GroupAccordionOverviewExample,
      ),
    files: [file('group-accordion/group-accordion-overview.example.ts')],
  },

  // Group container
  {
    id: 'group-container-overview',
    title: 'Overview',
    description: 'A titled panel with collapsible sections and a strip that follows the one in view.',
    load: () =>
      import('./examples/group-container/group-container-overview.example').then(
        (m) => m.GroupContainerOverviewExample,
      ),
    files: [file('group-container/group-container-overview.example.ts')],
  },
  {
    id: 'group-container-loading',
    title: 'Loading title',
    description: 'Without a title, the title bar shows a spinner.',
    load: () =>
      import('./examples/group-container/group-container-loading.example').then((m) => m.GroupContainerLoadingExample),
    files: [file('group-container/group-container-loading.example.ts')],
  },

  // Group scroll spy
  {
    id: 'group-scroll-spy-basic',
    title: 'Basic',
    description: 'Links to each section; the one in view is highlighted.',
    load: () =>
      import('./examples/group-scroll-spy/group-scroll-spy-basic.example').then((m) => m.GroupScrollSpyBasicExample),
    files: [file('group-scroll-spy/group-scroll-spy-basic.example.ts')],
  },

  // Modal
  {
    id: 'modal-basic',
    title: 'Basic modal',
    description: 'Open and close a modal through a template reference.',
    load: () => import('./examples/modal/modal-basic.example').then((m) => m.ModalBasicExample),
    files: [file('modal/modal-basic.example.ts')],
  },
  {
    id: 'modal-top-confirmation',
    title: 'Top confirmation',
    description: 'A confirmation for an action that cannot be undone, at the top of the screen.',
    load: () => import('./examples/modal/modal-top-confirmation.example').then((m) => m.ModalTopConfirmationExample),
    files: [file('modal/modal-top-confirmation.example.ts')],
  },
  {
    id: 'modal-error',
    title: 'Error message',
    description: 'An error with no footer actions; the close button is the only way out.',
    load: () => import('./examples/modal/modal-error.example').then((m) => m.ModalErrorExample),
    files: [file('modal/modal-error.example.ts')],
  },

  // Multi editor
  {
    id: 'multi-editor-basic',
    title: 'Basic editor',
    description: 'Edit many rows in one modal and save them in one batch.',
    load: () => import('./examples/multi-editor/multi-editor-basic.example').then((m) => m.MultiEditorBasicExample),
    files: [file('multi-editor/multi-editor-basic.example.ts')],
  },
  {
    id: 'multi-editor-pricing',
    title: 'Pricing table',
    description: 'A wider editor with a catalog, bounded numbers and dates.',
    load: () => import('./examples/multi-editor/multi-editor-pricing.example').then((m) => m.MultiEditorPricingExample),
    files: [file('multi-editor/multi-editor-pricing.example.ts')],
  },

  // Multi select
  {
    id: 'multi-select-basic',
    title: 'Basic selector',
    description: 'A modal to add records to a selection or remove them from it.',
    load: () => import('./examples/multi-select/multi-select-basic.example').then((m) => m.MultiSelectBasicExample),
    files: [file('multi-select/multi-select-basic.example.ts')],
  },

  // Ribbon
  {
    id: 'ribbon-overview',
    title: 'Overview',
    description: 'A toolbar of labelled groups, with disabled, busy and menu buttons.',
    load: () => import('./examples/ribbon/ribbon-overview.example').then((m) => m.RibbonOverviewExample),
    files: [file('ribbon/ribbon-overview.example.ts'), file('ribbon/ribbon-item.component.ts')],
  },
  {
    id: 'ribbon-content-sized-parent',
    title: 'Content-sized parent',
    description: 'What not to do: in a parent that sizes to its content, the ribbon collapses.',
    load: () =>
      import('./examples/ribbon/ribbon-content-sized-parent.example').then((m) => m.RibbonContentSizedParentExample),
    files: [file('ribbon/ribbon-content-sized-parent.example.ts'), file('ribbon/ribbon-item.component.ts')],
  },

  // Sidebar
  {
    id: 'sidebar-overview',
    title: 'Overview',
    description: 'A small menu in two regions, loaded through a sidebar service.',
    load: () => import('./examples/sidebar/sidebar-overview.example').then((m) => m.SidebarOverviewExample),
    files: [file('sidebar/sidebar-overview.example.ts')],
  },

  // Framework buttons
  {
    id: 'framework-buttons-ribbon',
    title: 'Ribbon buttons',
    description: 'The ready-made record, workflow and view buttons in a ribbon.',
    load: () =>
      import('./examples/framework-buttons/framework-buttons-ribbon.example').then(
        (m) => m.FrameworkButtonsRibbonExample,
      ),
    files: [file('framework-buttons/framework-buttons-ribbon.example.ts')],
  },
  {
    id: 'framework-buttons-states',
    title: 'Busy and disabled',
    description: 'A framework button that is busy, and one that is disabled.',
    load: () =>
      import('./examples/framework-buttons/framework-buttons-states.example').then(
        (m) => m.FrameworkButtonsStatesExample,
      ),
    files: [file('framework-buttons/framework-buttons-states.example.ts')],
  },

  // Framework modals
  {
    id: 'confirm-modal-basic',
    title: 'Confirm modal',
    description: 'A question with an icon, and your own confirm button.',
    load: () =>
      import('./examples/framework-modals/confirm-modal-basic.example').then((m) => m.ConfirmModalBasicExample),
    files: [file('framework-modals/confirm-modal-basic.example.ts')],
  },
  {
    id: 'error-modal-basic',
    title: 'Error modal',
    description: 'An error message passed in when the modal opens.',
    load: () => import('./examples/framework-modals/error-modal-basic.example').then((m) => m.ErrorModalBasicExample),
    files: [file('framework-modals/error-modal-basic.example.ts')],
  },

  // Tabs
  {
    id: 'tabs-breadcrumbs',
    title: 'Tabs with breadcrumbs',
    description: 'The tab strip, with a sub-view shown as a breadcrumb trail.',
    load: () => import('./examples/tabs/tabs-breadcrumbs.example').then((m) => m.TabsBreadcrumbsExample),
    files: [file('tabs/tabs-breadcrumbs.example.ts')],
  },

  // Theme switch
  {
    id: 'theme-switch-basic',
    title: 'Theme switch',
    description: 'One button that steps through light, dark and system.',
    load: () => import('./examples/theme-switch/theme-switch-basic.example').then((m) => m.ThemeSwitchBasicExample),
    files: [file('theme-switch/theme-switch-basic.example.ts')],
  },
  // Login
  {
    id: 'login-card',
    title: 'Sign-in screen',
    description: 'The sign-in card on its layout, as SharedAuthModule shows it at /login.',
    load: () => import('./examples/login/login-card.example').then((m) => m.LoginCardExample),
    files: [file('login/login-card.example.ts')],
  },
];
