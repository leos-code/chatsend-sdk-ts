import { describe, expect, it, vi } from "vitest";
import { ChatsendApiError, ChatsendClient } from "../src/index.js";

type FetchCall = [string, RequestInit];

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...Object.fromEntries(new Headers(init.headers).entries())
    }
  });
}

function emptyResponse(init: ResponseInit = {}): Response {
  const responseInit: ResponseInit = {
    status: init.status ?? 204
  };
  if (init.headers !== undefined) {
    responseInit.headers = init.headers;
  }
  return new Response(null, responseInit);
}

function firstFetchCall(fetchMock: ReturnType<typeof vi.fn>): FetchCall {
  return fetchMock.mock.calls[0] as unknown as FetchCall;
}

function fetchUrls(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls.map((call) => (call as unknown as FetchCall)[0]);
}

function fetchMethodAndUrls(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls.map((call) => {
    const [url, init] = call as unknown as FetchCall;
    return `${init.method ?? "GET"} ${url}`;
  });
}

describe("ChatsendClient", () => {
  it("sends bearer auth and JSON body for session creation", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        uniqueSessionId: "session_123",
        sessionName: "main",
        phoneNumber: "+8613800000000",
        status: "CREATED",
        createdAt: "2026-04-18T00:00:00Z",
        updatedAt: "2026-04-18T00:00:00Z"
      })
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080/",
      apiKey: "dev-key",
      fetch: fetchMock
    });

    await client.sessions.create({
      sessionName: "main",
      phoneNumber: "+8613800000000"
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = firstFetchCall(fetchMock);
    expect(url).toBe("http://localhost:8080/sessions");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      authorization: "Bearer dev-key",
      "content-type": "application/json"
    });
    expect(init.body).toBe(
      JSON.stringify({
        sessionName: "main",
        phoneNumber: "+8613800000000"
      })
    );
  });

  it("merges custom headers and omits content-type when a request has no body", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ success: true, data: { status: "ok" }, error: null })
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      apiKey: "dev-key",
      headers: {
        "X-Client-Name": "test-runner"
      },
      fetch: fetchMock
    });

    await client.health.check();

    const [url, init] = firstFetchCall(fetchMock);
    expect(url).toBe("http://localhost:8080/health");
    expect(init.headers).toMatchObject({
      authorization: "Bearer dev-key",
      "x-client-name": "test-runner"
    });
    expect(init.headers).not.toHaveProperty("content-type");
  });

  it("returns undefined for successful empty responses", async () => {
    const fetchMock = vi.fn(async () => emptyResponse());
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await expect(client.health.check()).resolves.toBeUndefined();
  });

  it("keeps 202 QR responses as successful results", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ data: null }, { status: 202 }));
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      apiKey: "dev-key",
      fetch: fetchMock
    });

    const qr = await client.sessions.getQr("session_123");

    expect(qr).toEqual({ data: null });
  });

  it("encodes group list query params including arrays", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        groups: [],
        pagination: { total: 0, limit: 10, offset: 0, hasMore: false }
      })
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080/api",
      apiKey: "dev-key",
      fetch: fetchMock
    });

    await client.groups.list("session_123", {
      limit: 10,
      offset: 0,
      exclude: ["participants", "settings"],
      tags: ["vip", "team"]
    });

    const [url] = firstFetchCall(fetchMock);
    expect(url).toBe(
      "http://localhost:8080/api/session_123/groups?limit=10&offset=0&exclude=participants&exclude=settings&tags=vip&tags=team"
    );
  });

  it("omits null and undefined query params but keeps zero and empty strings", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await client.groups.list("session_123", {
      limit: 0,
      search: "",
      tags: ["vip", undefined] as unknown as string[],
      status: null as unknown as string
    });

    const [url] = firstFetchCall(fetchMock);
    expect(url).toBe("http://localhost:8080/session_123/groups?limit=0&search=&tags=vip");
  });

  it("throws ChatsendApiError with status and API code", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "session is required"
          }
        },
        { status: 400 }
      )
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      apiKey: "dev-key",
      fetch: fetchMock
    });

    await expect(
      client.messages.sendText({
        session: "",
        to: "+8613900000000",
        text: "hello"
      })
    ).rejects.toMatchObject({
      name: "ChatsendApiError",
      status: 400,
      code: "VALIDATION_ERROR",
      message: "session is required"
    });
  });

  it("uses a fallback error message when an error response has no error body", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: "not the envelope" }, { status: 500 }));
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await expect(client.health.check()).rejects.toMatchObject({
      name: "ChatsendApiError",
      status: 500,
      message: "Chatsend API request failed with status 500",
      response: { message: "not the envelope" }
    });
  });

  it("wraps fetch failures without an HTTP response", async () => {
    const networkError = new TypeError("connection refused");
    const fetchMock = vi.fn(async () => {
      throw networkError;
    });
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    const error = await client.health.check().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ChatsendApiError);
    expect(error).toMatchObject({
      code: "REQUEST_FAILED",
      message: "Chatsend API request failed"
    });
    expect((error as Error).cause).toBe(networkError);
  });

  it("aborts requests when timeoutMs elapses", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        })
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      apiKey: "dev-key",
      fetch: fetchMock,
      timeoutMs: 50
    });

    const promise = client.health.check().catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(51);

    const error = await promise;
    expect(error).toBeInstanceOf(ChatsendApiError);
    expect(error).toMatchObject({
      code: "REQUEST_ABORTED"
    });
    vi.useRealTimers();
  });

  it("encodes session path params", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        uniqueSessionId: "session id/with slash",
        sessionName: "main",
        phoneNumber: "+8613800000000",
        status: "CONNECTED",
        createdAt: "2026-04-18T00:00:00Z",
        updatedAt: "2026-04-18T00:00:00Z",
        config: {
          enableAccountProtection: true,
          enableMessageLogging: true,
          enableWebhook: false,
          webhookUrl: ""
        }
      })
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await client.sessions.get("session id/with slash");

    const [url] = firstFetchCall(fetchMock);
    expect(url).toBe("http://localhost:8080/sessions/session%20id%2Fwith%20slash");
  });

  it("routes message methods to their HTTP endpoints", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        id: "3EB0",
        content: "ok",
        type: "text",
        timestamp: "2026-04-18T00:00:00Z",
        status: "sent",
        fromMe: true,
        sender: "sender@s.whatsapp.net",
        to: "to@s.whatsapp.net",
        recipient: "+8613900000000"
      })
    );
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await client.messages.send({ session: "s1", to: "+1", text: "hello" });
    await client.messages.sendText({ session: "s1", to: "+1", text: "hello" });
    await client.messages.sendImage({ session: "s1", to: "+1", url: "https://example.com/a.jpg" });
    await client.messages.sendFile({
      session: "s1",
      to: "+1",
      url: "https://example.com/a.pdf",
      fileName: "a.pdf",
      mimeType: "application/pdf"
    });
    await client.messages.sendVoice({ session: "s1", to: "+1", url: "https://example.com/a.ogg" });
    await client.messages.sendVideo({ session: "s1", to: "+1", url: "https://example.com/a.mp4" });
    await client.messages.sendLinkCustomPreview({
      session: "s1",
      to: "+1",
      text: "hello",
      preview: { title: "Example" }
    });

    expect(fetchUrls(fetchMock)).toEqual([
      "http://localhost:8080/send",
      "http://localhost:8080/sendText",
      "http://localhost:8080/sendImage",
      "http://localhost:8080/sendFile",
      "http://localhost:8080/sendVoice",
      "http://localhost:8080/sendVideo",
      "http://localhost:8080/sendLinkCustomPreview"
    ]);
    for (const call of fetchMock.mock.calls as unknown as FetchCall[]) {
      expect(call[1].method).toBe("POST");
    }
  });

  it("routes group management methods to their HTTP endpoints", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ success: true }));
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await client.groups.create("s1", { name: "Team", participants: [{ id: "+1" }] });
    await client.groups.count("s1");
    await client.groups.joinInfo("s1", { inviteCode: "ABC" });
    await client.groups.join("s1", { inviteLink: "https://chat.whatsapp.com/ABC" });
    await client.groups.getInfo("s1", "g1@g.us");
    await client.groups.leave("s1", "g1@g.us");
    await client.groups.getInviteCode("s1", "g1@g.us");
    await client.groups.revokeInviteCode("s1", "g1@g.us");
    await client.groups.getPicture("s1", "g1@g.us");
    await client.groups.setPicture("s1", "g1@g.us", { url: "https://example.com/g.jpg" });
    await client.groups.deletePicture("s1", "g1@g.us");
    await client.groups.setDescription("s1", "g1@g.us", { description: "New" });
    await client.groups.setSubject("s1", "g1@g.us", { subject: "Subject" });
    await client.groups.getInfoAdminOnly("s1", "g1@g.us");
    await client.groups.setInfoAdminOnly("s1", "g1@g.us", { enabled: true });
    await client.groups.getMessagesAdminOnly("s1", "g1@g.us");
    await client.groups.setMessagesAdminOnly("s1", "g1@g.us", { enabled: false });

    expect(fetchMethodAndUrls(fetchMock)).toEqual([
      "POST http://localhost:8080/s1/groups",
      "GET http://localhost:8080/s1/groups/count",
      "GET http://localhost:8080/s1/groups/join-info?inviteCode=ABC",
      "POST http://localhost:8080/s1/groups/join",
      "GET http://localhost:8080/s1/groups/g1%40g.us/info",
      "POST http://localhost:8080/s1/groups/g1%40g.us/leave",
      "GET http://localhost:8080/s1/groups/g1%40g.us/invite-code",
      "POST http://localhost:8080/s1/groups/g1%40g.us/invite-code/revoke",
      "GET http://localhost:8080/s1/groups/g1%40g.us/picture",
      "PUT http://localhost:8080/s1/groups/g1%40g.us/picture",
      "DELETE http://localhost:8080/s1/groups/g1%40g.us/picture",
      "PUT http://localhost:8080/s1/groups/g1%40g.us/description",
      "PUT http://localhost:8080/s1/groups/g1%40g.us/subject",
      "GET http://localhost:8080/s1/groups/g1%40g.us/settings/security/info-admin-only",
      "PUT http://localhost:8080/s1/groups/g1%40g.us/settings/security/info-admin-only",
      "GET http://localhost:8080/s1/groups/g1%40g.us/settings/security/messages-admin-only",
      "PUT http://localhost:8080/s1/groups/g1%40g.us/settings/security/messages-admin-only"
    ]);
  });

  it("routes participant methods to their HTTP endpoints", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ success: true, participants: [] }));
    const client = new ChatsendClient({
      baseUrl: "http://localhost:8080",
      fetch: fetchMock
    });

    await client.groups.participants.list("s1", "g1@g.us");
    await client.groups.participants.add("s1", "g1@g.us", { participants: ["+1"] });
    await client.groups.participants.remove("s1", "g1@g.us", { participants: ["+1"] });
    await client.groups.participants.promote("s1", "g1@g.us", { participants: ["+1"] });
    await client.groups.participants.demote("s1", "g1@g.us", { participants: ["+1"] });

    expect(fetchMethodAndUrls(fetchMock)).toEqual([
      "GET http://localhost:8080/s1/groups/g1%40g.us/participants",
      "POST http://localhost:8080/s1/groups/g1%40g.us/participants/add",
      "DELETE http://localhost:8080/s1/groups/g1%40g.us/participants",
      "POST http://localhost:8080/s1/groups/g1%40g.us/participants/promote",
      "POST http://localhost:8080/s1/groups/g1%40g.us/participants/demote"
    ]);
  });
});
