import {
  OrganizationMember,
  CalendarEntry,
  CalendarEntryKind,
  Project,
  ProjectStatus,
  TaskListItem,
  TaskStatus,
  projectStatusMeta,
  taskPriorityMeta,
  taskStatusMeta,
} from '../organization.models';

export type CalendarItemKind = 'project' | 'task' | 'event' | 'leave' | 'holiday';

export interface CalendarItem {
  id: string;
  sourceId: number;
  kind: CalendarItemKind;
  title: string;
  start: string;
  end: string;
  status: string;
  assignee: string;
  team: string;
  projectId: number | null;
  projectTitle: string;
  progress: number;
  overdue: boolean;
  completed: boolean;
  statusKey: string;
  priority: number | null;
  priorityLabel: string;
  teamId: number | null;
  assignedToUserId: number | null;
  calendarEntry: CalendarEntry | null;
  allDay: boolean;
}

export interface CalendarFilters {
  projectId: number | null;
  teamId: number | null;
  memberId: number | null;
  kind: 'all' | CalendarItemKind;
  statusKey: string;
  priority: number | null;
  overdueOnly: boolean;
  includeCompleted: boolean;
}

export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  projectId: null,
  teamId: null,
  memberId: null,
  kind: 'all',
  statusKey: '',
  priority: null,
  overdueOnly: false,
  includeCompleted: true,
};

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  className: string;
  extendedProps: { item: CalendarItem };
  editable: boolean;
  startEditable: boolean;
  durationEditable: boolean;
}

export interface TimelineTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  custom_class: string;
  calendarItem: CalendarItem;
}

const dateOnly = (value: string): string => value.slice(0, 10);

