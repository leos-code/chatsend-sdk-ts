export type ChatsendApiErrorOptions = {
  status?: number | undefined;
  code?: string | undefined;
  response?: unknown;
  cause?: unknown;
};

export class ChatsendApiError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly response?: unknown;

  constructor(message: string, options: ChatsendApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "ChatsendApiError";
    this.status = options.status;
    this.code = options.code;
    this.response = options.response;
  }
}
