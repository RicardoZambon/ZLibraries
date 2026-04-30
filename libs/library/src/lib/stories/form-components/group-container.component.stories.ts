import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { GroupAccordionComponent } from '../../components/group-accordion/group-accordion.component';
import { GroupContainerComponent } from '../../components/group-container/group-container.component';
import { GroupScrollSpyComponent } from '../../components/group-scroll-spy/group-scroll-spy.component';

const meta: Meta<GroupContainerComponent> = {
  component: GroupContainerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        GroupAccordionComponent,
        GroupScrollSpyComponent,
      ],
    }),
  ],
  title: 'Form Components/Group Container',
};
export default meta;
type Story = StoryObj<GroupContainerComponent>;

export const Primary: Story = {
  args: {
    title: 'Customer Profile',
    icon: 'fa-user',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 h-[32rem] max-w-5xl bg-slate-50">
        <lib-group-container
          [title]="title"
          [icon]="icon">
          <lib-group-scroll-spy>
            <lib-group-accordion label="Overview">
              <div class="grid gap-3 text-sm text-slate-700">
                <p>Primary details, current status, ownership, and account level metadata.</p>
                <p>Assigned representative: Grace Hopper</p>
                <p>Lifecycle stage: Active</p>
              </div>
            </lib-group-accordion>

            <lib-group-accordion label="Commercial">
              <div class="grid gap-3 text-sm text-slate-700">
                <p>Plan, renewal, billing profile, and contract notes.</p>
                <p>Plan: Enterprise</p>
                <p>Renewal: Annual</p>
              </div>
            </lib-group-accordion>

            <lib-group-accordion label="Activity">
              <div class="grid gap-3 text-sm text-slate-700">
                <p>Recent customer interactions and internal follow-up history.</p>
                <p>Last contact: Product onboarding</p>
                <p>Next step: Technical review</p>
              </div>
            </lib-group-accordion>
          </lib-group-scroll-spy>
        </lib-group-container>
      </div>
    `,
  }),
};

export const WithoutHeader: Story = {
  args: {
    title: '',
    icon: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4 h-[32rem] max-w-5xl bg-slate-50">
        <lib-group-container
          [title]="title"
          [icon]="icon">
          <lib-group-scroll-spy>
            <lib-group-accordion label="Summary">
              <div class="grid gap-3 text-sm text-slate-700">
                <p>Summary section content for scroll spy navigation.</p>
                <p>Use this section to validate active state and click navigation.</p>
                <p>Additional content keeps the scroll area realistic.</p>
              </div>
            </lib-group-accordion>

            <lib-group-accordion label="Details">
              <div class="grid gap-3 text-sm text-slate-700">
                <p>Detailed information section content.</p>
                <p>More details are shown here so the section has meaningful height.</p>
                <p>Scroll spy should activate this item when the section enters view.</p>
              </div>
            </lib-group-accordion>

            <lib-group-accordion label="History">
              <div class="grid gap-3 text-sm text-slate-700">
                <p>History and audit section content.</p>
                <p>Recent changes, updates, and ownership notes are displayed here.</p>
                <p>This provides another target for scroll spy navigation.</p>
              </div>
            </lib-group-accordion>
          </lib-group-scroll-spy>
        </lib-group-container>
      </div>
    `,
  }),
};

