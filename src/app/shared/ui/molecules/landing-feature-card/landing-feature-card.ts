import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface LandingFeatureCardModel {
  title: string;
  description: string;

  icon: string;

  iconBackground?: string;
  iconColor?: string;
}

@Component({
  selector: 'app-landing-feature-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './landing-feature-card.html',
  styleUrl: './landing-feature-card.scss',
})
export class LandingFeatureCard {
  feature = input.required<LandingFeatureCardModel>();
}
