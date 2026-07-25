import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDirective } from './dialog.directive';

@Component({
  standalone: true,
  imports: [DialogDirective],
  template: `
    @if (open()) {
      <aside class="drawer" appDialog (dismiss)="open.set(false)">
        <h2>Panel title</h2>
        <input id="first" />
        <button id="last">Save</button>
      </aside>
    }
  `,
})
class HostComponent {
  readonly open = signal(true);
}

describe('DialogDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function drawer(): HTMLElement {
    return fixture.nativeElement.querySelector('.drawer') as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks the panel as an accessible modal dialog', () => {
    const el = drawer();
    expect(el.getAttribute('role')).toBe('dialog');
    expect(el.getAttribute('aria-modal')).toBe('true');
    expect(el.getAttribute('tabindex')).toBe('-1');
  });

  it('labels the dialog by its first heading', () => {
    const el = drawer();
    const headingId = el.querySelector('h2')!.id;
    expect(headingId).toBeTruthy();
    expect(el.getAttribute('aria-labelledby')).toBe(headingId);
  });

  it('emits dismiss and lets the host close on Escape', () => {
    drawer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    expect(fixture.nativeElement.querySelector('.drawer')).toBeNull();
  });

  it('wraps focus from the last element back to the first on Tab', () => {
    const el = drawer();
    const first = el.querySelector<HTMLElement>('#first')!;
    const last = el.querySelector<HTMLElement>('#last')!;
    last.focus();
    expect(document.activeElement).toBe(last);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);
  });
});
