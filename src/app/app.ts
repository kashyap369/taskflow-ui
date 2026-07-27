import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MaintenanceService } from './core/services/maintenance.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly maintenance = inject(MaintenanceService);

  protected readonly title = signal('TaskFlowApp');

  /** Non-null while the API is answering 503 MAINTENANCE_MODE — see `errorInterceptor`. */
  protected readonly maintenanceMessage = this.maintenance.message;
}
