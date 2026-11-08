import { ViewBase } from '../view-base';

/** Base for a view shown in a modal. */
export abstract class ModalBase extends ViewBase {
  /** Opens the modal when it is closed, and closes it when it is open. */
  abstract toggle(): void;
}
