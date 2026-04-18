# chatsend-sdk-ts

TypeScript SDK for the Chatsend WhatsApp HTTP API. It is designed for Node.js services that need to manage WhatsApp sessions, send messages, and operate groups through the Chatsend REST API.

## Status

This package is an early SDK for the current Chatsend HTTP API. The client shape is stable enough for application integration, but some API response types still use `unknown` where the server contract needs to be tightened.

## Requirements

- Node.js 18 or newer. Node.js 20 or newer is recommended.
- A running Chatsend HTTP API service.
- A Chatsend API key configured on the server.

## Install

From npm, after publishing:

```bash
npm install chatsend-sdk-ts
```

For local development from this repository:

```bash
npm install
npm run build
```

Use it from another local project before publishing:

```bash
npm install ../chatsend-sdk-ts
```

## Quickstart

```ts
import { ChatsendApiError, ChatsendClient } from "chatsend-sdk-ts";

const client = new ChatsendClient({
  baseUrl: "http://localhost:8080",
  apiKey: "dev-key",
  timeoutMs: 30_000
});

try {
  const session = await client.sessions.create({
    sessionName: "main",
    phoneNumber: "+8613800000000",
    enableMessageLogging: true
  });

  const qr = await client.sessions.getQr(session.uniqueSessionId);
  if (qr.data) {
    console.log("QR expires at:", qr.data.expiresAt);
    console.log("QR PNG base64:", qr.data.qrCode);
  }

  await client.messages.sendText({
    session: session.uniqueSessionId,
    to: "+8613900000000",
    text: "hello"
  });
} catch (error) {
  if (error instanceof ChatsendApiError) {
    console.error(error.status, error.code, error.message);
  } else {
    throw error;
  }
}
```

## Client Options

```ts
const client = new ChatsendClient({
  baseUrl: "http://localhost:8080",
  apiKey: "dev-key",
  timeoutMs: 30_000,
  headers: {
    "x-client-name": "my-node-service"
  },
  fetch: globalThis.fetch
});
```

| Option | Required | Description |
| --- | --- | --- |
| `baseUrl` | Yes | Base URL of the Chatsend HTTP API. A trailing slash is accepted. |
| `apiKey` | No | Bearer API key. Required for all business endpoints except `/health`. |
| `timeoutMs` | No | Request timeout. Timeout failures throw `ChatsendApiError` with code `REQUEST_ABORTED`. |
| `headers` | No | Extra headers added to every request. Header names are normalized to lowercase. |
| `fetch` | No | Custom fetch implementation for tests, proxies, tracing, or special runtimes. |

## API Shape

The SDK groups endpoints by resource instead of exposing raw URL names.

### Health

```ts
await client.health.check();
```

### Sessions

```ts
await client.sessions.list();

const session = await client.sessions.create({
  sessionName: "main",
  phoneNumber: "+8613800000000"
});

await client.sessions.get(session.uniqueSessionId);
await client.sessions.getQr(session.uniqueSessionId);
await client.sessions.stop(session.uniqueSessionId);
await client.sessions.restart(session.uniqueSessionId);
await client.sessions.delete(session.uniqueSessionId);
```

### Messages

```ts
await client.messages.sendText({
  session: "session_123",
  to: "+8613900000000",
  text: "hello"
});

await client.messages.send({
  session: "session_123",
  to: "+8613900000000",
  text: "hello"
});

await client.messages.sendImage({
  session: "session_123",
  to: "+8613900000000",
  url: "https://example.com/image.jpg",
  caption: "image"
});

await client.messages.sendFile({
  session: "session_123",
  to: "+8613900000000",
  url: "https://example.com/document.pdf",
  fileName: "document.pdf",
  mimeType: "application/pdf"
});

await client.messages.sendVoice({
  session: "session_123",
  to: "+8613900000000",
  url: "https://example.com/audio.ogg"
});

await client.messages.sendVideo({
  session: "session_123",
  to: "+8613900000000",
  url: "https://example.com/video.mp4",
  caption: "video"
});

await client.messages.sendLinkCustomPreview({
  session: "session_123",
  to: "+8613900000000",
  text: "Check https://example.com",
  preview: {
    title: "Example",
    description: "Example website",
    thumbnailUrl: "https://example.com/preview.jpg"
  }
});

await client.messages.markSeen({
  session: "session_123",
  to: "+8613900000000",
  messageId: "3EB0..."
});

await client.messages.startTyping({
  session: "session_123",
  to: "+8613900000000"
});

await client.messages.stopTyping({
  session: "session_123",
  to: "+8613900000000"
});
```

### Groups

```ts
await client.groups.list("session_123", {
  limit: 50,
  offset: 0,
  sortBy: "name",
  sortOrder: "asc",
  exclude: ["participants", "settings"],
  tags: ["vip", "team"]
});

const group = await client.groups.create("session_123", {
  name: "My Group",
  participants: [
    { id: "+8613900000000", isAdmin: true }
  ],
  description: "Team chat"
});

await client.groups.getInfo("session_123", "120363025988123456@g.us");
await client.groups.join("session_123", { inviteCode: "ABC123XYZ" });
await client.groups.leave("session_123", "120363025988123456@g.us");

await client.groups.participants.add("session_123", "120363025988123456@g.us", {
  participants: ["+8613900000000"],
  notify: true
});

await client.groups.participants.promote("session_123", "120363025988123456@g.us", {
  participants: ["+8613900000000"]
});
```

## Error Handling

Non-2xx responses and request failures throw `ChatsendApiError`.

```ts
import { ChatsendApiError } from "chatsend-sdk-ts";

try {
  await client.messages.sendText({
    session: "session_123",
    to: "+8613900000000",
    text: "hello"
  });
} catch (error) {
  if (error instanceof ChatsendApiError) {
    console.error({
      status: error.status,
      code: error.code,
      message: error.message,
      response: error.response
    });
  }
}
```

Common client-side error codes:

| Code | Meaning |
| --- | --- |
| `REQUEST_ABORTED` | The request was aborted, usually because `timeoutMs` elapsed. |
| `REQUEST_FAILED` | The fetch call failed before an HTTP response was available. |

Server-side error codes are passed through from the HTTP API response body.

## Build and Test

```bash
npm test
npm run typecheck
npm run build
```

The build emits ESM, CJS, and declaration files into `dist/`.

## Documentation

- [Development guide](docs/DEVELOPMENT.md)
- [API mapping](docs/API.md)
