import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionLockDirective } from './permission-lock.directive';

@Component({
  standalone: true,
  imports: [PermissionLockDirective],
  template: `
    <button
      type="button"
      [appLocked]="locked()"
      lockedReason="Requires the Manage tasks permission."
      (click)="clicks = clicks + 1"
    >
      New task
    </button>
  `,
})
class Host {
  readonly locked = signal(true);
  clicks = 0;
}

/** A locked form control — the inline assignee dropdown on the Tasks page. */
@Component({
  standalone: true,
  imports: [PermissionLockDirective],
  template: `
    <span class="task-assignment">
      <select
        [appLocked]="locked()"
        lockedReason="Requires the Assign task permission."
        (change)="changes = changes + 1"
      >
        <option value="" selected>Unassigned</option>
        <option value="7">Shubham Kashyap</option>
      </select>
    </span>
  `,
})
class SelectHost {
  readonly locked = signal(true);
  changes = 0;
}

describe('PermissionLockDirective', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  it('marks a locked action disabled and badges it', () => {
    expect(button.classList).toContain('is-permission-locked');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('title')).toBe('Requires the Manage tasks permission.');
    expect(button.querySelector('.permission-lock-badge')).toBeTruthy();
  });

  it('swallows the click so the handler never runs', () => {
    button.click();
    expect(host.clicks).toBe(0);
  });

  it('restores the action when the permission is granted', () => {
    host.locked.set(false);
    fixture.detectChanges();

    expect(button.classList).not.toContain('is-permission-locked');
    expect(button.hasAttribute('aria-disabled')).toBeFalse();
    expect(button.hasAttribute('title')).toBeFalse();
    expect(button.querySelector('.permission-lock-badge')).toBeNull();

    button.click();
    expect(host.clicks).toBe(1);
  });
});

/**
 * A select is the case the button treatment does not cover: it opens on
 * `mousedown` rather than `click`, and only `<option>` may live inside it,
 * so the badge has to go beside it. Before this, a member without
 * `AssignTask` could pick a name, see the row change, and learn it had
 * been refused from a toast afterwards.
 */
describe('PermissionLockDirective on a form control', () => {
  let fixture: ComponentFixture<SelectHost>;
  let host: SelectHost;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectHost] }).compileComponents();
    fixture = TestBed.createComponent(SelectHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    select = fixture.nativeElement.querySelector('select');
  });

  it('badges the wrapper rather than the select, which may only hold options', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.task-assignment');

    expect(select.classList).toContain('is-permission-locked');
    expect(select.getAttribute('aria-disabled')).toBe('true');
    expect(select.querySelector('.permission-lock-badge')).toBeNull();
    expect(wrapper.classList).toContain('has-permission-lock');
    expect(wrapper.querySelector(':scope > .permission-lock-badge')).toBeTruthy();
  });

  it('stops the mousedown that opens the list', () => {
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    select.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
  });

  it('reverts a change that slipped through and never calls the handler', () => {
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(host.changes).toBe(0);
    expect(select.selectedIndex).toBe(0);
  });

  it('hands the control back when the permission is granted', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.task-assignment');

    host.locked.set(false);
    fixture.detectChanges();

    expect(select.classList).not.toContain('is-permission-locked');
    expect(wrapper.classList).not.toContain('has-permission-lock');
    expect(wrapper.querySelector('.permission-lock-badge')).toBeNull();

    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(host.changes).toBe(1);
    expect(select.selectedIndex).toBe(1);
  });
});
