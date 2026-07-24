import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { LucideAngularModule, X, Check, ChevronDown } from 'lucide-angular';

export interface StatusOption {
  label: string;
  value: string;
}

export interface TeamOption {
  /** Unique id; falls back to `name` when omitted. */
  id?: string;
  name: string;
  initials?: string;
  image?: string;
  background?: string;
}

export interface CreateProjectConfig {
  // Header
  title?: string;

  // Field labels / placeholders
  nameLabel?: string;
  namePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;

  statusLabel?: string;
  statusOptions?: StatusOption[];

  dueDateLabel?: string;

  accentColorLabel?: string;
  accentColors?: string[];

  teamLabel?: string;
  teamOptions?: TeamOption[];

  // Actions
  cancelLabel?: string;
  confirmLabel?: string;

  // Initial values
  initialStatus?: string;
  initialAccent?: string;
}

export interface CreateProjectValue {
  name: string;
  description: string;
  status: string;
  dueDate: string;
  accentColor: string;
  team: string[];
}

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { label: 'On Track', value: 'on-track' },
  { label: 'At Risk', value: 'at-risk' },
  { label: 'Delayed', value: 'delayed' },
  { label: 'Completed', value: 'completed' },
];

const DEFAULT_ACCENT_COLORS = [
  '#6D5DF6',
  '#3B82F6',
  '#EC4899',
  '#EF4444',
  '#A855F7',
  '#06B6D4',
  '#10B981',
  '#F97316',
];

@Component({
  selector: 'app-create-project-modal-molecule',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './create-project-modal-molecule.html',
  styleUrl: './create-project-modal-molecule.scss',
})
export class CreateProjectModalMolecule {
  private readonly configSignal = signal<CreateProjectConfig>({});

  /** The full modal configuration (labels, options, defaults). */
  @Input({ required: true })
  set config(value: CreateProjectConfig) {
    const cfg = value ?? {};
    this.configSignal.set(cfg);
    this.accentColor.set(cfg.initialAccent ?? (cfg.accentColors ?? DEFAULT_ACCENT_COLORS)[0]);
    this.status.set(cfg.initialStatus ?? (cfg.statusOptions ?? DEFAULT_STATUS_OPTIONS)[0].value);
  }
  get config(): CreateProjectConfig {
    return this.configSignal();
  }

  /** Controls visibility so a parent can open/close the modal. */
  @Input()
  open = true;

  /** Closes the modal via the backdrop, X, or Cancel action. */
  @Output()
  closed = new EventEmitter<void>();

  /** Emits the assembled form value when 'Create project' is clicked. */
  @Output()
  create = new EventEmitter<CreateProjectValue>();

  // Form state
  readonly name = signal('');
  readonly description = signal('');
  readonly status = signal('');
  readonly dueDate = signal('');
  readonly accentColor = signal('');
  private readonly selectedTeam = signal<Set<string>>(new Set());

  readonly statusOptions = computed(() => this.configSignal().statusOptions ?? DEFAULT_STATUS_OPTIONS);
  readonly accentColors = computed(() => this.configSignal().accentColors ?? DEFAULT_ACCENT_COLORS);
  readonly teamOptions = computed(() => this.configSignal().teamOptions ?? []);

  protected readonly closeIcon = X;
  protected readonly checkIcon = Check;
  protected readonly chevronIcon = ChevronDown;

  memberId(member: TeamOption): string {
    return member.id ?? member.name;
  }

  isSelected(member: TeamOption): boolean {
    return this.selectedTeam().has(this.memberId(member));
  }

  toggleMember(member: TeamOption): void {
    const next = new Set(this.selectedTeam());
    const id = this.memberId(member);
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedTeam.set(next);
  }

  initials(member: TeamOption): string {
    if (member.initials) return member.initials;
    return member.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  onCreate(): void {
    this.create.emit({
      name: this.name(),
      description: this.description(),
      status: this.status(),
      dueDate: this.dueDate(),
      accentColor: this.accentColor(),
      team: Array.from(this.selectedTeam()),
    });
  }
}
