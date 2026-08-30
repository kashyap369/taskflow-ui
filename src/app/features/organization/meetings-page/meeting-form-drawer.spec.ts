import { TestBed } from '@angular/core/testing';
import { MeetingFormDrawer } from './meeting-form-drawer';

describe('MeetingFormDrawer', () => {
  it('blocks an incomplete schedule and emits normalized UTC values when valid', () => {
    const fixture = TestBed.configureTestingModule({ imports: [MeetingFormDrawer] }).createComponent(MeetingFormDrawer);
    const component = fixture.componentInstance; const save = jasmine.createSpy('save'); component.save.subscribe(save);
    component.form.patchValue({ title: 'Delivery review', scheduled: true, start: '2026-09-02T09:00', end: '' });
    component.submit(); expect(save).not.toHaveBeenCalled(); expect(component.scheduleError()).toContain('start and end');
    component.form.patchValue({ end: '2026-09-02T09:45', timeZone: 'Asia/Calcutta' }); component.submit();
    expect(save).toHaveBeenCalled();
    expect(save.calls.mostRecent().args[0].scheduledStartUtc).toBe('2026-09-02T03:30:00.000Z');
    expect(save.calls.mostRecent().args[0].scheduledEndUtc).toBe('2026-09-02T04:15:00.000Z');
    component.form.patchValue({ start: '2026-03-08T02:30', end: '2026-03-08T03:30', timeZone: 'America/New_York' });
    component.submit();
    expect(save).toHaveBeenCalledTimes(1);
    expect(component.scheduleError()).toContain('daylight saving');
  });
});
