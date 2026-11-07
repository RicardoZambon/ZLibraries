import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { GroupAccordionComponent } from '@zambon-dev/ui/library';
import { GroupAccordionOverviewExample } from '../../examples/group-accordion/group-accordion-overview.example';

const meta: Meta<GroupAccordionComponent> = {
  component: GroupAccordionComponent,
  decorators: [moduleMetadata({ imports: [GroupAccordionOverviewExample] })],
  title: 'Library/Form Components/Group Accordion',
};
export default meta;
type Story = StoryObj<GroupAccordionComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-group-accordion-overview></example-group-accordion-overview>` }),
};
