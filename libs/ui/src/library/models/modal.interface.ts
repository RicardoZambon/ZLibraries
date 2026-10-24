import { Signal } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto';

/**
 * What a modal offers whoever drives it.
 *
 * `isOpen` is a signal: a parent reads it from a template as often as from code, and a plain
 * getter over a field told Angular nothing when it flipped. It was `isShown` and a boolean, and
 * the rename is deliberate -- a call site that still expects the old shape fails to compile
 * instead of reading a signal object and finding it always truthy.
 *
 * `size` and `title` are no longer part of this contract. They are presentational inputs each
 * component declares for itself, and nothing ever drove a modal through them.
 */
export interface IModal {
  readonly isOpen: Signal<boolean>;

  closeModal(): void;
  toggleModal(): void;
}
