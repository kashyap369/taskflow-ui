import { Component, input } from '@angular/core';

export interface PricingPlan {
  title: string;
  description: string;

  price: string;
  duration?: string;

  buttonText: string;

  popular?: boolean;

  outlineButton?: boolean;

  features: string[];
}

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.scss',
})
export class PricingCard {

  plan = input.required<PricingPlan>();

}