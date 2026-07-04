import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  async success(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#6366F1',
    });
  }

  async error(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#EF4444',
    });
  }

  async warning(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#F59E0B',
    });
  }

  async info(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
    });
  }

  async confirm(
    title: string,
    text: string,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    icon: SweetAlertIcon = 'warning'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#6366F1',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    });

    return result.isConfirmed;
  }
}