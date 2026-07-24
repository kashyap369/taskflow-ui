import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

/** Status preset drives the badge colors for each project row. */
export type ProjectStatus = 'on-track' | 'at-risk' | 'delayed' | 'completed';

export interface ProjectMember {
  initials?: string;
  image?: string;
  background?: string;
}

export interface ProjectOverviewItem {
  /** Project name (rendered bold). */
  name: string;

  /** Meta line, e.g. '57/84 tasks · due Aug 14'. */
  meta?: string;

  /** Completion percent, 0–100. */
  progress: number;

  /** Status preset that resolves the badge colors when none are given. */
  status?: ProjectStatus;

  /** Badge text override (defaults to a label derived from `status`). */
  statusLabel?: string;

  /** Explicit badge color overrides (win over `status`). */
  statusColor?: string;
  statusBackground?: string;

  /** Leading avatar / logo color for the project dot. */
  color?: string;

  /** Member avatars shown on the right. */
  members?: ProjectMember[];
}

export interface ProjectOverviewConfig {
  // Header
  title?: string;
  actionLabel?: string;
  showAction?: boolean;

  // Data — all supplied by the caller (e.g. from an API).
  items: ProjectOverviewItem[];

  // Appearance
  progressGradient?: string;
  maxAvatars?: number;
}

interface StatusPreset {
  label: string;
  color: string;
  background: string;
}

const STATUS_PRESETS: Record<ProjectStatus, StatusPreset> = {
  'on-track': { label: 'On Track', color: '#059669', background: '#E7F8F1' },
  'at-risk': { label: 'At Risk', color: '#F59E0B', background: '#FEF3E2' },
  delayed: { label: 'Delayed', color: '#F43F5E', background: '#FFE9ED' },
  completed: { label: 'Completed', color: '#4F6EF7', background: '#EEF1FF' },
};

const FALLBACK_STATUS: StatusPreset = {
  label: 'Active',
  color: '#64748B',
  background: '#F1F5F9',
};

const DEFAULT_GRADIENT = 'linear-gradient(90deg, #6D5DF6, #00A3FF, #8B5CF6)';

interface ResolvedProject extends ProjectOverviewItem {
  clampedProgress: number;
  resolvedLabel: string;
  resolvedColor: string;
  resolvedBackground: string;
  hasDot: boolean;
  visibleMembers: ProjectMember[];
  extraMembers: number;
}

@Component({
  selector: 'app-project-overview-molecule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-overview-molecule.html',
  styleUrl: './project-overview-molecule.scss',
})
export class ProjectOverviewMolecule {
  private readonly configSignal = signal<ProjectOverviewConfig>({ items: [] });

  /** The full configuration. All project data is supplied by the caller. */
  @Input({ required: true })
  set config(value: ProjectOverviewConfig) {
    this.configSignal.set(value ?? { items: [] });
  }
  get config(): ProjectOverviewConfig {
    return this.configSignal();
  }

  /** Emits the clicked project. */
  @Output()
  projectClick = new EventEmitter<ProjectOverviewItem>();

  /** Emits when the header action link (e.g. 'All projects') is clicked. */
  @Output()
  actionClick = new EventEmitter<void>();

  readonly gradient = computed(() => this.configSignal().progressGradient ?? DEFAULT_GRADIENT);

  readonly items = computed<ResolvedProject[]>(() =>
    this.configSignal().items.map((item) => this.resolveItem(item)),
  );

  onProjectClick(item: ProjectOverviewItem): void {
    this.projectClick.emit(item);
  }

  onActionClick(): void {
    this.actionClick.emit();
  }

  private resolveItem(item: ProjectOverviewItem): ResolvedProject {
    const preset = (item.status && STATUS_PRESETS[item.status]) || FALLBACK_STATUS;
    const maxAvatars = this.configSignal().maxAvatars ?? 3;
    const members = item.members ?? [];
    return {
      ...item,
      clampedProgress: Math.min(100, Math.max(0, item.progress ?? 0)),
      resolvedLabel: item.statusLabel ?? preset.label,
      resolvedColor: item.statusColor ?? preset.color,
      resolvedBackground: item.statusBackground ?? preset.background,
      hasDot: !item.statusColor && !!item.status,
      visibleMembers: members.slice(0, maxAvatars),
      extraMembers: Math.max(0, members.length - maxAvatars),
    };
  }
}
