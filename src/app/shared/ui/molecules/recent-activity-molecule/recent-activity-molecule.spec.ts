import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentActivityMolecule } from './recent-activity-molecule';

describe('RecentActivityMolecule', () => {
  let component: RecentActivityMolecule;
  let fixture: ComponentFixture<RecentActivityMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivityMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivityMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Recent activity',
      items: [
        { actor: 'Sofia Reyes', action: 'completed task', target: 'Schema design', time: '12m ago', type: 'completed' },
        { actor: 'Liam Chen', action: 'commented on', target: 'Audit color tokens', time: '32m ago', type: 'commented' },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve preset icons and colors per activity type', () => {
    const [completed] = component.items();
    expect(completed.resolvedColor).toBe('#10B981');
    expect(completed.resolvedIcon).toBeTruthy();
  });

  it('should derive initials from the actor name', () => {
    expect(component.items()[0].initials).toBe('SR');
  });

  it('should emit the item on click', () => {
    let emitted: string | undefined;
    component.itemClick.subscribe((item) => (emitted = item.actor));

    component.onItemClick(component.config.items[1]);

    expect(emitted).toBe('Liam Chen');
  });

  it('should emit on action click', () => {
    let clicked = false;
    component.actionClick.subscribe(() => (clicked = true));

    component.onActionClick();

    expect(clicked).toBeTrue();
  });
});
