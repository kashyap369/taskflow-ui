import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Modal dialogs (alerts + confirmations) over SweetAlert2. SweetAlert renders in a portal at the
 * document root — outside Angular's theming — so we pull the live design tokens off `:root` at call
 * time (`--surface`, `--text`, `--danger`, …) and pass them through, keeping dialogs on-palette in
 * both light and dark themes. See docs/DESIGN.md for the tokens.
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly document = inject(DOCUMENT);

  async success(title: string, text?: string): Promise<void> {
    await Swal.fire({ ...this.themed(), icon: 'success', title, text, confirmButtonText: 'OK' });
  }

  async error(title: string, text?: string): Promise<void> {
    await Swal.fire({
      ...this.themed(),
      icon: 'error',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: this.cssVar('--danger', '#EF4444'),
    });
  }

  async warning(title: string, text?: string): Promise<void> {
    await Swal.fire({
      ...this.themed(),
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: this.cssVar('--warning', '#F59E0B'),
    });
  }

  async info(title: string, text?: string): Promise<void> {
    await Swal.fire({ ...this.themed(), icon: 'info', title, text, confirmButtonText: 'OK' });
  }

  /** Generic yes/no confirmation. Returns `true` when confirmed. */
  async confirm(
    title: string,
    text: string,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    icon: SweetAlertIcon = 'warning',
  ): Promise<boolean> {
    const result = await Swal.fire({
      ...this.themed(),
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: this.cssVar('--primary', '#6366F1'),
      cancelButtonColor: this.cssVar('--text-subtle', '#6B7280'),
      reverseButtons: true,
    });

    return result.isConfirmed;
  }

  /**
   * Danger confirmation for destructive/irreversible actions (delete, remove). Red confirm button,
   * warning icon. Returns `true` when the user confirms.
   */
  async confirmDelete(
    title: string,
    text = 'This action cannot be undone.',
    confirmText = 'Delete',
  ): Promise<boolean> {
    const result = await Swal.fire({
      ...this.themed(),
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      confirmButtonColor: this.cssVar('--danger', '#EF4444'),
      cancelButtonColor: this.cssVar('--text-subtle', '#6B7280'),
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  }

  /**
   * Type-to-confirm for the irreversible actions where a single click is too cheap (deleting a whole
   * organization). The confirm button stays inert until the user types `expected` exactly; returns
   * `true` only then.
   */
  async confirmTyped(
    title: string,
    text: string,
    expected: string,
    confirmText = 'Delete',
  ): Promise<boolean> {
    const result = await Swal.fire({
      ...this.themed(),
      icon: 'warning',
      title,
      text,
      input: 'text',
      inputLabel: `Type "${expected}" to confirm`,
      inputAttributes: { autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off' },
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      confirmButtonColor: this.cssVar('--danger', '#EF4444'),
      cancelButtonColor: this.cssVar('--text-subtle', '#6B7280'),
      reverseButtons: true,
      focusCancel: true,
      preConfirm: (value: string) =>
        value?.trim() === expected ? true : (Swal.showValidationMessage(`Doesn't match.`), false),
    });

    return result.isConfirmed;
  }

  /** Surface, text, and motion classes so every dialog matches the active design language. */
  private themed() {
    return {
      background: this.cssVar('--surface', '#ffffff'),
      color: this.cssVar('--text', '#111827'),
      customClass: { popup: 'tf-dialog-popup' },
      showClass: {
        popup: 'tf-dialog-enter',
        backdrop: 'tf-dialog-backdrop-enter',
      },
      hideClass: {
        popup: 'tf-dialog-exit',
        backdrop: 'tf-dialog-backdrop-exit',
      },
    };
  }

  /** Read a CSS custom property off the document root, falling back to a literal. */
  private cssVar(name: string, fallback: string): string {
    const value = getComputedStyle(this.document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }
}
