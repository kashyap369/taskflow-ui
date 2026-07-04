// Angular
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Third Party
import { provideToastr } from 'ngx-toastr';
import { provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// Application
import { routes } from './app.routes';

import { APP_SETTINGS } from './core/config/app.tokens';
import { AppSettings } from './core/config/app.settings';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

echarts.use([LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true,
    }),

    provideRouter(routes),

    provideAnimations(),
    provideEchartsCore({ echarts }),

    provideToastr({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      timeOut: 3000,
    }),

    { provide: APP_SETTINGS, useValue: AppSettings },

    // Middleware pipeline (order matters): attach token -> log -> spinner -> handle errors
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor, loadingInterceptor, errorInterceptor]),
    ),
  ],
};
