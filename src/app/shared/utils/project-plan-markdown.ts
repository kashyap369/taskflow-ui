/**
 * Markdown project-plan import.
 *
 * The CSV template is precise but slow to produce — especially for an assistant, which writes
 * Markdown far more cheaply and reliably than a spreadsheet. This parser accepts the same project
 * hierarchy written as headings and bullets and produces the identical
 * {@link ProjectPlanImportPayload} the CSV path produces, so the API contract is unchanged.
 *
 * It is deliberately forgiving: everything it does not recognise is ignored rather than rejected.
 * That is what lets the downloaded template carry its own instructions — the reader drops them
 * (HTML comments, fenced code, quotes, and instruction-titled sections are all skipped), so a user
 * who leaves the guidance in the file still gets exactly the project they wrote underneath it.
 */
import {
  ProjectPlanImportPayload,
  ProjectPlanPreview,
  ProjectPlanTaskPayload,
  TaskPriority,
} from '@shared/models/project-plan.model';

const priorityByName: Record<string, TaskPriority> = {
  low: TaskPriority.Low,
  medium: TaskPriority.Medium,
  normal: TaskPriority.Medium,
  high: TaskPriority.High,
  critical: TaskPriority.Critical,
  urgent: TaskPriority.Critical,
};

/** Field bullets a task (or the project) may carry, mapped to their canonical name. */
const FIELD_ALIASES: Record<string, string> = {
  key: 'key',
  id: 'key',
  'task key': 'key',
  start: 'start',
  starts: 'start',
  'start date': 'start',
  begins: 'start',
  due: 'due',
  'due date': 'due',
  end: 'due',
  'end date': 'due',
  target: 'due',
  'target date': 'due',
  deadline: 'due',
  'expected completion': 'due',
  'expected completion date': 'due',
  priority: 'priority',
  estimate: 'estimate',
  'estimate minutes': 'estimate',
  effort: 'estimate',
  team: 'team',
  'team name': 'team',
  assignee: 'assignee',
  'assignee email': 'assignee',
  'assigned to': 'assignee',
  owner: 'assignee',
  description: 'description',
  summary: 'description',
  objective: 'description',
};

/** Section headings the reader treats as guidance and skips entirely. */
const INSTRUCTION_HEADINGS = [
  'instruction',
  'instructions',
  'how to use',
  'how to use this template',
  'notes',
  'note',
  'guidance',
  'rules',
  'reference',
  'legend',
  'example',
  'examples',
  'template guide',
  'read me',
  'readme',
];

const SUBTASK_HEADINGS = ['subtask', 'subtasks', 'sub-tasks', 'sub tasks', 'steps', 'checklist'];

interface Heading {
  level: number;
  text: string;
}

export async function parseProjectPlanMarkdownFile(file: File): Promise<ProjectPlanPreview> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('The project plan must be 5 MB or smaller.');
  }
  return parseProjectPlanMarkdown(await file.text(), file.name);
}

