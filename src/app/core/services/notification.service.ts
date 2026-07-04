import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  success(message: string, title = 'Success'): void {
    this.toastr.success(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
    });
  }

  error(message: string, title = 'Error'): void {
    this.toastr.error(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
    });
  }

  warning(message: string, title = 'Warning'): void {
    this.toastr.warning(message, title, {
      timeOut: 3500,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
    });
  }

  info(message: string, title = 'Information'): void {
    this.toastr.info(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
    });
  }

  clear(): void {
    this.toastr.clear();
  }
}