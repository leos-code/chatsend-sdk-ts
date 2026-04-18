import { ChatsendApiError } from "./errors.js";
import type { ChatsendClientOptions, FetchLike } from "./types.js";

type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type RequestOptions = {
  method?: string;
  path: string;
  body?: unknown;
  query?: QueryParams;
};

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  } | null;
};

export class Transport {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number | undefined;
  private readonly fetchImpl: FetchLike;

  constructor(options: ChatsendClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.defaultHeaders = normalizeHeaders(options.headers ?? {});
    this.timeoutMs = options.timeoutMs;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeout = this.timeoutMs
      ? setTimeout(() => controller.abort(), this.timeoutMs)
      : undefined;

    try {
      const init: RequestInit = {
        method: options.method ?? "GET",
        headers: this.headersFor(options.body !== undefined),
        signal: controller.signal
      };
      if (options.body !== undefined) {
        init.body = JSON.stringify(options.body);
      }

      const response = await this.fetchImpl(this.urlFor(options.path, options.query), init);
      const payload = await parseJson(response);

      if (!response.ok) {
        const apiError = payload as ApiErrorPayload | null;
        throw new ChatsendApiError(
          apiError?.error?.message ?? `Chatsend API request failed with status ${response.status}`,
          {
            status: response.status,
            code: apiError?.error?.code,
            response: payload
          }
        );
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ChatsendApiError) {
        throw error;
      }
      if (isAbortError(error)) {
        throw new ChatsendApiError("Chatsend API request was aborted", {
          code: "REQUEST_ABORTED",
          cause: error
        });
      }
      throw new ChatsendApiError("Chatsend API request failed", {
        code: "REQUEST_FAILED",
        cause: error
      });
    } finally {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }
  }

  private urlFor(path: string, query?: QueryParams): string {
    const cleanPath = path.replace(/^\/+/, "");
    const url = new URL(`${this.baseUrl}/${cleanPath}`);

    for (const [key, value] of Object.entries(query ?? {})) {
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      }
    }

    return url.toString();
  }

  private headersFor(hasBody: boolean): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders
    };

    if (this.apiKey) {
      headers.authorization = `Bearer ${this.apiKey}`;
    }
    if (hasBody) {
      headers["content-type"] = "application/json";
    }

    return headers;
  }
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }
  return JSON.parse(text);
}

function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === "AbortError"
  ) || (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}
