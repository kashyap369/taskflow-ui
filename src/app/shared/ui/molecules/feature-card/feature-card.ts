import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData, FolderKanban } from 'lucide-angular';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './feature-card.html',
  styleUrl: './feature-card.scss',
})
export class FeatureCard {
  @Input()
  title = 'Projects, organized';

  @Input()
  description =
    'Group work by team or initiative. Track progress, deadlines, and ownership at a glance.';

  @Input()
  icon: LucideIconData = FolderKanban;

  @Input()
  iconBackground = '#6D5DF6';
  @Input() cardBackground = '#ffffff';

  @Input() borderColor = '#e9edf5';

  @Input() hoverable = true;

  @Input() iconSize = 22;

  @Input() borderRadius = 22;
}
