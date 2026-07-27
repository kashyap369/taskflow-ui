import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Globe, LUCIDE_ICONS,LucideAngularModule,LucideIconProvider, Stars } from 'lucide-angular';

/**
 * A footer entry. `fragment` is set only where the destination actually exists on the landing page —
 * everything else renders as plain text rather than an `href="#"` that goes nowhere. Phase 6.
 */
interface FooterLink {
  label: string;
  fragment?: string;
}

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink,LucideAngularModule],
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.scss',
  providers:[
    {
      provide:LUCIDE_ICONS,
      multi:true,
      useValue: new LucideIconProvider({Stars,Globe})
    }
  ]
})
export class PublicFooter {
  productLinks: FooterLink[] = [
    { label: 'Features', fragment: 'features' },
    { label: 'Pricing', fragment: 'pricing' },
    { label: 'Changelog' },
    { label: 'Roadmap' },
  ];

  companyLinks: FooterLink[] = [
    { label: 'About' },
    { label: 'Customers', fragment: 'customers' },
    { label: 'Careers' },
    { label: 'Contact' },
  ];

  resourceLinks: FooterLink[] = [
    { label: 'Docs' },
    { label: 'Help Center' },
    { label: 'Security' },
    { label: 'Status' },
  ];
}