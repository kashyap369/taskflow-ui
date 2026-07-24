import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData, Calendar, Ellipsis } from 'lucide-angular';

export type MasterCardVariant = 'achievement' | 'stat' | 'task' | 'project';

export interface CardBadge {

  text: string;

  color?: string;

  background?: string;

  // Small colored dot before the text (e.g. status badges)
  dot?: boolean;
}

export interface CardAvatar {

  initials?: string;

  image?: string;

  background?: string;
}

export interface MasterCardConfig {

  variant: MasterCardVariant;

  // Icon (achievement / stat / project logo)
  icon?: LucideIconData;
  iconColor?: string;
  iconBackground?: string;

  // Text
  title?: string;
  subtitle?: string;

  // Stat
  label?: string;
  value?: string;
  trend?: string;
  trendColor?: string;

  // Badges
  badge?: CardBadge;
  status?: CardBadge;

  // Meta
  project?: string;
  date?: string;

  // Progress (project)
  progress?: number;
  progressText?: string;

  // People
  avatars?: CardAvatar[];
  membersText?: string;

  showMenu?: boolean;

  // Appearance
  background?: string;
  borderColor?: string;
  borderRadius?: number;
  shadow?: boolean;
  hoverable?: boolean;
}

@Component({
  selector: 'app-master-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './master-card.html',
  styleUrl: './master-card.scss',
})
export class MasterCard {

  @Input({ required: true })
  config!: MasterCardConfig;

  readonly calendarIcon = Calendar;

  readonly menuIcon = Ellipsis;

  get iconColor(): string {
    return this.config.iconColor ?? '#FFFFFF';
  }

  get iconBackground(): string {
    return this.config.iconBackground ?? '#6D5DF6';
  }

  get trendColor(): string {
    return this.config.trendColor ?? '#10B981';
  }

  get cardBackground(): string {
    return this.config.background ?? '#FFFFFF';
  }

  get borderColor(): string {
    return this.config.borderColor ?? '#EEF1F6';
  }

  get borderRadius(): number {
    return this.config.borderRadius ?? 16;
  }

  get shadow(): boolean {
    return this.config.shadow ?? true;
  }

  get hoverable(): boolean {
    return this.config.hoverable ?? true;
  }

  get progress(): number {
    return Math.min(100, Math.max(0, this.config.progress ?? 0));
  }
}