export function parseProjectPlanMarkdown(text: string, fileName: string): ProjectPlanPreview {
  const lines = stripNonContent(text.replace(/^\uFEFF/, '')).split('\n');

  let project: { title: string; descriptionLines: string[]; fields: Map<string, string> } | null = null;
  const tasks: {
    title: string;
    descriptionLines: string[];
    fields: Map<string, string>;
    subTasks: string[];
  }[] = [];

  let projectLevel = 0;
  let taskLevel = 0;
  /** 'skip' while inside an instruction section, otherwise where the following lines belong. */
  let mode: 'preamble' | 'project' | 'task' | 'subtasks' | 'skip' = 'preamble';
  let skipLevel = 0;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = readHeading(line);

    if (heading) {
      if (mode === 'skip' && heading.level > skipLevel) continue;
      const title = stripLabel(heading.text);

      if (isInstructionHeading(title)) {
        mode = 'skip';
        skipLevel = heading.level;
        continue;
      }

      if (!project) {
        // The first non-instruction heading names the project, whatever level it uses.
        project = { title, descriptionLines: [], fields: new Map() };
        projectLevel = heading.level;
        mode = 'project';
        continue;
      }

      if (isSubtaskHeading(title) && tasks.length) {
        mode = 'subtasks';
        continue;
      }

      if (heading.level <= projectLevel) {
        // A second top-level heading is another document section, not a second project.
        mode = 'skip';
        skipLevel = heading.level;
        continue;
      }

      if (!taskLevel) taskLevel = heading.level;
      if (heading.level > taskLevel && tasks.length) {
        // Deeper than a task heading and not named "Subtasks" — treat its bullets as subtasks.
        mode = 'subtasks';
        continue;
      }

      tasks.push({ title, descriptionLines: [], fields: new Map(), subTasks: [] });
      mode = 'task';
      continue;
    }

    if (mode === 'skip' || !line.trim()) continue;

    const target = mode === 'project' ? project : tasks[tasks.length - 1];
    if (!target) continue;

    const bullet = readBullet(line);
    if (bullet !== null) {
      const field = readField(bullet);
      if (field && mode !== 'subtasks') {
        target.fields.set(field.name, field.value);
        continue;
      }
      if (mode === 'project') continue; // A loose bullet under the project is prose, not a task.
      if (bullet.trim()) tasks[tasks.length - 1].subTasks.push(bullet.trim());
      continue;
    }

    if (mode === 'subtasks') continue; // Stray prose between checklist items.
    target.descriptionLines.push(line.trim());
  }

  if (!project) {
    throw new Error('Add a top-level heading with the project name, for example "# Website launch".');
  }
  if (!project.title) throw new Error('The project heading must contain the project name.');
  if (!tasks.length) throw new Error('Add at least one task heading, for example "## Discovery".');
  if (tasks.length > 500) throw new Error('A project plan can contain at most 500 tasks.');

  const startDate = project.fields.has('start')
    ? readDate(project.fields.get('start')!, 'the project start date')
    : todayIso();
  const projectTarget = project.fields.has('due')
    ? readDate(project.fields.get('due')!, 'the project target date')
    : null;
  if (projectTarget && projectTarget <= startDate) {
    throw new Error('The project target date must be after the project start date.');
  }

  const seenKeys = new Set<string>();
  const seenTitles = new Set<string>();
  const payloadTasks: ProjectPlanTaskPayload[] = tasks.map((task, index) => {
    if (!task.title) throw new Error(`Task ${index + 1} has no title on its heading.`);
    const where = `task "${task.title}"`;

    const titleKey = task.title.toLowerCase();
    if (seenTitles.has(titleKey)) throw new Error(`Task "${task.title}" appears more than once.`);
    seenTitles.add(titleKey);

    const key = task.fields.get('key')?.trim() || `T-${String(index + 1).padStart(3, '0')}`;
    if (seenKeys.has(key.toLowerCase())) throw new Error(`Task key "${key}" is used more than once.`);
    seenKeys.add(key.toLowerCase());

    const taskStart = task.fields.has('start')
      ? readDate(task.fields.get('start')!, `the start date of ${where}`)
      : startDate;
    const taskDue = task.fields.has('due')
      ? readDate(task.fields.get('due')!, `the due date of ${where}`)
      : null;
    if (taskDue && taskDue <= taskStart) {
      throw new Error(`The due date of ${where} must be after its start date.`);
    }
    if (taskStart < startDate || (projectTarget && (taskDue ?? taskStart) > projectTarget)) {
      throw new Error(`The dates of ${where} must fit inside the project date range.`);
    }

    const priorityText = task.fields.get('priority')?.trim().toLowerCase();
    const priority = priorityText ? priorityByName[priorityText] : TaskPriority.Medium;
    if (!priority) {
      throw new Error(`The priority of ${where} must be Low, Medium, High, or Critical.`);
    }

    const estimateText = task.fields.get('estimate')?.trim();
    const estimateMinutes = estimateText ? readEstimate(estimateText, where) : null;

    const subTasks: string[] = [];
    for (const subTask of task.subTasks) {
      if (subTasks.some((existing) => existing.toLowerCase() === subTask.toLowerCase())) {
        throw new Error(`Subtask "${subTask}" is repeated under ${where}.`);
      }
      if (subTask.length > 200) {
        throw new Error(`A subtask under ${where} is longer than 200 characters.`);
      }
      subTasks.push(subTask);
    }

    return {
      key,
      title: task.title,
      description: (task.fields.get('description') ?? task.descriptionLines.join(' ')).trim(),
      startDate: taskStart,
      expectedCompletionDate: taskDue,
      priority,
      estimateMinutes,
      teamName: task.fields.get('team')?.trim() || null,
      assigneeEmail: task.fields.get('assignee')?.trim() || null,
      subTasks,
    };
  });

  const subTaskCount = payloadTasks.reduce((total, task) => total + task.subTasks.length, 0);
  if (subTaskCount > 5000) throw new Error('A project plan can contain at most 5,000 subtasks.');

  const payload: ProjectPlanImportPayload = {
    title: project.title,
    description: (project.fields.get('description') ?? project.descriptionLines.join(' ')).trim(),
    startDate,
    expectedCompletionDate: projectTarget,
    tasks: payloadTasks,
  };

  return { payload, fileName, taskCount: payloadTasks.length, subTaskCount, format: 'Markdown' };
}

export function downloadProjectPlanMarkdownTemplate(personal: boolean): void {
  const markdown = markdownTemplate(personal, todayDate());
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = personal
    ? 'taskflow-personal-project-plan.md'
    : 'taskflow-organization-project-plan.md';
  anchor.click();
  URL.revokeObjectURL(url);
}

