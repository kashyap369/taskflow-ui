import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  private activeRequests = 0;

  show(): void {
    this.activeRequests++;

    this._loading.set(true);
  }

  hide(): void {
    this.activeRequests--;

    if (this.activeRequests <= 0) {
      this.activeRequests = 0;

      this._loading.set(false);
    }
  }

  reset(): void {
    this.activeRequests = 0;

    this._loading.set(false);
  }
}