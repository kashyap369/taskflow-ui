import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, CircleCheck, CircleAlert } from 'lucide-angular';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './email-input.html',
  styleUrl: './email-input.scss',
})
export class EmailInput {

  readonly Mail = Mail;
  readonly CircleCheck = CircleCheck;
  readonly CircleAlert = CircleAlert;

  email = '';

  touched = false;

  get isValidEmail(): boolean {

    if (!this.email)
      return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email);

  }

  get showError(): boolean {

    return this.touched && !this.isValidEmail;

  }

  get showSuccess(): boolean {

    return this.touched && this.isValidEmail;

  }

  onInput(event: Event) {

    this.email = (event.target as HTMLInputElement).value;
    this.touched = true;

  }

}