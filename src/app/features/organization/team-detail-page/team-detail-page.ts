import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  Pencil,
  Search,
  SquareCheckBig,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-angular';

import { DialogService } from '@core/services/dialog.service';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { LottiePlayer } from '@shared/ui/atoms/animations/lottie-player/lottie-player';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { controlValidators, messageFor } from '@shared/validations';
import { TeamFormModel } from '../organization.form-models';
import {
  OrganizationMember,
  TaskListItem,
  TaskStatus,
  TeamMember,
  taskPriorityMeta,
  taskStatusMeta,
} from '../organization.models';
import { OrganizationFacade } from '../organization.facade';

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    LottiePlayer,
    DialogDirective,
    Skeleton,
    Pagination,
  ],
  templateUrl: './team-detail-page.html',
  styleUrl: './team-detail-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowLeft,
        Users,
        UserPlus,
        Trash2,
        Mail,
        X,
        Pencil,
        Search,
        SquareCheckBig,
        User,
        ArrowRight,
      }),
    },
  ],
})
export class TeamDetailPage {
  private readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(DialogService);

  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly team = this.facade.teamDetail;
  private readonly members = this.facade.members;

  private readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  readonly showAdd = signal(false);
  readonly showEdit = signal(false);

  /** Per-control validators derived from `TeamFormModel`'s decorators. */
  private readonly rules = controlValidators(TeamFormModel);

  readonly editForm = this.fb.nonNullable.group({
    name: ['', this.rules['name']],
    description: ['', this.rules['description']],
  });

  /** Touched-gated message for a field, straight from the decorator that failed. */
  fieldError(property: string): string | null {
    return messageFor(this.editForm, property);
  }

  readonly hasMembers = computed(() => (this.team()?.members.length ?? 0) > 0);

  /** Placeholder rows rendered while the team loads. */
  readonly loadingRows = [0, 1, 2, 3];

  // ── Filter + paging over the team's members (client-side) ──
  readonly search = signal('');

  readonly filteredMembers = computed<TeamMember[]>(() => {
    const all = this.team()?.members ?? [];
    const term = this.search().trim().toLowerCase();
    if (!term) return all;
    return all.filter(
      (m) => m.fullName.toLowerCase().includes(term) || m.email.toLowerCase().includes(term),
    );
  });

  readonly pager = createPagination(this.filteredMembers, { pageSize: 10 });

  /** Active org members not already on this team — the add-member picker. */
  readonly availableMembers = computed<OrganizationMember[]>(() => {
    const onTeam = new Set(this.team()?.members.map((m) => m.userId) ?? []);
    return this.members().filter((m) => m.isActive && !onTeam.has(m.userId));
  });

  // ── The team's own tasks (`GET /team/{id}/tasks`) ──

  /**
   * What the team **owns** (`Task.TeamId`) — a different question from who is on it. A task can be
   * assigned to someone outside the team, and a member's other tasks don't appear here.
   */
  readonly tasks = this.facade.teamTasks;
  readonly hasTasks = computed(() => this.tasks().length > 0);
  readonly openTaskCount = computed(
    () => this.tasks().filter((t) => t.status !== TaskStatus.Completed).length,
  );

  readonly taskSearch = signal('');
  readonly taskStatusFilter = signal<'' | TaskStatus>('');

  readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: TaskStatus.Todo, label: 'To do' },
    { value: TaskStatus.InProgress, label: 'In progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.Blocked, label: 'Blocked' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' },
  ];

  readonly filteredTasks = computed<TaskListItem[]>(() => {
    const term = this.taskSearch().trim().toLowerCase();
    const status = this.taskStatusFilter();
    return this.tasks().filter((t) => {
      const matchesTerm = !term || t.title.toLowerCase().includes(term);
      const matchesStatus = status === '' || t.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly taskPager = createPagination(this.filteredTasks, { pageSize: 10 });

  readonly taskStatusMeta = taskStatusMeta;
  readonly taskPriorityMeta = taskPriorityMeta;

  onTaskSearch(value: string): void {
    this.taskSearch.set(value);
  }

  onTaskStatusFilter(value: string): void {
    this.taskStatusFilter.set(value === '' ? '' : (Number(value) as TaskStatus));
  }

  clearTaskFilters(): void {
    this.taskSearch.set('');
    this.taskStatusFilter.set('');
  }

  /** Take the task off this team. The task itself is untouched — only the team link is cleared. */
  async removeTaskFromTeam(task: TaskListItem): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Remove task from team?',
      `"${task.title}" stays in the organization — only its link to ${this.team()?.name ?? 'this team'} is cleared.`,
      'Remove',
    );
    if (ok) {
      this.facade.setTaskTeam(task.id, null);
    }
  }

  /** The member this task is assigned to, if they're in the organization member list. */
  assigneeName(task: TaskListItem): string | null {
    if (task.assignedToUserId == null) {
      return null;
    }
    return (
      this.members().find((m) => m.userId === task.assignedToUserId)?.userFullName ??
      `User #${task.assignedToUserId}`
    );
  }

  constructor() {
    this.facade.init();
    this.facade.loadTeamDetail(this.teamId);
    this.destroyRef.onDestroy(() => this.facade.clearTeamDetail());
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  clearFilters(): void {
    this.search.set('');
  }

  openAdd(): void {
    this.showAdd.set(true);
  }

  closeAdd(): void {
    this.showAdd.set(false);
  }

  add(member: OrganizationMember): void {
    this.facade.addTeamMember(member.userId);
    this.closeAdd();
  }

  // ── The team itself ──

  openEdit(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    this.editForm.reset({ name: team.name, description: team.description ?? '' });
    this.showEdit.set(true);
  }

  closeEdit(): void {
    this.showEdit.set(false);
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const { name, description } = this.editForm.getRawValue();
    this.facade.updateTeam({ teamId: this.teamId, name, description });
    this.closeEdit();
  }

  async removeTeam(): Promise<void> {
    const team = this.team();
    if (!team) {
      return;
    }
    const ok = await this.dialog.confirmDelete(
      'Delete team?',
      `"${team.name}" will be deleted. Its ${team.members.length} member(s) stay in the organization.`,
      'Delete team',
    );
    if (ok) {
      this.facade.deleteTeam(team.id, () => this.router.navigate(['/organization/teams']));
    }
  }

  async remove(member: TeamMember): Promise<void> {
    const ok = await this.dialog.confirmDelete(
      'Remove from team?',
      `${member.fullName} will be removed from ${this.team()?.name ?? 'this team'}.`,
      'Remove',
    );
    if (ok) {
      this.facade.removeTeamMember(member.userId);
    }
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }
}
