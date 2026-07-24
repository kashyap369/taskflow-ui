import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import {
  LucideAngularModule,
  LucideIconData,
  AtSign,
  TriangleAlert,
  CircleCheck,
  MessageSquare,
  Info,
  Bell,
} from 'lucide-angular';

/** Notification type maps to a preset icon + color. */
export type NotificationType =
  | 'mention'
  | 'overdue'
  | 'milestone'
  | 'comment'
  | 'report'
  | 'system';

export interface NotificationItem {
  /** Bold headline, e.g. 'Avery mentioned you'. */
  title: string;

  /** Secondary line, e.g. 'in Audit color tokens'. */
  description?: string;

  /** Relative timestamp, e.g. '5m' or 'Yesterday'. */
  time: string;

  /** Preset that resolves the icon + colors when none are given. */
  type?: NotificationType;

  /** Whether to show the unread dot. */
  unread?: boolean;

  /** Explicit overrides (win over `type`). */
  icon?: LucideIconData;
  iconColor?: string;
  iconBackground?: string;
}

export interface NotificationPopUpConfig {
  // Header / footer
  title?: string;
  markAllLabel?: string;
  footerLabel?: string;
  showMarkAll?: boolean;
  showFooter?: boolean;

  // Data — supplied by the caller.
  items: NotificationItem[];

  // Shown when `items` is empty.
  emptyText?: string;
}

interface NotificationPreset {
  icon: LucideIconData;
  color: string;
  background: string;
}

const NOTIFICATION_PRESETS: Record<NotificationType, NotificationPreset> = {
  mention: { icon: AtSign, color: '#8B5CF6', background: '#F1EBFF' },
  overdue: { icon: TriangleAlert, color: '#F43F5E', background: '#FFE9ED' },
  milestone: { icon: CircleCheck, color: '#10B981', background: '#E7F8F1' },
  comment: { icon: MessageSquare, color: '#00A3FF', background: '#E6F5FF' },
  report: { icon: Info, color: '#6D5DF6', background: '#EEEBFF' },
  system: { icon: Bell, color: '#64748B', background: '#F1F5F9' },
};

const FALLBACK_PRESET: NotificationPreset = {
  icon: Bell,
  color: '#64748B',
  background: '#F1F5F9',
};

interface ResolvedNotification extends NotificationItem {
  resolvedIcon: LucideIconData;
  resolvedColor: string;
  resolvedBackground: string;
}

@Component({
  selector: 'app-notification-pop-up-molecule',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-pop-up-molecule.html',
  styleUrl: './notification-pop-up-molecule.scss',
})
export class NotificationPopUpMolecule {
  private readonly configSignal = signal<NotificationPopUpConfig>({ items: [] });

  /** The full configuration. All notification data is supplied by the caller. */
  @Input({ required: true })
  set config(value: NotificationPopUpConfig) {
    this.configSignal.set(value ?? { items: [] });
  }
  get config(): NotificationPopUpConfig {
    return this.configSignal();
  }

  /** Controls panel visibility so the parent can toggle it from a bell button. */
  @Input()
  open = true;

  /** Emits the clicked notification. */
  @Output()
  itemClick = new EventEmitter<NotificationItem>();

  /** Emits when 'Mark all read' is clicked. */
  @Output()
  markAllRead = new EventEmitter<void>();

  /** Emits when the footer 'View all notifications' is clicked. */
  @Output()
  viewAll = new EventEmitter<void>();

  readonly items = computed<ResolvedNotification[]>(() =>
    this.configSignal().items.map((item) => this.resolveItem(item)),
  );

  readonly isEmpty = computed(() => this.configSignal().items.length === 0);

  onItemClick(item: NotificationItem): void {
    this.itemClick.emit(item);
  }

  onMarkAllRead(): void {
    this.markAllRead.emit();
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  private resolveItem(item: NotificationItem): ResolvedNotification {
    const preset = (item.type && NOTIFICATION_PRESETS[item.type]) || FALLBACK_PRESET;
    return {
      ...item,
      resolvedIcon: item.icon ?? preset.icon,
      resolvedColor: item.iconColor ?? preset.color,
      resolvedBackground: item.iconBackground ?? preset.background,
    };
  }
}
