import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailModalMolecule } from './task-detail-modal-molecule';

describe('TaskDetailModalMolecule', () => {
  let component: TaskDetailModalMolecule;
  let fixture: ComponentFixture<TaskDetailModalMolecule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailModalMolecule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailModalMolecule);
    component = fixture.componentInstance;
    component.config = {
      title: 'Draft launch blog post',
      description: 'Announce v3 with key feature highlights.',
      subtasks: [
        { title: 'Outline', done: true },
        { title: 'First draft', done: true },
        { title: 'Edit pass' },
      ],
      comments: [{ author: 'Avery Mitchell', text: 'Add a section on privacy.', time: '1d ago' }],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should seed done state from config', () => {
    const done = component.subtasks().filter((t) => t.isDone).map((t) => t.title);
    expect(done).toEqual(['Outline', 'First draft']);
  });

  it('should toggle a subtask and emit the change', () => {
    let event: { done: boolean } | undefined;
    component.subtaskToggle.subscribe((e) => (event = e));

    component.toggleSubtask({ title: 'Edit pass' });

    expect(event?.done).toBeTrue();
    expect(component.subtasks().find((t) => t.title === 'Edit pass')?.isDone).toBeTrue();
  });

  it('should emit and clear the comment on submit', () => {
    let submitted: string | undefined;
    component.commentSubmit.subscribe((text) => (submitted = text));

    component.commentDraft.set('Looks good');
    component.onSubmitComment();

    expect(submitted).toBe('Looks good');
    expect(component.commentDraft()).toBe('');
  });

  it('should not emit an empty comment', () => {
    let called = false;
    component.commentSubmit.subscribe(() => (called = true));

    component.commentDraft.set('   ');
    component.onSubmitComment();

    expect(called).toBeFalse();
  });

  it('should emit closed and attach events', () => {
    let closed = false;
    let attached = false;
    component.closed.subscribe(() => (closed = true));
    component.attach.subscribe(() => (attached = true));

    component.onClose();
    component.onAttach();

    expect(closed).toBeTrue();
    expect(attached).toBeTrue();
  });
});
