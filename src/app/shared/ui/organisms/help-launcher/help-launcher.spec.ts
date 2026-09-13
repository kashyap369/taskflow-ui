import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HelpLauncher } from './help-launcher';

/**
 * Covers only the part of the launcher that moves. The teaser, the menu
 * and the tour wiring are exercised through the guidance service's own
 * specs; what is new here is that the button can be parked in any corner
 * and stays where it was put.
 */
describe('HelpLauncher position', () => {
  let launcher: HelpLauncher;

  beforeEach(() => {
    localStorage.removeItem('taskflow.help.corner');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        // The launcher injects its own host to close the menu on an
        // outside click; nothing under test here reads it.
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
      ],
    });
    launcher = TestBed.runInInjectionContext(() => new HelpLauncher());
  });

  afterEach(() => localStorage.removeItem('taskflow.help.corner'));

  function internals(): {
    nearestCorner: (x: number, y: number) => string;
    setCorner: (corner: string) => void;
  } {
    const value = launcher as unknown as {
      nearestCorner: (x: number, y: number) => string;
      setCorner: (corner: string) => void;
    };

    return {
      nearestCorner: value.nearestCorner.bind(launcher),
      setCorner: value.setCorner.bind(launcher),
    };
  }

  it('starts in the bottom-right corner', () => {
    expect(launcher.corner()).toBe('bottom-right');
  });

  it('snaps to whichever corner the button was released nearest', () => {
    const { nearestCorner } = internals();
    const width = window.innerWidth;
    const height = window.innerHeight;

    expect(nearestCorner(width * 0.1, height * 0.1)).toBe('top-left');
    expect(nearestCorner(width * 0.9, height * 0.1)).toBe('top-right');
    expect(nearestCorner(width * 0.1, height * 0.9)).toBe('bottom-left');
    expect(nearestCorner(width * 0.9, height * 0.9)).toBe('bottom-right');
  });

  it('remembers the corner it was moved to', () => {
    internals().setCorner('top-left');

    const reopened = TestBed.runInInjectionContext(() => new HelpLauncher());

    expect(reopened.corner()).toBe('top-left');
  });

  it('ignores a stored value that is not a corner', () => {
    localStorage.setItem('taskflow.help.corner', 'somewhere-else');

    const reopened = TestBed.runInInjectionContext(() => new HelpLauncher());

    expect(reopened.corner()).toBe('bottom-right');
  });

  // Alt is what separates "move the button" from the bare arrow keys a
  // screen-reader user navigates the page with.
  it('moves between corners on Alt+Arrow, and ignores a bare arrow', () => {
    launcher.onFabKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true }));
    expect(launcher.corner()).toBe('top-right');

    launcher.onFabKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
    expect(launcher.corner()).toBe('top-left');

    launcher.onFabKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(launcher.corner()).toBe('top-left');
  });

  it('exposes the corner as a class so the popover can flip with it', () => {
    internals().setCorner('top-left');

    expect(launcher.launcherClass()['is-top-left']).toBeTrue();
    expect(launcher.launcherClass()['is-dragging']).toBeFalse();
  });
});
