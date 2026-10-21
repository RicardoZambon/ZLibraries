import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

/**
 * A consumer in the shape every filter panel has: a submit button projected into the modal's
 * footer. framework-button-filters is exactly this, and its Confirm button is the one that reloaded
 * the page.
 */
@Component({
  imports: [ModalComponent],
  template: `
    <lib-modal>
      <div footer>
        <button type="submit">Confirm</button>
      </div>
    </lib-modal>
  `,
})
class SubmitButtonHostComponent {}

describe(ModalComponent.name, () => {
  let fixture: ComponentFixture<SubmitButtonHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitButtonHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitButtonHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should move its host to the body', () => {
    const host: HTMLElement | null = document.body.querySelector(':scope > lib-modal');

    expect(host).not.toBeNull();
  });

  /**
   * The modal's content sits in a native <form>, and nothing in this component handles its submit.
   * While the host stayed where it was declared, that did not matter: the submit bubbled through the
   * consumer, and the FormGroupDirective its [formGroup] binding puts there cancelled it. Once the
   * host moved to <body> the event stopped passing through the consumer at all, nothing cancelled
   * it, and the browser ran the native submission -- a GET to the current URL, which reloads the
   * whole application a moment after the button's own click handler has done its work.
   *
   * A modal is never meant to submit natively, so the form refuses to wherever the host lives.
   */
  it('should not let a submit button inside it submit the page', () => {
    const button: HTMLButtonElement | null = document.body.querySelector('lib-modal button[type="submit"]');
    let submitEvent: Event | undefined;
    const recordSubmit: (event: Event) => void = (event: Event) => (submitEvent = event);
    document.addEventListener('submit', recordSubmit);

    try {
      button?.click();
    } finally {
      document.removeEventListener('submit', recordSubmit);
    }

    expect(submitEvent).toBeDefined();
    expect(submitEvent?.defaultPrevented).toBe(true);
  });
});
