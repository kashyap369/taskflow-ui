// Angular
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Third Party
import { provideToastr } from 'ngx-toastr';
import { provideEchartsCore } from 'ngx-echarts';
import { provideLottieOptions } from 'ngx-lottie';

import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// Application
import { routes } from './app.routes';

import { APP_SETTINGS } from './core/config/app.tokens';
import { AppSettings } from './core/config/app.settings';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';

echarts.use([
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true,
    }),

    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),

    provideAnimations(),
    provideEchartsCore({ echarts }),

    // Lottie player (lazy-loaded lottie-web). Animation JSONs live in public/lottie/.
    provideLottieOptions({ player: () => import('lottie-web') }),

    provideToastr({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      timeOut: 3000,
    }),

    { provide: APP_SETTINGS, useValue: AppSettings },

    // Middleware pipeline (order matters): attach token -> log -> spinner -> handle errors ->
    // refresh. `refreshInterceptor` sits innermost so it catches a raw 401 and transparently
    // rotates the token BEFORE the error interceptor would surface it.
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
        loadingInterceptor,
        errorInterceptor,
        refreshInterceptor,
      ]),
    ),
  ],
};
