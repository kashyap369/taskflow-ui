import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PublicHeader } from '@layouts/partials/public-header/public-header';
import { PublicFooter } from '@layouts/partials/public-footer/public-footer';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicHeader, PublicFooter],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {}
