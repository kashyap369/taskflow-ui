import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {

  @Input() text: string = 'Button';

  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';

  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Input() disabled: boolean = false;

  @Input() loading: boolean = false;

  @Input() iconLeft?: any;

  @Input() iconRight?: any;

  @Output() click = new EventEmitter<void>();

  handleClick() {
    if (this.disabled || this.loading) return;
    this.click.emit();
  }
}