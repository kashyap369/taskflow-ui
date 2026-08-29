declare module 'frappe-gantt' {
  export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    custom_class?: string;
    calendarItem?: import('../app/features/organization/calendar-page/calendar-page.model').CalendarItem;
  }

  export interface GanttOptions {
    view_mode?: string;
    view_modes?: string[];
    view_mode_select?: boolean;
    readonly?: boolean;
    readonly_dates?: boolean;
    readonly_progress?: boolean;
    scroll_to?: string;
    popup?: ((context: unknown) => void) | false;
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
  }

  export default class Gantt {
    constructor(wrapper: HTMLElement | SVGElement | string, tasks: GanttTask[], options?: GanttOptions);
    update_options(options: GanttOptions): void;
  }
}
