export interface ValidationError {

  propertyName: string;

  errorMessage: string;

}

export interface ApiErrorResponse {

  success: false;

  code: string;

  message: string;

  failureReason: string;

  errors: ValidationError[] | null;

  timestamp: string;

  traceId: string;

}