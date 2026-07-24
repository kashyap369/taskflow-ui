import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import {
  LucideAngularModule,
  LucideIconData,
  CircleCheck,
  MessageSquare,
  Plus,
  Activity,
  UserPlus,
  RefreshCw,
  Trash2,
  Star,
} from 'lucide-angular';

/** Known activity types map to a preset icon + color. */
export type ActivityType =
  | 'completed'
  | 'commented'
  | 'created'
  | 'moved'
  | 'invited'
  | 'updated'
  | 'deleted'
  | 'starred';

export interface ActivityItem {
  /** Person who performed the action (rendered bold). */
  actor: string;

  /** The action text (rendered muted), e.g. 'completed task'. */
  action: string;

  /** Optional target of the action (rendered bold), e.g. 'Schema design'. */
  target?: string;

  /** Relative timestamp string, e.g. '12m ago'. */
  time: string;

  /** Preset that resolves the icon + colors when no explicit icon is given. */
  type?: ActivityType;

  /** Explicit icon override (wins over `type`). */
  icon?: LucideIconData;
  iconColor?: string;
  iconBackground?: string;
}

export type ActivityLeading = 'icon' | 'avatar';

export interface RecentActivityConfig {
  // Header
  title?: string;
  actionLabel?: string;
  showAction?: boolean;

  // Data — supplied by the caller.
  items: ActivityItem[];

  // Appearance
  leading?: ActivityLeading;
  dividers?: boolean;
}

interface ActivityPreset {
  icon: LucideIconData;
  color: string;
  background: string;
}

const ACTIVITY_PRESETS: Record<ActivityType, ActivityPreset> = {
  completed: { icon: CircleCheck, color: '#10B981', background: '#E7F8F1' },
  commented: { icon: MessageSquare, color: '#00A3FF', background: '#E6F5FF' },
  created: { icon: Plus, color: '#6D5DF6', background: '#EEEBFF' },
  moved: { icon: Activity, color: '#64748B', background: '#F1F5F9' },
  invited: { icon: UserPlus, color: '#A855F7', background: '#F5EBFF' },
  updated: { icon: RefreshCw, color: '#64748B', background: '#F1F5F9' },
  deleted: { icon: Trash2, color: '#F43F5E', background: '#FFE9ED' },
  starred: { icon: Star, color: '#F59E0B', background: '#FEF3E2' },
};

const FALLBACK_PRESET: ActivityPreset = {
  icon: Activity,
  color: '#64748B',
  background: '#F1F5F9',
};

interface ResolvedActivityItem extends ActivityItem {
  resolvedIcon: LucideIconData;
  resolvedColor: string;
  resolvedBackground: string;
  initials: string;
}

@Component({
  selector: 'app-recent-activity-molecule',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recent-activity-molecule.html',
  styleUrl: './recent-activity-molecule.scss',
})
export class RecentActivityMolecule {
  private readonly configSignal = signal<RecentActivityConfig>({ items: [] });

  /** The full configuration. All activity data is supplied by the caller. */
  @Input({ required: true })
  set config(value: RecentActivityConfig) {
    this.configSignal.set(value ?? { items: [] });
  }
  get config(): RecentActivityConfig {
    return this.configSignal();
  }

  /** Emits the clicked activity item. */
  @Output()
  itemClick = new EventEmitter<ActivityItem>();

  /** Emits when the header action link (e.g. 'View all') is clicked. */
  @Output()
  actionClick = new EventEmitter<void>();

  readonly leading = computed<ActivityLeading>(() => this.configSignal().leading ?? 'icon');

  readonly showDividers = computed(() => this.configSignal().dividers ?? true);

  readonly items = computed<ResolvedActivityItem[]>(() =>
    this.configSignal().items.map((item) => this.resolveItem(item)),
  );

  onItemClick(item: ActivityItem): void {
    this.itemClick.emit(item);
  }

  onActionClick(): void {
    this.actionClick.emit();
  }

  private resolveItem(item: ActivityItem): ResolvedActivityItem {
    const preset = (item.type && ACTIVITY_PRESETS[item.type]) || FALLBACK_PRESET;
    return {
      ...item,
      resolvedIcon: item.icon ?? preset.icon,
      resolvedColor: item.iconColor ?? preset.color,
      resolvedBackground: item.iconBackground ?? preset.background,
      initials: this.toInitials(item.actor),
    };
  }

  private toInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
