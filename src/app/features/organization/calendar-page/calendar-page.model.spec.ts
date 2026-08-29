import {
  OrganizationMember,
  Project,
  ProjectStatus,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  CalendarEntryKind,
  CalendarRecurrenceFrequency,
} from '../organization.models';
import {
  buildCalendarItems,
  exclusiveEnd,
  filterCalendarItems,
  inclusiveEnd,
  DEFAULT_CALENDAR_FILTERS,
  toScheduleEvents,
  toTimelineTasks,
} from './calendar-page.model';

const project: Project = {
  id: 7,
  organizationId: 2,
  title: 'Website redesign',
  description: null,
  status: ProjectStatus.Active,
  startDate: '2026-08-01T00:00:00Z',
  expectedCompletionDate: '2026-08-20T00:00:00Z',
  actualCompletionDate: null,
  createdByUserId: 1,
  taskCount: 1,
  completedTaskCount: 0,
  completionPercentage: 25,
};

const task: TaskListItem = {
  id: 18,
  title: 'Build calendar shell',
  priority: TaskPriority.High,
  status: TaskStatus.InProgress,
  startDate: '2026-08-03T09:00:00Z',
  expectedCompletionDate: '2026-08-10T17:00:00Z',
  actualCompletionDate: null,
  projectId: 7,
  organizationId: 2,
  teamId: 4,
  teamName: 'Platform',
  createdByUserId: 1,
  assignedToUserId: 12,
  subTaskCount: 4,
  completedSubTaskCount: 1,
};

const member: OrganizationMember = {
  id: 3,
  organizationId: 2,
  userId: 12,
  userFullName: 'Ada Lovelace',
  email: 'ada@example.com',
  organizationRoleId: 1,
  roleName: 'Member',
  isActive: true,
  joinedAt: '2026-01-01T00:00:00Z',
};

describe('calendar-page model adapters', () => {
  it('normalizes project and task DTOs with ownership and progress', () => {
    const items = buildCalendarItems([project], [task], [member], new Date('2026-08-11T00:00:00Z'));
    const mappedTask = items.find((item) => item.kind === 'task');

    expect(items.length).toBe(2);
    expect(mappedTask?.assignee).toBe('Ada Lovelace');
    expect(mappedTask?.team).toBe('Platform');
    expect(mappedTask?.projectTitle).toBe('Website redesign');
    expect(mappedTask?.progress).toBe(25);
    expect(mappedTask?.overdue).toBeTrue();
  });

  it('uses an exclusive all-day end for FullCalendar', () => {
    expect(exclusiveEnd('2026-08-20T18:30:00Z')).toBe('2026-08-21');
    expect(inclusiveEnd('2026-08-21')).toBe('2026-08-20');

    const [event] = toScheduleEvents(buildCalendarItems([project], [], [], new Date('2026-08-01')));
    expect(event.end).toBe('2026-08-21');
    expect(event.className).toContain('calendar-event--project');
  });

  it('applies shared project, team, member, type, status, priority and state filters', () => {
    const items = buildCalendarItems([project], [task], [member], new Date('2026-08-11'));
    const filtered = filterCalendarItems(items, {
      ...DEFAULT_CALENDAR_FILTERS,
      projectId: 7,
      teamId: 4,
      memberId: 12,
      kind: 'task',
      statusKey: `task-${TaskStatus.InProgress}`,
      priority: TaskPriority.High,
      overdueOnly: true,
      includeCompleted: false,
    });

    expect(filtered.map((item) => item.id)).toEqual(['task-18']);
  });

  it('only makes task events editable for a manager', () => {
    const items = buildCalendarItems([project], [task], [member]);
    const events = toScheduleEvents(items, true);

    expect(events.find((event) => event.id === 'project-7')?.editable).toBeFalse();
    expect(events.find((event) => event.id === 'task-18')?.editable).toBeTrue();
  });

  it('only sends the selected project tasks to the timeline', () => {
    const otherTask = { ...task, id: 19, projectId: 99, title: 'Unrelated task' };
    const timeline = toTimelineTasks(
      buildCalendarItems([project], [task, otherTask], [member], new Date('2026-08-05')),
      7,
    );

    expect(timeline.map((item) => item.name)).toEqual(['Build calendar shell']);
    expect(timeline[0].dependencies).toBe('');
    expect(timeline[0].progress).toBe(25);
  });

  it('marks completed tasks at full progress and never overdue', () => {
    const completed = { ...task, status: TaskStatus.Completed, completedSubTaskCount: 0 };
    const mapped = buildCalendarItems([], [completed], [], new Date('2026-08-29'))[0];

    expect(mapped.progress).toBe(100);
    expect(mapped.completed).toBeTrue();
    expect(mapped.overdue).toBeFalse();
  });

  it('maps calendar-owned occurrences without making them task-editable', () => {
    const items = buildCalendarItems([], [], [member], new Date('2026-08-29'), [{
      id: 9, occurrenceId: '9:2026-09-01', organizationId: 2,
      kind: CalendarEntryKind.MemberLeave, title: 'Annual leave', description: null,
      startsAtUtc: '2026-09-01T00:00:00Z', endsAtUtc: '2026-09-03T00:00:00Z', isAllDay: true,
      timeZone: 'UTC', memberUserId: 12, memberName: 'Ada Lovelace',
      recurrenceFrequency: CalendarRecurrenceFrequency.Weekly, recurrenceInterval: 1,
      recurrenceUntil: '2026-09-15',
    }]);
    const event = toScheduleEvents(items, true)[0];

    expect(items[0].kind).toBe('leave');
    expect(items[0].assignee).toBe('Ada Lovelace');
    expect(event.end).toBe('2026-09-03');
    expect(event.editable).toBeFalse();
  });
});