/** FullCalendar treats an all-day end as exclusive, so add one day to keep the due date visible. */
export function exclusiveEnd(value: string): string {
  const date = new Date(`${dateOnly(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function taskProgress(task: TaskListItem): number {
  if (task.status === TaskStatus.Completed) {
    return 100;
  }
  if (task.subTaskCount === 0) {
    return 0;
  }
  return Math.round((task.completedSubTaskCount / task.subTaskCount) * 100);
}

/** Convert API DTOs into TaskFlow-owned calendar records before either library sees the data. */
export function buildCalendarItems(
  projects: Project[],
  tasks: TaskListItem[],
  members: OrganizationMember[],
  today = new Date(),
  entries: CalendarEntry[] = [],
): CalendarItem[] {
  const memberNames = new Map(members.map((member) => [member.userId, member.userFullName]));
  const projectNames = new Map(projects.map((project) => [project.id, project.title]));
  const todayKey = today.toISOString().slice(0, 10);

  const projectItems: CalendarItem[] = projects.map((project) => {
    const completed = project.status === ProjectStatus.Completed;
    const plannedEnd = dateOnly(project.expectedCompletionDate ?? project.startDate);
    return {
      id: `project-${project.id}`,
      sourceId: project.id,
      kind: 'project',
      title: project.title,
      start: dateOnly(project.startDate),
      end: plannedEnd,
      status: projectStatusMeta(project.status).label,
      assignee: 'Project team',
      team: 'All teams',
      projectId: project.id,
      projectTitle: project.title,
      progress: Math.round(project.completionPercentage),
      overdue: !completed && plannedEnd < todayKey,
      completed,
      statusKey: `project-${project.status}`,
      priority: null,
      priorityLabel: 'No priority',
      teamId: null,
      assignedToUserId: null,
      calendarEntry: null,
      allDay: true,
    };
  });

  const taskItems: CalendarItem[] = tasks.map((task) => {
    const completed = task.status === TaskStatus.Completed;
    const plannedEnd = dateOnly(task.expectedCompletionDate ?? task.startDate);
    const priority = taskPriorityMeta(task.priority).label;
    return {
      id: `task-${task.id}`,
      sourceId: task.id,
      kind: 'task',
      title: task.title,
      start: dateOnly(task.startDate),
      end: plannedEnd,
      status: `${taskStatusMeta(task.status).label} · ${priority}`,
      assignee:
        task.assignedToUserId == null
          ? 'Unassigned'
          : (memberNames.get(task.assignedToUserId) ?? 'Unknown member'),
      team: task.teamName ?? 'No team',
      projectId: task.projectId,
      projectTitle:
        task.projectId == null ? 'No project' : (projectNames.get(task.projectId) ?? 'Unknown project'),
      progress: taskProgress(task),
      overdue: !completed && plannedEnd < todayKey,
      completed,
      statusKey: `task-${task.status}`,
      priority: task.priority,
      priorityLabel: priority,
      teamId: task.teamId,
      assignedToUserId: task.assignedToUserId,
      calendarEntry: null,
      allDay: true,
    };
  });

  const entryItems: CalendarItem[] = entries.map((entry) => {
    const kind = entry.kind === CalendarEntryKind.OrganizationEvent ? 'event'
      : entry.kind === CalendarEntryKind.MemberLeave ? 'leave' : 'holiday';
    return {
      id: `calendar-${entry.occurrenceId}`, sourceId: entry.id, kind, title: entry.title,
      start: entry.isAllDay ? dateOnly(entry.startsAtUtc) : entry.startsAtUtc,
      end: entry.isAllDay ? dateOnly(entry.endsAtUtc) : entry.endsAtUtc,
      status: kind === 'event' ? 'Organization event'
        : kind === 'leave' ? 'Member leave' : 'Holiday',
      assignee: entry.memberName ?? 'Everyone', team: 'Organization-wide', projectId: null,
      projectTitle: entry.description ?? 'Calendar-owned entry', progress: 0, overdue: false,
      completed: false, statusKey: `calendar-${kind}`, priority: null, priorityLabel: 'No priority',
      teamId: null, assignedToUserId: entry.memberUserId, calendarEntry: entry, allDay: entry.isAllDay,
    };
  });

  return [...projectItems, ...taskItems, ...entryItems];
}

export function filterCalendarItems(
  items: CalendarItem[],
  filters: CalendarFilters,
): CalendarItem[] {
  return items.filter(
    (item) =>
      (filters.projectId == null || item.projectId === filters.projectId) &&
      (filters.teamId == null || item.teamId === filters.teamId) &&
      (filters.memberId == null || item.assignedToUserId === filters.memberId) &&
      (filters.kind === 'all' || item.kind === filters.kind) &&
      (!filters.statusKey || item.statusKey === filters.statusKey) &&
      (filters.priority == null || item.priority === filters.priority) &&
      (!filters.overdueOnly || item.overdue) &&
      (filters.includeCompleted || !item.completed),
  );
}

export function toScheduleEvents(items: CalendarItem[], canManageTasks = false): ScheduleEvent[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    start: item.start,
    end: item.calendarEntry ? item.end : exclusiveEnd(item.end),
    allDay: item.allDay,
    className: [
      `calendar-event--${item.kind}`,
      item.completed ? 'calendar-event--completed' : '',
      item.overdue ? 'calendar-event--overdue' : '',
    ]
      .filter(Boolean)
      .join(' '),
    extendedProps: { item },
    editable: canManageTasks && item.kind === 'task',
    startEditable: canManageTasks && item.kind === 'task',
    durationEditable: canManageTasks && item.kind === 'task',
  }));
}

/** Convert FullCalendar's exclusive all-day end back to TaskFlow's inclusive due date. */
export function inclusiveEnd(value: string): string {
  const date = new Date(`${dateOnly(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function toTimelineTasks(items: CalendarItem[], projectId: number): TimelineTask[] {
  return items
    .filter((item) => item.kind === 'task' && item.projectId === projectId)
    .map((item) => ({
      id: item.id,
      name: item.title,
      start: item.start,
      end: item.end,
      progress: item.progress,
      dependencies: '',
      custom_class: item.completed
        ? 'gantt-task--completed'
        : item.overdue
          ? 'gantt-task--overdue'
          : 'gantt-task--active',
      calendarItem: item,
    }));
}
