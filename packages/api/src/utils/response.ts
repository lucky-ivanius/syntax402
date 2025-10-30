import type { Context, TypedResponse } from "hono";
import type { JSONParsed } from "hono/utils/types";

// Http errors
export const BAD_REQUEST_ERROR = "bad_request" as const;
export type BadRequestError = typeof BAD_REQUEST_ERROR;
export const UNAUTHORIZED_ERROR = "unauthorized" as const;
export type UnauthorizedError = typeof UNAUTHORIZED_ERROR;
export const PAYMENT_REQUIRED_ERROR = "payment_required" as const;
export type PaymentRequiredError = typeof PAYMENT_REQUIRED_ERROR;
export const FORBIDDEN_ERROR = "forbidden" as const;
export type ForbiddenError = typeof FORBIDDEN_ERROR;
export const NOT_FOUND_ERROR = "not_found" as const;
export type NotFoundError = typeof NOT_FOUND_ERROR;
export const METHOD_NOT_ALLOWED_ERROR = "method_not_allowed" as const;
export type MethodNotAllowedError = typeof METHOD_NOT_ALLOWED_ERROR;
export const INTERNAL_SERVER_ERROR = "internal_server_error" as const;
export type InternalServerError = typeof INTERNAL_SERVER_ERROR;

export type HttpError =
  | BadRequestError
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError
  | MethodNotAllowedError
  | InternalServerError
  | (string & {});

export type ErrorResponse<TError extends HttpError = HttpError> = {
  error: TError;
  message?: string;
};

export const badRequest = <TContext extends Context, TError extends string>(
  c: TContext,
  err?: Partial<ErrorResponse<TError>>
) => {
  const { error = BAD_REQUEST_ERROR as TError, message } = err ?? {};

  return c.json<ErrorResponse<TError>>({ error, message }, 400);
};

export const unauthorized = <TContext extends Context, TError extends string>(
  c: TContext,
  err?: Partial<ErrorResponse<TError>>
) => {
  const { error = UNAUTHORIZED_ERROR as TError, message } = err ?? {};

  return c.json<ErrorResponse<TError>>({ error, message }, 401);
};

export const paymentRequired = <TContext extends Context, TError extends string>(
  c: TContext,
  err?: Partial<ErrorResponse<TError>>
) => {
  const { error = PAYMENT_REQUIRED_ERROR as TError, message } = err ?? {};

  return c.json<ErrorResponse<TError>>({ error, message }, 402);
};

export const forbidden = <TContext extends Context, TError extends string>(
  c: TContext,
  err?: Partial<ErrorResponse<TError>>
) => {
  const { error = FORBIDDEN_ERROR as TError, message } = err ?? {};

  return c.json<ErrorResponse<TError>>({ error, message }, 403);
};

export const notFound = <TContext extends Context, TError extends string>(
  c: TContext,
  err?: Partial<ErrorResponse<TError>>
) => {
  const { error = NOT_FOUND_ERROR as TError, message } = err ?? {};

  return c.json<ErrorResponse<TError>>({ error, message }, 404);
};

export const methodNotAllowed = <TContext extends Context, TError extends string>(
  c: TContext,
  err?: Partial<ErrorResponse<TError>>
) => {
  const { error = METHOD_NOT_ALLOWED_ERROR as TError, message } = err ?? {};

  return c.json<ErrorResponse<TError>>({ error, message }, 405);
};

export const unexpectedError = <TContext extends Context>(c: TContext) =>
  c.json<ErrorResponse<typeof INTERNAL_SERVER_ERROR>>(
    { error: INTERNAL_SERVER_ERROR, message: "Unexpected error occured" },
    500
  );

export function ok<TContext extends Context>(c: TContext): Response & TypedResponse<JSONParsed<undefined>, 200, "json">;
export function ok<TContext extends Context, TPayload>(
  c: TContext,
  payload: TPayload
): Response & TypedResponse<JSONParsed<TPayload>, 200, "json">;

export function ok<TContext extends Context, TPayload>(c: TContext, payload?: TPayload) {
  return c.json(payload ?? undefined, 200);
}
export function created<TContext extends Context>(
  c: TContext
): Response & TypedResponse<JSONParsed<undefined>, 201, "json">;
export function created<TContext extends Context, TPayload>(
  c: TContext,
  payload: TPayload
): Response & TypedResponse<JSONParsed<TPayload>, 201, "json">;

export function created<TContext extends Context, TPayload>(c: TContext, payload?: TPayload) {
  return c.json(payload ?? undefined, 201);
}
