export interface ApiMeta {
  requestId: string;
  timestamp: string;
  version?: string;
  extra?: Record<string, any>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiMeta;
}
