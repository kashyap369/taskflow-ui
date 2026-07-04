import { Component, computed, input } from '@angular/core';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Stars } from 'lucide-angular';

export interface ReviewCardModel {
  name: string;
  designation: string;
  company: string;
  review: string;
  rating?: number;
  avatar?: string;
  avatarColor?: string;
}

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',
  providers:[
    {
      provide:LUCIDE_ICONS,
      multi:true,
      useValue:new LucideIconProvider({Stars})
    }
  ]
})
export class ReviewCard {

  review = input.required<ReviewCardModel>();

  stars = computed(() =>
    Array.from({
      length: this.review().rating ?? 5
    })
  );

}