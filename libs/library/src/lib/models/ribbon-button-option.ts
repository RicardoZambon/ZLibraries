export interface IRibbonButtonOption {
  allowedActions?: string[];
  icon?: string;
  id: string;
  isAccessAllowed?: boolean;
  isDisabled?: boolean;
  isVisible?: boolean;
  label: string;
  parameters?: { [key: string]: string };
  path?: string;
}