# Development Guide

This document is for maintainers of `chatsend-sdk-ts`.

## Project Layout

```text
src/
  index.ts       Public exports.
  client.ts      `ChatsendClient` root object and resource wiring.
  transport.ts   Shared fetch wrapper for auth, JSON, query strings, timeout, and errors.
  errors.ts      `ChatsendApiError`.
  types.ts       Public request and response types.
  sessions.ts    Session lifecycle resource methods.
  messages.ts    Message sending, read state, and typing resource methods.
  groups.ts      Group and participant resource methods.
test/
  client.test.ts SDK behavior tests.
docs/
  API.md         SDK method to HTTP endpoint mapping.
```

## Design Rules

- Keep the public API grouped by resource: `client.sessions`, `client.messages`, `client.groups`.
- Do not expose raw transport details to application code.
- Keep request and response types exported from `src/index.ts`.
- Prefer adding precise types in `src/types.ts` over returning `unknown`.
- Preserve server response shapes. The SDK normalizes errors, not successful payloads.
- Keep path construction and query serialization in resource modules or `Transport`; do not duplicate fetch logic.

## Local Setup

```bash
npm install
npm test
npm run typecheck
npm run build
```

The package uses Node.js global `fetch`. Tests inject a custom fetch implementation, so no running Chatsend server is required for unit tests.

## Adding an Endpoint

1. Add or update the request and response types in `src/types.ts`.
2. Add the method to the correct resource module:
   - Session lifecycle: `src/sessions.ts`
   - Message operations: `src/messages.ts`
   - Group operations: `src/groups.ts`
3. Export any new public types from `src/index.ts`.
4. Add a behavior test in `test/client.test.ts` when the method changes URL construction, query handling, request body shape, or error behavior.
5. Update `docs/API.md`.
6. Update `README.md` if the method is part of common application usage.
7. Run:

```bash
npm test
npm run typecheck
npm run build
```

## Transport Behavior

`Transport` is the only place that should call `fetch`.

It is responsible for:

- Trimming trailing slashes from `baseUrl`.
- Joining base URL and endpoint paths.
- Adding `Authorization: Bearer <apiKey>` when `apiKey` is provided.
- Adding `content-type: application/json` for JSON bodies.
- Serializing request bodies with `JSON.stringify`.
- Encoding query params with `URLSearchParams`.
- Repeating array query params, for example `tags=vip&tags=team`.
- Aborting requests when `timeoutMs` elapses.
- Throwing `ChatsendApiError` for non-2xx responses and fetch failures.

## Error Model

HTTP error responses should be converted into `ChatsendApiError`:

```ts
throw new ChatsendApiError("session is required", {
  status: 400,
  code: "VALIDATION_ERROR",
  response: payload
});
```

Network failures without an HTTP response use:

- `REQUEST_ABORTED` for abort/timeout.
- `REQUEST_FAILED` for other fetch failures.

## Type Strategy

The current SDK types are hand-maintained from the Chatsend OpenAPI contract. The source service already exposes `/openapi.json`, so a future improvement is to generate `types.generated.ts` from OpenAPI and keep hand-written resource modules as the ergonomic layer.

Recommended future flow:

```text
Chatsend server /openapi.json
  -> generated TypeScript schema types
  -> hand-written resource methods
  -> exported SDK API
```

Before switching to generated types, the server OpenAPI should add stable `operationId` values for every endpoint.

## Release Checklist

Before publishing:

```bash
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

Check:

- `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/index.d.cts` are included.
- `README.md` is included.
- `node_modules/`, `src/`, and `test/` are not published unless intentionally added to `files`.

Then publish:

```bash
npm publish --access public
```

Use `npm publish --dry-run` first if package metadata or publish access has changed.

## Compatibility Notes

- The package is ESM-first and also emits CJS.
- Node.js 18+ is expected because the SDK relies on the Fetch API.
- Applications can inject a custom `fetch` for older runtimes, instrumentation, or proxy support.
- Successful response shapes follow the HTTP API; some group endpoints currently return `unknown` until stricter response types are added.
