import { TaskPriority } from '@shared/models/project-plan.model';
import { parseProjectPlanMarkdown } from './project-plan-markdown';
import { parseProjectPlanFile } from './project-plan-csv';

describe('project plan Markdown', () => {
  const plan = [
    '# Launch',
    '',
    '- Start: 2026-09-05',
    '- Target: 2026-09-20',
    '',
    'Complete launch.',
    '',
    '## Design',
    '',
    '- Start: 2026-09-05',
    '- Due: 2026-09-10',
    '- Priority: High',
    '- Estimate: 8h',
    '- Team: Design Team',
    '- Assignee: designer@example.com',
    '',
    'Design the site.',
    '',
    '### Subtasks',
    '',
    '- [ ] Wireframe',
    '- [ ] Review, revise and approve',
  ].join('\n');

  it('reads the project, task fields, and subtasks', () => {
    const preview = parseProjectPlanMarkdown(plan, 'plan.md');

    expect(preview.format).toBe('Markdown');
    expect(preview.payload.title).toBe('Launch');
    expect(preview.payload.description).toBe('Complete launch.');
    expect(preview.payload.startDate).toBe('2026-09-05T00:00:00.000Z');
    expect(preview.payload.expectedCompletionDate).toBe('2026-09-20T00:00:00.000Z');
    expect(preview.taskCount).toBe(1);
    expect(preview.subTaskCount).toBe(2);

    const task = preview.payload.tasks[0];
    expect(task.key).toBe('T-001');
    expect(task.title).toBe('Design');
    expect(task.description).toBe('Design the site.');
    expect(task.priority).toBe(TaskPriority.High);
    expect(task.estimateMinutes).toBe(480);
    expect(task.teamName).toBe('Design Team');
    expect(task.assigneeEmail).toBe('designer@example.com');
    expect(task.subTasks).toEqual(['Wireframe', 'Review, revise and approve']);
  });

  it('ignores template instructions left in the file', () => {
    const withGuidance = [
      '<!-- Delete this comment. Each "##" heading is a task. -->',
      '## Instructions',
      '',
      '- Start: 1999-01-01',
      '- This bullet is guidance, not a subtask.',
      '',
      plan,
      '',
      '## Notes',
      '',
      '- Ignore me too.',
    ].join('\n');

    const preview = parseProjectPlanMarkdown(withGuidance, 'plan.md');

    expect(preview.payload.title).toBe('Launch');
    expect(preview.taskCount).toBe(1);
    expect(preview.payload.startDate).toBe('2026-09-05T00:00:00.000Z');
  });

  it('defaults a task to the project start, Medium priority, and no due date', () => {
    const preview = parseProjectPlanMarkdown(
      ['# Launch', '- Start: 2026-09-05', '', '## Design', '', '- Draft it'].join('\n'),
      'plan.md',
    );

    const task = preview.payload.tasks[0];
    expect(task.startDate).toBe('2026-09-05T00:00:00.000Z');
    expect(task.expectedCompletionDate).toBeNull();
    expect(task.priority).toBe(TaskPriority.Medium);
    expect(task.subTasks).toEqual(['Draft it']);
  });

  it('rejects a task scheduled outside the project date range', () => {
    const outside = [
      '# Launch',
      '- Start: 2026-09-05',
      '- Target: 2026-09-20',
      '',
      '## Design',
      '- Due: 2026-10-01',
    ].join('\n');

    expect(() => parseProjectPlanMarkdown(outside, 'plan.md')).toThrowError(
      /must fit inside the project date range/,
    );
  });

  it('rejects a plan with no task heading', () => {
    expect(() => parseProjectPlanMarkdown('# Launch\n\nJust prose.', 'plan.md')).toThrowError(
      /at least one task heading/,
    );
  });

  it('is reachable through the shared file reader by extension', async () => {
    const preview = await parseProjectPlanFile(new File([plan], 'plan.md'));

    expect(preview.format).toBe('Markdown');
    expect(preview.payload.title).toBe('Launch');
  });
});
