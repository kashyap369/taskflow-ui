import { HttpContextToken } from '@angular/common/http';

/** Feature-owned background requests handle their own inline errors instead of emitting global toasts. */
export const SILENT_API_ERROR = new HttpContextToken<boolean>(() => false);
