import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectOverviewMolecule } from './project-overview-molecule';

describe('ProjectOverviewMolecule', () => {
  let component: ProjectOverviewMolecule;
  let fixture: ComponentFixture<ProjectOverviewMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectOverviewMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectOverviewMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Project health overview',
      items: [
        { name: 'Atlas Design System', meta: '57/84 tasks · due Aug 14', progress: 68, status: 'on-track' },
        { name: 'Billing Migration', meta: '13/48 tasks · due Jun 28', progress: 28, status: 'delayed' },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve status label and colors from the preset', () => {
    const [atlas] = component.items();
    expect(atlas.resolvedLabel).toBe('On Track');
    expect(atlas.resolvedColor).toBe('#059669');
    expect(atlas.hasDot).toBeTrue();
  });

  it('should clamp progress into 0–100', () => {
    component.config = {
      items: [{ name: 'Over', progress: 140, status: 'on-track' }],
    };
    expect(component.items()[0].clampedProgress).toBe(100);
  });

  it('should split visible and overflow avatars by maxAvatars', () => {
    component.config = {
      maxAvatars: 2,
      items: [
        {
          name: 'Team',
          progress: 50,
          members: [{ initials: 'A' }, { initials: 'B' }, { initials: 'C' }, { initials: 'D' }],
        },
      ],
    };
    const [item] = component.items();
    expect(item.visibleMembers.length).toBe(2);
    expect(item.extraMembers).toBe(2);
  });

  it('should emit the project on click', () => {
    let emitted: string | undefined;
    component.projectClick.subscribe((item) => (emitted = item.name));

    component.onProjectClick(component.config.items[1]);

    expect(emitted).toBe('Billing Migration');
  });

  it('should emit on action click', () => {
    let clicked = false;
    component.actionClick.subscribe(() => (clicked = true));

    component.onActionClick();

    expect(clicked).toBeTrue();
  });
});
