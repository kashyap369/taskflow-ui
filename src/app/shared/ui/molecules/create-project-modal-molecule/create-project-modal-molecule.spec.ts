import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectModalMolecule } from './create-project-modal-molecule';

describe('CreateProjectModalMolecule', () => {
  let component: CreateProjectModalMolecule;
  let fixture: ComponentFixture<CreateProjectModalMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectModalMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModalMolecule);
    component = fixture.componentInstance;
    component.config = {
      statusOptions: [
        { label: 'On Track', value: 'on-track' },
        { label: 'At Risk', value: 'at-risk' },
      ],
      accentColors: ['#6D5DF6', '#3B82F6'],
      initialStatus: 'at-risk',
      initialAccent: '#3B82F6',
      teamOptions: [{ name: 'Avery Mitchell' }, { name: 'Liam Chen', id: 'liam' }],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply initial status and accent from config', () => {
    expect(component.status()).toBe('at-risk');
    expect(component.accentColor()).toBe('#3B82F6');
  });

  it('should toggle team members on and off', () => {
    const avery = { name: 'Avery Mitchell' };
    expect(component.isSelected(avery)).toBeFalse();

    component.toggleMember(avery);
    expect(component.isSelected(avery)).toBeTrue();

    component.toggleMember(avery);
    expect(component.isSelected(avery)).toBeFalse();
  });

  it('should derive initials from the member name', () => {
    expect(component.initials({ name: 'Avery Mitchell' })).toBe('AM');
  });

  it('should emit the assembled value on create', () => {
    let value: { status: string; accentColor: string; team: string[] } | undefined;
    component.create.subscribe((v) => (value = v));

    component.name.set('New Project');
    component.toggleMember({ name: 'Liam Chen', id: 'liam' });
    component.onCreate();

    expect(value?.status).toBe('at-risk');
    expect(value?.accentColor).toBe('#3B82F6');
    expect(value?.team).toEqual(['liam']);
  });

  it('should emit closed on cancel', () => {
    let closed = false;
    component.closed.subscribe(() => (closed = true));

    component.onClose();

    expect(closed).toBeTrue();
  });
});
