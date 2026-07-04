import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell for the Member portal (role: MEMBER). */
@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './member-layout.html',
  styleUrl: './member-layout.scss',
})
export class MemberLayout {}
