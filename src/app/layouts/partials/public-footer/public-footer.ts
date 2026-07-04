import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Globe, LUCIDE_ICONS,LucideAngularModule,LucideIconProvider, Stars } from 'lucide-angular';
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
  productLinks = [
    'Features',
    'Pricing',
    'Changelog',
    'Roadmap',
  ];

  companyLinks = [
    'About',
    'Customers',
    'Careers',
    'Contact',
  ];

  resourceLinks = [
    'Docs',
    'Help Center',
    'Security',
    'Status',
  ];
}