import { parseProjectPlanFile } from './project-plan-csv';

describe('project plan CSV', () => {
  const headers = [
    'Row Type', 'Task Key', 'Project Title', 'Project Description',
    'Project Start Date', 'Project Target Date', 'Task Title', 'Task Description',
    'Task Start Date', 'Task Due Date', 'Priority', 'Estimate Minutes',
    'Team Name', 'Assignee Email', 'Subtask Title',
  ].join(',');

  it('groups many subtask rows under their task key', async () => {
    const csv = [
      headers,
      'PROJECT,,Launch,Complete launch,2026-09-05,2026-09-20,,,,,,,,,',
      'TASK,T-1,,,,,Design,Design the site,2026-09-05,2026-09-10,High,480,Design Team,designer@example.com,',
      'SUBTASK,T-1,,,,,,,,,,,,,Wireframe',
      'SUBTASK,T-1,,,,,,,,,,,,,"Review, revise and approve"',
    ].join('\r\n');

    const preview = await parseProjectPlanFile(
      new File([csv], 'project-plan.csv', { type: 'text/csv' }),
    );

    expect(preview.payload.title).toBe('Launch');
    expect(preview.taskCount).toBe(1);
    expect(preview.subTaskCount).toBe(2);
    expect(preview.payload.tasks[0].subTasks[1]).toBe('Review, revise and approve');
  });

  it('rejects a subtask whose task key does not exist', async () => {
    const csv = [
      headers,
      'PROJECT,,Launch,,2026-09-05,2026-09-20,,,,,,,,,',
      'TASK,T-1,,,,,Design,,2026-09-05,2026-09-10,High,,,,',
      'SUBTASK,T-2,,,,,,,,,,,,,Unknown parent',
    ].join('\n');

    await expectAsync(
      parseProjectPlanFile(new File([csv], 'project-plan.csv')),
    ).toBeRejectedWithError(/no TASK row exists for key 'T-2'/);
  });

  it('accepts the day-first dates used by the attached project-plan example', async () => {
    const csv = [
      headers,
      'PROJECT,,Launch,,05/09/2026,20/09/2026,,,,,,,,,',
      'TASK,T-1,,,,,Design,,05/09/2026,10/09/2026,High,,,,',
    ].join('\n');

    const preview = await parseProjectPlanFile(new File([csv], 'project-plan.csv'));

    expect(preview.payload.startDate).toBe('2026-09-05T00:00:00.000Z');
  });
});
