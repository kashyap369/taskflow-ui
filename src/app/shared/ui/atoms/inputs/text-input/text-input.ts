import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.scss',
})
export class TextInput {
  @Input() label = '';

  @Input() placeholder = 'Enter text';

  @Input() type: 'text' | 'email' | 'password' | 'number' | 'search' = 'text';

  @Input() value = '';

  @Input() disabled = false;

  @Input() required = false;
  @Input() id = `text-input-${Math.random().toString(36).slice(2, 9)}`;

  @Input() helperText = '';

  @Input() errorMessage = '';
  @Input() invalid = false;

  @Input() success = false;

  @Input() successMessage = '';

  @Input() showValidation = false;

  @Input() state: 'default' | 'success' | 'error' = 'default';

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
  }
}
