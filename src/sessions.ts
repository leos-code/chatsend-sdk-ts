import type { Transport } from "./transport.js";
import type {
  CreateSessionRequest,
  DeleteSessionResponse,
  ListSessionsResponse,
  QrResponse,
  Session,
  SessionWithConfig
} from "./types.js";

export class SessionsResource {
  constructor(private readonly transport: Transport) {}

  list(): Promise<ListSessionsResponse> {
    return this.transport.request({ path: "/sessions" });
  }

  create(input: CreateSessionRequest): Promise<Session> {
    return this.transport.request({
      method: "POST",
      path: "/sessions",
      body: input
    });
  }

  get(sessionId: string): Promise<SessionWithConfig> {
    return this.transport.request({
      path: `/sessions/${encodeURIComponent(sessionId)}`
    });
  }

  delete(sessionId: string): Promise<DeleteSessionResponse> {
    return this.transport.request({
      method: "DELETE",
      path: `/sessions/${encodeURIComponent(sessionId)}`
    });
  }

  getQr(sessionId: string): Promise<QrResponse> {
    return this.transport.request({
      path: `/sessions/${encodeURIComponent(sessionId)}/qr`
    });
  }

  restart(sessionId: string): Promise<Session> {
    return this.transport.request({
      method: "POST",
      path: `/sessions/${encodeURIComponent(sessionId)}/restart`
    });
  }

  stop(sessionId: string): Promise<Session> {
    return this.transport.request({
      method: "POST",
      path: `/sessions/${encodeURIComponent(sessionId)}/stop`
    });
  }
}
