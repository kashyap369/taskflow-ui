import { TestBed } from '@angular/core/testing';
import { CalendarEntryDrawer } from './calendar-entry-drawer';
describe('CalendarEntryDrawer', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({ imports: [CalendarEntryDrawer] }).compileComponents();
    const fixture = TestBed.createComponent(CalendarEntryDrawer);
    fixture.componentRef.setInput('members', []); fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
