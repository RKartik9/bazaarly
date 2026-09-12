export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(what = "Resource") {
    super(`${what} not found.`, 404);
    this.name = "NotFoundError";
  }
}

export function isKnownError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;
  return ["AppError", "NotFoundError", "AuthRequiredError", "ForbiddenError", "RateLimitError"].includes(
    error.name,
  );
}
