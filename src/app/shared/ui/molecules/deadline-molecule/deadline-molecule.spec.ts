import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlineMolecule } from './deadline-molecule';

describe('DeadlineMolecule', () => {
  let component: DeadlineMolecule;
  let fixture: ComponentFixture<DeadlineMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlineMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlineMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Upcoming deadlines',
      items: [
        { title: 'Audit color tokens across web app', due: 'Due in 2d', status: 'upcoming' },
        { title: 'Stripe webhook reconciliation', due: 'Overdue by 2d', status: 'overdue' },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve preset colors per status', () => {
    const [upcoming, overdue] = component.items();
    expect(upcoming.resolvedColor).toBe('#6D5DF6');
    expect(overdue.resolvedColor).toBe('#F43F5E');
  });

  it('should fall back to the calendar icon when none is given', () => {
    expect(component.items()[0].resolvedIcon).toBe(component.defaultIcon);
  });

  it('should emit the item on click', () => {
    let emitted: string | undefined;
    component.itemClick.subscribe((item) => (emitted = item.title));

    component.onItemClick(component.config.items[1]);

    expect(emitted).toBe('Stripe webhook reconciliation');
  });

  it('should emit on action click', () => {
    let clicked = false;
    component.actionClick.subscribe(() => (clicked = true));

    component.onActionClick();

    expect(clicked).toBeTrue();
  });
});
