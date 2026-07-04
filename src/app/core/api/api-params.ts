import { HttpParams } from '@angular/common/http';

export class ApiParams {

  static create(params?: Record<string, unknown>): HttpParams {

    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {

      if (value !== null && value !== undefined) {

        httpParams = httpParams.append(key, String(value));

      }

    });

    return httpParams;

  }

}