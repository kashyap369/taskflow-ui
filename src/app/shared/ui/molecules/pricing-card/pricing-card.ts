import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData, CircleCheck } from 'lucide-angular';

export interface PricingPlan {

  // Header
  title: string;
  description: string;

  // Pricing
  price: string;
  duration?: string;

  // Button
  buttonText: string;

  // Features
  features: string[];

  // Badge
  badge?: string;
  badgeColor?: string;

  // Appearance
  buttonVariant?: 'filled' | 'outline';
  borderColor?: string;
  cardBackground?: string;
  borderRadius?: number;
  shadow?: boolean;
  hoverable?: boolean;

  // Icon
  featureIcon?: LucideIconData;
}

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.scss',
})
export class PricingCard {

  @Input({ required: true })
  plan!: PricingPlan;

  readonly defaultFeatureIcon = CircleCheck;

  get badgeColor(): string {
    return this.plan.badgeColor ?? 'var(--gradient-brand)';
  }

  get borderColor(): string {
    return this.plan.borderColor ?? 'var(--border)';
  }

  get cardBackground(): string {
    return this.plan.cardBackground ?? 'var(--surface)';
  }

  get borderRadius(): number {
    return this.plan.borderRadius ?? 24;
  }

  get featureIcon(): LucideIconData {
    return this.plan.featureIcon ?? this.defaultFeatureIcon;
  }

  get buttonVariant(): 'filled' | 'outline' {
    return this.plan.buttonVariant ?? 'filled';
  }

  get hoverable(): boolean {
    return this.plan.hoverable ?? true;
  }

  get shadow(): boolean {
    return this.plan.shadow ?? true;
  }

}