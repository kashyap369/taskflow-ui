import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicHeader } from './public-header';

describe('PublicHeader', () => {
  let component: PublicHeader;
  let fixture: ComponentFixture<PublicHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHeader],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // This menu was driven by Bootstrap's `data-bs-toggle="collapse"`, but the project loads no
  // Bootstrap JS (angular.json → scripts: []), so it never opened. Now signal-driven — Phase 6.
  describe('mobile menu', () => {
    it('starts closed', () => {
      expect(component.menuOpen()).toBeFalse();
    });

    it('opens and closes from the toggle', () => {
      const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.navbar-toggler');
      toggle.click();
      fixture.detectChanges();
      expect(component.menuOpen()).toBeTrue();
      expect(fixture.nativeElement.querySelector('.navbar-collapse').classList).toContain('is-open');
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      toggle.click();
      fixture.detectChanges();
      expect(component.menuOpen()).toBeFalse();
    });

    it('closes when a nav link is followed', () => {
      component.toggleMenu();
      fixture.detectChanges();

      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.nav-link');
      link.addEventListener('click', (event) => event.preventDefault(), { once: true });
      link.click();
      fixture.detectChanges();

      expect(component.menuOpen()).toBeFalse();
    });
  });
});
