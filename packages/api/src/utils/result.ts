export interface SuccessResult<T> {
  success: true;
  data: T;
}

export interface FailedResult<E> {
  success: false;
  error: E;
  message?: string;
}

export type UnexpectedError = "unexpected_error";

export type Result<T, E = UnexpectedError> = SuccessResult<T> | FailedResult<E | UnexpectedError>;

export function ok<T>(data: T): SuccessResult<T>;
export function ok(): SuccessResult<void>;

export function ok<T>(data?: T): SuccessResult<T> {
  if (!data)
    return {
      success: true,
      data: undefined as T,
    };

  return {
    success: true,
    data,
  };
}

export function err<E>(error: E, message?: string): FailedResult<E> {
  return {
    success: false,
    error,
    message,
  };
}
