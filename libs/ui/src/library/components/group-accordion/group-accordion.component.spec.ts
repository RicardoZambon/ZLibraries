import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupAccordionComponent } from './group-accordion.component';

@Component({
  imports: [GroupAccordionComponent],
  template: `<lib-group-accordion label="Overview"><p>Body</p></lib-group-accordion>`,
})
class GroupAccordionHostComponent {}

describe(GroupAccordionComponent.name, () => {
  let fixture: ComponentFixture<GroupAccordionHostComponent>;

  function toggle(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('h5 > button');
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(GroupAccordionHostComponent);
    await fixture.whenStable();
  });

  it('keeps the title a heading and toggles with a native button inside it', () => {
    const heading: HTMLElement = fixture.nativeElement.querySelector('h5');

    expect(heading.getAttribute('role')).toBeNull();
    expect(toggle().type).toBe('button');
    expect(toggle().textContent?.trim()).toBe('Overview');
  });

  it('reports and flips its expanded state from the button', async () => {
    expect(toggle().getAttribute('aria-expanded')).toBe('true');

    toggle().click();
    // The toggle flips on the next macrotask, after pinning the height for the closing animation.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });
});
