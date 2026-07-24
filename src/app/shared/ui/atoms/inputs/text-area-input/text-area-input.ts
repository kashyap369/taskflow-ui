import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-text-area-input',
  standalone: true,
  imports: [],
  templateUrl: './text-area-input.html',
  styleUrl: './text-area-input.scss',
})
export class TextAreaInput {
  @Input() id = `textarea-${Math.random().toString(36).slice(2, 9)}`;

  @Input() label = '';

  @Input() placeholder = 'Enter text...';

  @Input() value = '';
  @Input() maxLength = 200;

  @Input() showCounter = true;

  @Input() rows = 5;

  @Input() disabled = false;

  @Input() required = false;

  @Input() helperText = '';

  @Input() errorMessage = '';

  @Input() invalid = false;

  @Input() success = false;

  @Input() successMessage = '';

  @Input() showValidation = true;

  @Output() valueChange = new EventEmitter<string>();

  get remainingCharacters(): number {
    return this.maxLength - this.value.length;
  }

  get currentLength(): number {
    return this.value.length;
  }
  onInput(event: Event): void {
    const element = event.target as HTMLTextAreaElement;

    if (element.value.length > this.maxLength) {
      element.value = element.value.substring(0, this.maxLength);
    }

    this.value = element.value;

    this.valueChange.emit(this.value);
  }
}
