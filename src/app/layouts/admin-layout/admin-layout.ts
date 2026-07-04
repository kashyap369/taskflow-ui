import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell for the Admin portal (role: ADMIN). */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {}
