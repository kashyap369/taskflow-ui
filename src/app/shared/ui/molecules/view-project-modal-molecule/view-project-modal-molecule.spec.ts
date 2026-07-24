import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjectModalMolecule } from './view-project-modal-molecule';

describe('ViewProjectModalMolecule', () => {
  let component: ViewProjectModalMolecule;
  let fixture: ComponentFixture<ViewProjectModalMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProjectModalMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewProjectModalMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Atlas Design System',
      subtitle: 'Unified component library across web and mobile.',
      progress: 68,
      stats: [
        { label: 'PROGRESS', value: '68%' },
        { label: 'STATUS', value: 'On Track' },
      ],
      team: [{ name: 'Avery Mitchell' }, { name: 'Ethan Brooks' }],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clamp progress into 0–100', () => {
    component.config = { title: 'X', progress: 150 };
    expect(component.clampedProgress()).toBe(100);
  });

  it('should derive initials from the member name', () => {
    expect(component.initials({ name: 'Avery Mitchell' })).toBe('AM');
  });

  it('should prefer explicit initials when provided', () => {
    expect(component.initials({ name: 'Avery Mitchell', initials: 'AV' })).toBe('AV');
  });

  it('should emit closed on close', () => {
    let closed = false;
    component.closed.subscribe(() => (closed = true));

    component.onClose();

    expect(closed).toBeTrue();
  });

  it('should emit confirm on primary action', () => {
    let confirmed = false;
    component.confirm.subscribe(() => (confirmed = true));

    component.onConfirm();

    expect(confirmed).toBeTrue();
  });
});
