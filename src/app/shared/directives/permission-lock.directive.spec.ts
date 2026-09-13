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
