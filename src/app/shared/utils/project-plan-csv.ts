import { ProjectPlanImportPayload, ProjectPlanTaskPayload, TaskPriority } from '@features/organization/organization.models';

export interface ProjectPlanPreview {
  payload: ProjectPlanImportPayload;
  fileName: string;
  taskCount: number;
  subTaskCount: number;
}

const COLUMNS = [
  'Row Type',
  'Task Key',
  'Project Title',
  'Project Description',
  'Project Start Date',
  'Project Target Date',
  'Task Title',
  'Task Description',
  'Task Start Date',
  'Task Due Date',
  'Priority',
  'Estimate Minutes',
  'Team Name',
  'Assignee Email',
  'Subtask Title',
] as const;

const priorityByName: Record<string, TaskPriority> = {
  low: TaskPriority.Low,
  medium: TaskPriority.Medium,
  high: TaskPriority.High,
  critical: TaskPriority.Critical,
};

export function downloadProjectPlanTemplate(personal: boolean): void {
  const today = new Date();
  const start = formatDate(today);
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + 30);
  const target = formatDate(targetDate);

  const rows: string[][] = [
    [...COLUMNS],
    ['PROJECT', '', personal ? 'My project plan' : 'Website launch', 'Replace this example with the project objective and scope.', start, target, '', '', '', '', '', '', '', '', ''],
    ['TASK', 'T-001', '', '', '', '', 'Discovery and requirements', 'Confirm scope, users, dependencies, and success criteria.', start, addDays(start, 5), 'High', '480', '', '', ''],
    ['SUBTASK', 'T-001', '', '', '', '', '', '', '', '', '', '', '', '', 'Run the kickoff meeting'],
    ['SUBTASK', 'T-001', '', '', '', '', '', '', '', '', '', '', '', '', 'Document requirements'],
    ['TASK', 'T-002', '', '', '', '', 'Design and implementation', 'Create and deliver the approved solution.', addDays(start, 6), target, 'Medium', '2400', '', '', ''],
    ['SUBTASK', 'T-002', '', '', '', '', '', '', '', '', '', '', '', '', 'Prepare the first draft'],
    ['SUBTASK', 'T-002', '', '', '', '', '', '', '', '', '', '', '', '', 'Review and finalize'],
  ];

  const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = personal ? 'taskflow-personal-project-plan.csv' : 'taskflow-organization-project-plan.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function parseProjectPlanFile(file: File): Promise<ProjectPlanPreview> {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('Choose a .csv project plan downloaded from TaskFlow.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('The project plan must be 5 MB or smaller.');
  }

  const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('The project plan is empty.');

  const headers = rows[0].map((value) => value.trim());
  const missing = COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}.`);
  const column = Object.fromEntries(headers.map((header, index) => [header, index]));
  const value = (row: string[], name: (typeof COLUMNS)[number]) => (row[column[name]] ?? '').trim();
  const populated = rows.slice(1).map((row, index) => ({ row, line: index + 2 })).filter(({ row }) => row.some((cell) => cell.trim()));
  const projectRows = populated.filter(({ row }) => value(row, 'Row Type').toUpperCase() === 'PROJECT');
  if (projectRows.length !== 1) throw new Error('The file must contain exactly one PROJECT row.');

  const projectRow = projectRows[0];
  const title = required(value(projectRow.row, 'Project Title'), projectRow.line, 'Project Title');
  const startDate = readDate(value(projectRow.row, 'Project Start Date'), projectRow.line, 'Project Start Date');
  const projectTarget = optionalDate(value(projectRow.row, 'Project Target Date'), projectRow.line, 'Project Target Date');
  if (projectTarget && projectTarget <= startDate) {
    throw new Error(`Line ${projectRow.line}: Project Target Date must be after Project Start Date.`);
  }

  const taskMap = new Map<string, ProjectPlanTaskPayload>();
  for (const item of populated) {
    const type = value(item.row, 'Row Type').toUpperCase();
    if (!['PROJECT', 'TASK', 'SUBTASK'].includes(type)) {
      throw new Error(`Line ${item.line}: Row Type must be PROJECT, TASK, or SUBTASK.`);
    }
    if (type !== 'TASK') continue;

    const key = required(value(item.row, 'Task Key'), item.line, 'Task Key');
    const normalizedKey = key.toLowerCase();
    if (taskMap.has(normalizedKey)) throw new Error(`Line ${item.line}: duplicate Task Key '${key}'.`);
    const priorityName = required(value(item.row, 'Priority'), item.line, 'Priority').toLowerCase();
    const priority = priorityByName[priorityName];
    if (!priority) throw new Error(`Line ${item.line}: Priority must be Low, Medium, High, or Critical.`);
    const estimateText = value(item.row, 'Estimate Minutes');
    const estimateMinutes = estimateText === '' ? null : Number(estimateText);
    if (estimateMinutes !== null && (!Number.isInteger(estimateMinutes) || estimateMinutes < 0)) {
      throw new Error(`Line ${item.line}: Estimate Minutes must be a whole number of zero or more.`);
    }

    const taskStartDate = readDate(value(item.row, 'Task Start Date'), item.line, 'Task Start Date');
    const taskDueDate = optionalDate(value(item.row, 'Task Due Date'), item.line, 'Task Due Date');
    if (taskDueDate && taskDueDate <= taskStartDate) {
      throw new Error(`Line ${item.line}: Task Due Date must be after Task Start Date.`);
    }
    if (taskStartDate < startDate || (projectTarget && (taskDueDate ?? taskStartDate) > projectTarget)) {
      throw new Error(`Line ${item.line}: task dates must fit inside the project date range.`);
    }

    taskMap.set(normalizedKey, {
      key,
      title: required(value(item.row, 'Task Title'), item.line, 'Task Title'),
      description: value(item.row, 'Task Description'),
      startDate: taskStartDate,
      expectedCompletionDate: taskDueDate,
      priority,
      estimateMinutes,
      teamName: value(item.row, 'Team Name') || null,
      assigneeEmail: value(item.row, 'Assignee Email') || null,
      subTasks: [],
    });
  }
  if (!taskMap.size) throw new Error('Add at least one TASK row to the project plan.');
  if (taskMap.size > 500) throw new Error('A project plan can contain at most 500 tasks.');

  for (const item of populated) {
    if (value(item.row, 'Row Type').toUpperCase() !== 'SUBTASK') continue;
    const key = required(value(item.row, 'Task Key'), item.line, 'Task Key');
    const task = taskMap.get(key.toLowerCase());
    if (!task) throw new Error(`Line ${item.line}: no TASK row exists for key '${key}'.`);
    const subTaskTitle = required(value(item.row, 'Subtask Title'), item.line, 'Subtask Title');
    if (task.subTasks.some((existing) => existing.toLowerCase() === subTaskTitle.toLowerCase())) {
      throw new Error(`Line ${item.line}: subtask '${subTaskTitle}' is duplicated for '${key}'.`);
    }
    task.subTasks.push(subTaskTitle);
  }

  const tasks = [...taskMap.values()];
  const subTaskCount = tasks.reduce((total, task) => total + task.subTasks.length, 0);
  if (subTaskCount > 5000) throw new Error('A project plan can contain at most 5,000 subtasks.');
  return {
    fileName: file.name,
    taskCount: tasks.length,
    subTaskCount,
    payload: {
      title,
      description: value(projectRow.row, 'Project Description'),
      startDate,
      expectedCompletionDate: projectTarget,
      tasks,
    },
  };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted value.');
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function required(value: string, line: number, column: string): string {
  if (!value) throw new Error(`Line ${line}: ${column} is required.`);
  return value;
}

function readDate(value: string, line: number, column: string): string {
  let year: number;
  let month: number;
  let day: number;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const dayFirstMatch = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(value);
  if (isoMatch) {
    [, year, month, day] = isoMatch.map(Number);
  } else if (dayFirstMatch) {
    [, day, month, year] = dayFirstMatch.map(Number);
  } else {
    throw new Error(`Line ${line}: ${column} must use YYYY-MM-DD or DD/MM/YYYY.`);
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Line ${line}: ${column} is not a valid calendar date.`);
  }
  return date.toISOString();
}

function optionalDate(value: string, line: number, column: string): string | null {
  return value ? readDate(value, line, column) : null;
}

function escapeCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}
