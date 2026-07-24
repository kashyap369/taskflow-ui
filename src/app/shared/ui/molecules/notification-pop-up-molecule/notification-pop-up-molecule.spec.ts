import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPopUpMolecule } from './notification-pop-up-molecule';

describe('NotificationPopUpMolecule', () => {
  let component: NotificationPopUpMolecule;
  let fixture: ComponentFixture<NotificationPopUpMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationPopUpMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPopUpMolecule);
    component = fixture.componentInstance;
    component.config = {
      items: [
        { title: 'Avery mentioned you', description: 'in Audit color tokens', time: '5m', type: 'mention', unread: true },
        { title: 'Task overdue', description: 'Stripe webhook reconciliation', time: '1h', type: 'overdue', unread: true },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve preset icons and colors per type', () => {
    const [mention] = component.items();
    expect(mention.resolvedColor).toBe('#8B5CF6');
    expect(mention.resolvedIcon).toBeTruthy();
  });

  it('should report empty when there are no items', () => {
    component.config = { items: [] };
    expect(component.isEmpty()).toBeTrue();
  });

  it('should emit the item on click', () => {
    let emitted: string | undefined;
    component.itemClick.subscribe((item) => (emitted = item.title));

    component.onItemClick(component.config.items[1]);

    expect(emitted).toBe('Task overdue');
  });

  it('should emit mark-all-read and view-all events', () => {
    let markAll = false;
    let viewAll = false;
    component.markAllRead.subscribe(() => (markAll = true));
    component.viewAll.subscribe(() => (viewAll = true));

    component.onMarkAllRead();
    component.onViewAll();

    expect(markAll).toBeTrue();
    expect(viewAll).toBeTrue();
  });
});
