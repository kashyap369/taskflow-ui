import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell for all authentication screens (login, register, forgot-password…). */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
