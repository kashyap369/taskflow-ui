import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { LucideAngularModule, LucideIconData, Calendar } from 'lucide-angular';

/** Urgency preset drives the icon tint for each deadline row. */
export type DeadlineStatus = 'upcoming' | 'soon' | 'overdue' | 'done';

export interface DeadlineItem {
  /** Task / item title (rendered bold). */
  title: string;

  /** Relative due text, e.g. 'Due in 2d' or 'Overdue by 2d'. */
  due: string;

  /** Preset that resolves the icon colors when none are given. */
  status?: DeadlineStatus;

  /** Explicit overrides (win over `status`). */
  icon?: LucideIconData;
  iconColor?: string;
  iconBackground?: string;
}

export interface DeadlineConfig {
  // Header
  title?: string;
  actionLabel?: string;
  showAction?: boolean;

  // Data — supplied by the caller.
  items: DeadlineItem[];
}

interface DeadlinePreset {
  color: string;
  background: string;
}

const DEADLINE_PRESETS: Record<DeadlineStatus, DeadlinePreset> = {
  upcoming: { color: '#6D5DF6', background: '#EEEBFF' },
  soon: { color: '#F59E0B', background: '#FEF3E2' },
  overdue: { color: '#F43F5E', background: '#FFE9ED' },
  done: { color: '#10B981', background: '#E7F8F1' },
};

const FALLBACK_PRESET: DeadlinePreset = { color: '#6D5DF6', background: '#EEEBFF' };

interface ResolvedDeadlineItem extends DeadlineItem {
  resolvedIcon: LucideIconData;
  resolvedColor: string;
  resolvedBackground: string;
}

@Component({
  selector: 'app-deadline-molecule',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './deadline-molecule.html',
  styleUrl: './deadline-molecule.scss',
})
export class DeadlineMolecule {
  private readonly configSignal = signal<DeadlineConfig>({ items: [] });

  /** The full configuration. All deadline data is supplied by the caller. */
  @Input({ required: true })
  set config(value: DeadlineConfig) {
    this.configSignal.set(value ?? { items: [] });
  }
  get config(): DeadlineConfig {
    return this.configSignal();
  }

  /** Emits the clicked deadline item. */
  @Output()
  itemClick = new EventEmitter<DeadlineItem>();

  /** Emits when the header action link (e.g. 'Calendar') is clicked. */
  @Output()
  actionClick = new EventEmitter<void>();

  readonly defaultIcon = Calendar;

  readonly items = computed<ResolvedDeadlineItem[]>(() =>
    this.configSignal().items.map((item) => this.resolveItem(item)),
  );

  onItemClick(item: DeadlineItem): void {
    this.itemClick.emit(item);
  }

  onActionClick(): void {
    this.actionClick.emit();
  }

  private resolveItem(item: DeadlineItem): ResolvedDeadlineItem {
    const preset = (item.status && DEADLINE_PRESETS[item.status]) || FALLBACK_PRESET;
    return {
      ...item,
      resolvedIcon: item.icon ?? this.defaultIcon,
      resolvedColor: item.iconColor ?? preset.color,
      resolvedBackground: item.iconBackground ?? preset.background,
    };
  }
}
