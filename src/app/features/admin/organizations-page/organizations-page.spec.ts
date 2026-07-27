import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLottieOptions } from 'ngx-lottie';
import { of } from 'rxjs';

import { AdminRepository } from '../admin.repository';
import { AdminOrganization, OrganizationStatus } from '../admin.models';
import { AdminOrganizationsPage } from './organizations-page';

function org(overrides: Partial<AdminOrganization> & { id: number }): AdminOrganization {
  return {
    name: `Org ${overrides.id}`,
    description: null,
    ownerUserId: overrides.id,
    ownerFullName: 'Filler Owner',
    ownerEmail: `owner${overrides.id}@taskflow.test`,
    status: OrganizationStatus.Active,
    memberCount: 1,
    projectCount: 1,
    taskCount: 2,
    createdAt: '2026-07-01T09:00:00Z',
    ...overrides,
  };
}

const ORGANIZATIONS: AdminOrganization[] = [
  org({
    id: 1,
    name: 'Northwind Labs',
    description: 'The seeded test workspace.',
    ownerFullName: 'Nadia Owens',
    ownerEmail: 'nadia.owens+org1@taskflow.test',
    memberCount: 2,
    projectCount: 3,
    taskCount: 12,
  }),
  org({ id: 2, name: 'Contoso', status: OrganizationStatus.Suspended, projectCount: 0, taskCount: 0 }),
  ...Array.from({ length: 12 }, (_, i) => org({ id: 100 + i })),
];

describe('AdminOrganizationsPage', () => {
  let component: AdminOrganizationsPage;
  let fixture: ComponentFixture<AdminOrganizationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrganizationsPage],
      providers: [
        provideToastr(),
        provideAnimations(),
        provideLottieOptions({ player: () => import('lottie-web') }),
        {
          provide: AdminRepository,
          useValue: { getOrganizations: () => of(ORGANIZATIONS) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrganizationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads organizations and derives platform-wide stats', () => {
    expect(component.totalOrganizations()).toBe(14);
    expect(component.activeOrganizations()).toBe(13);
    // Summed across every workspace — 3 + 0 + (12 × 1) and 12 + 0 + (12 × 2).
    expect(component.totalProjects()).toBe(15);
    expect(component.totalTasks()).toBe(36);
  });

  it('searches name, owner name and owner email', () => {
    component.onSearch('northwind');
    expect(component.filteredOrganizations().length).toBe(1);

    component.onSearch('nadia');
    expect(component.filteredOrganizations()[0].id).toBe(1);

    component.onSearch('nadia.owens+org1@taskflow.test');
    expect(component.filteredOrganizations()[0].id).toBe(1);
  });

  it('filters by status', () => {
    component.onStatusFilter(String(OrganizationStatus.Suspended));
    expect(component.filteredOrganizations().length).toBe(1);
    expect(component.filteredOrganizations()[0].name).toBe('Contoso');
  });

  it('pages the filtered rows and clamps back when the source shrinks', () => {
    expect(component.pager.items().length).toBe(10);

    component.pager.setPage(2);
    expect(component.pager.items().length).toBe(4);

    component.onSearch('northwind');
    expect(component.pager.page()).toBe(1);
    expect(component.pager.items().length).toBe(1);
  });

  it('clears every filter at once', () => {
    component.onSearch('northwind');
    component.onStatusFilter(String(OrganizationStatus.Suspended));

    component.clearFilters();

    expect(component.filteredOrganizations().length).toBe(14);
  });

  // The list DTO already carries owner, counts and createdAt, so the drawer needs no second request.
  it('opens the drawer straight from the row, with no extra fetch', () => {
    component.open(ORGANIZATIONS[0]);

    expect(component.selected()?.name).toBe('Northwind Labs');
    expect(component.selected()?.ownerEmail).toBe('nadia.owens+org1@taskflow.test');

    component.close();
    expect(component.selected()).toBeNull();
  });
});
