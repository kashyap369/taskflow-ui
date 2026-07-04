import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';

export interface AppEvent<T = unknown> {
  type: string;
  payload: T;
}

/**
 * Lightweight app-wide event bus for cross-feature communication.
 * Features must not import each other directly — they emit/subscribe here.
 * This is the frontend analogue of decoupled domain-event handlers.
 */
@Injectable({ providedIn: 'root' })
export class AppEventBus {
  private readonly events$ = new Subject<AppEvent>();

  emit<T>(type: string, payload: T): void {
    this.events$.next({ type, payload });
  }

  on<T>(type: string): Observable<T> {
    return this.events$.pipe(
      filter((event) => event.type === type),
      map((event) => event.payload as T),
    );
  }
}
