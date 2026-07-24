import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

export interface ProjectStat {
  /** Small uppercase label, e.g. 'PROGRESS'. */
  label: string;

  /** Bold value, e.g. '68%'. */
  value: string;
}

export interface ProjectTeamMember {
  name: string;
  initials?: string;
  image?: string;
  background?: string;
}

export interface ProjectModalConfig {
  // Header
  title: string;
  subtitle?: string;

  /** Leading logo/dot color (or a gradient). */
  color?: string;
  logoImage?: string;

  // Stat grid (rendered two per row)
  stats?: ProjectStat[];

  // Progress bar
  progress?: number;
  progressGradient?: string;

  // Team
  teamLabel?: string;
  team?: ProjectTeamMember[];

  // Footer actions
  cancelLabel?: string;
  confirmLabel?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
}

const DEFAULT_GRADIENT = 'linear-gradient(90deg, #6D5DF6, #00A3FF, #8B5CF6)';

@Component({
  selector: 'app-view-project-modal-molecule',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './view-project-modal-molecule.html',
  styleUrl: './view-project-modal-molecule.scss',
})
export class ViewProjectModalMolecule {
  private readonly configSignal = signal<ProjectModalConfig>({ title: '' });

  /** The full modal configuration. All data is supplied by the caller. */
  @Input({ required: true })
  set config(value: ProjectModalConfig) {
    this.configSignal.set(value ?? { title: '' });
  }
  get config(): ProjectModalConfig {
    return this.configSignal();
  }

  /** Controls visibility so a parent can open/close the modal. */
  @Input()
  open = true;

  /** Closes the modal via the backdrop, X button, or the cancel action. */
  @Output()
  closed = new EventEmitter<void>();

  /** Emits when the primary action (e.g. 'Open project') is clicked. */
  @Output()
  confirm = new EventEmitter<void>();

  readonly gradient = computed(() => this.configSignal().progressGradient ?? DEFAULT_GRADIENT);

  readonly clampedProgress = computed(() => {
    const value = this.configSignal().progress ?? 0;
    return Math.min(100, Math.max(0, value));
  });

  readonly hasProgress = computed(() => this.configSignal().progress !== undefined);

  onBackdropClick(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  initials(member: ProjectTeamMember): string {
    if (member.initials) return member.initials;
    return member.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected readonly closeIcon = X;
}
