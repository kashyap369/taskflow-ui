import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sign-in-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-in-button.html',
  styleUrl: './sign-in-button.scss',
})
export class SignInButton {

  /** Named `buttonClick`, not `click`: an output that shadows a native DOM event fires twice. */
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}