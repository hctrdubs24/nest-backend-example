export interface Response<T> {
  success: boolean;
  data: T;
  error?: any;
  meta: {
    timestamp: string;
  };
}
