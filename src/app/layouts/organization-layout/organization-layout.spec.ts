import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { OrganizationLayout } from './organization-layout';

describe('OrganizationLayout', () => {
  let component: OrganizationLayout;
  let fixture: ComponentFixture<OrganizationLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationLayout],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Below 992px the sidebar is off-canvas and the header hamburger is the ONLY way to reach
  // navigation. Before Phase 6 that button had no handler at all, so the org portal had no
  // navigation on mobile whatsoever.
  describe('mobile sidebar', () => {
    it('starts closed', () => {
      expect(component.sidebarOpen()).toBeFalse();
    });

    it('toggles open and closed', () => {
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBeTrue();
      component.toggleSidebar();
      expect(component.sidebarOpen()).toBeFalse();
    });

    it('closes on backdrop click', () => {
      component.toggleSidebar();
      component.closeSidebar();
      expect(component.sidebarOpen()).toBeFalse();
    });

    it('renders the backdrop only while open', () => {
      expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeNull();

      component.toggleSidebar();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.sidebar').classList).toContain('is-open');
    });
  });
});
