import { ViewBase } from '../view-base';

export abstract class ModalBase extends ViewBase {
  abstract toggle(): void;
}