function markdownTemplate(personal: boolean, start: string): string {
  const target = addDays(start, 30);
  const orgFields = personal ? '' : '- Team: Engineering\n- Assignee: teammate@example.com\n';
  const orgGuidance = personal
    ? '- Personal plans must not use `Team` or `Assignee`.'
    : '- `Team` must already exist in the organization, and `Assignee` must be an active member.';
  const fieldList = personal
    ? 'Key, Start, Due, Priority, Estimate, Description'
    : 'Key, Start, Due, Priority, Estimate, Description, Team, Assignee';

  return `<!--
HOW TO USE THIS TEMPLATE (TaskFlow ignores this comment entirely — you may delete it or leave it)

- The first heading is the project. Every "##" heading below it is a task.
- Bullets directly under a heading that read "Field: value" set that item's fields.
  Recognised fields: ${fieldList}.
- Any other bullet under a task is a subtask. Plain text under a heading is its description.
- Dates use YYYY-MM-DD (DD/MM/YYYY also works). A task's Start defaults to the project's
  start date, and Due may be left out.
- Priority is Low, Medium, High, or Critical, and defaults to Medium.
- Estimate is minutes, or a value like "8h" or "2d".
- Task dates must fall inside the project's own date range.
${orgGuidance}
- Limits: 500 tasks and 5,000 subtasks per plan.
- Sections titled Instructions, Notes, Examples, or Guidance are skipped as well, so any
  guidance you leave in the file is harmless.
-->

# ${personal ? 'My project plan' : 'Website launch'}

- Start: ${start}
- Target: ${target}

Replace this paragraph with the project objective and scope.

## Discovery and requirements

- Start: ${start}
- Due: ${addDays(start, 5)}
- Priority: High
- Estimate: 8h
${orgFields}
Confirm scope, users, dependencies, and success criteria.

### Subtasks

- [ ] Run the kickoff meeting
- [ ] Document requirements

## Design and implementation

- Start: ${addDays(start, 6)}
- Due: ${target}
- Priority: Medium
- Estimate: 2400
${orgFields}
Create and deliver the approved solution.

### Subtasks

- [ ] Prepare the first draft
- [ ] Review and finalize
`;
}

/** Removes fenced code, HTML comments, blockquotes, and horizontal rules before parsing. */
function stripNonContent(text: string): string {
  const lines = text.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
  const kept: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fence) {
      if (fenceMatch && line.trim().startsWith(fence)) fence = null;
      continue;
    }
    if (fenceMatch) {
      fence = fenceMatch[1];
      continue;
    }
    if (/^\s*>/.test(line)) continue;
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) continue;
    kept.push(line);
  }
  return kept.join('\n');
}

function readHeading(line: string): Heading | null {
  const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
  if (!match) return null;
  return { level: match[1].length, text: cleanInline(match[2]).replace(/\s*#+\s*$/, '').trim() };
}

/** Returns the list item's text, or null when the line is not a list item. */
function readBullet(line: string): string | null {
  const match = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line);
  if (!match) return null;
  return cleanInline(match[1].replace(/^\[[ xX]\]\s*/, '')).trim();
}

function readField(text: string): { name: string; value: string } | null {
  const match = /^([A-Za-z][A-Za-z -]{0,30}?)\s*[:：]\s*(.*)$/.exec(text);
  if (!match) return null;
  const name = FIELD_ALIASES[match[1].trim().toLowerCase()];
  if (!name) return null;
  return { name, value: match[2].trim() };
}

function cleanInline(text: string): string {
  return text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/** Drops a leading "Project:" / "Task:" label so both labelled and plain headings work. */
function stripLabel(text: string): string {
  return text.replace(/^(project|task)\s*[:\-–]\s*/i, '').trim();
}

function isInstructionHeading(title: string): boolean {
  return INSTRUCTION_HEADINGS.includes(title.trim().toLowerCase().replace(/[:.]$/, ''));
}

function isSubtaskHeading(title: string): boolean {
  return SUBTASK_HEADINGS.includes(title.trim().toLowerCase().replace(/[:.]$/, ''));
}

function readDate(value: string, what: string): string {
  const text = value.trim();
  let year: number;
  let month: number;
  let day: number;
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  const dayFirstMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (isoMatch) {
    [, year, month, day] = isoMatch.map(Number);
  } else if (dayFirstMatch) {
    [, day, month, year] = dayFirstMatch.map(Number);
  } else {
    throw new Error(`Could not read ${what}: use YYYY-MM-DD or DD/MM/YYYY.`);
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`${capitalize(what)} is not a valid calendar date.`);
  }
  return date.toISOString();
}

function readEstimate(value: string, where: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*(m|min|mins|minutes|h|hr|hrs|hours|d|day|days)?$/i.exec(value.trim());
  if (!match) {
    throw new Error(`The estimate of ${where} must be minutes, or a value like "8h" or "2d".`);
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? 'm').toLowerCase();
  const minutes = unit.startsWith('h') ? amount * 60 : unit.startsWith('d') ? amount * 60 * 24 : amount;
  return Math.round(minutes);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayIso(): string {
  return `${todayDate()}T00:00:00.000Z`;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
