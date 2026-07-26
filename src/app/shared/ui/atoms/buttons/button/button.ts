import { Component, Input, Output, EventEmitter, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {

  @Input() text = 'Button';

  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';

  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Input() disabled = false;

  @Input() loading = false;

  /** A standalone icon component rendered through `ngComponentOutlet`. */
  @Input() iconLeft?: Type<unknown>;

  @Input() iconRight?: Type<unknown>;

  /** Named `buttonClick`, not `click`: an output that shadows a native DOM event fires twice. */
  @Output() buttonClick = new EventEmitter<void>();

  handleClick() {
    if (this.disabled || this.loading) return;
    this.buttonClick.emit();
  }
}