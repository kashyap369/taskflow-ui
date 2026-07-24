import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import {
  LucideAngularModule,
  Star,
  BadgeCheck,
  LUCIDE_ICONS,
  LucideIconProvider
} from 'lucide-angular';

export interface ReviewCardModel {

  title?: string;

  review: string;

  rating: number;

  reviewerName: string;

  reviewerDesignation: string;

  reviewerCompany: string;

  avatarText?: string;

  avatarImage?: string;

  avatarBackground?: string;

  verified?: boolean;

}

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',

  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Star,
        BadgeCheck
      })
    }
  ]
})
export class ReviewCard {

  review = input.required<ReviewCardModel>();

  stars = computed(() =>
    Array.from({
      length: Math.min(5, Math.max(0, this.review().rating))
    })
  );

}