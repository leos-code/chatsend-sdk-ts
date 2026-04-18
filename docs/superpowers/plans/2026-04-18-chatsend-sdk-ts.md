# Chatsend SDK TS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone TypeScript SDK for Node.js projects using resource-grouped APIs.

**Architecture:** The SDK exposes `ChatsendClient` with `sessions`, `messages`, and `groups` modules. A shared fetch transport handles base URL joining, Bearer authentication, JSON encoding, timeouts, query strings, and API error normalization.

**Tech Stack:** TypeScript, Node.js fetch, Vitest, tsup.

---

### Task 1: Package Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`

- [x] **Step 1: Add package metadata and scripts**

Add ESM/CJS build output, `test`, `typecheck`, and `build` scripts.

- [x] **Step 2: Add TypeScript and Vitest config**

Use strict TypeScript settings and Node test environment.

### Task 2: Client Behavior Tests

**Files:**
- Create: `test/client.test.ts`

- [x] **Step 1: Write failing tests**

Cover resource grouping, bearer headers, JSON body serialization, query encoding, 202 QR responses, API error parsing, and timeout abort behavior.

- [x] **Step 2: Run tests and observe failure**

Run: `npm test`

Expected: tests fail because `src/index.ts` and the client implementation do not exist.

### Task 3: SDK Implementation

**Files:**
- Create: `src/index.ts`
- Create: `src/client.ts`
- Create: `src/errors.ts`
- Create: `src/transport.ts`
- Create: `src/types.ts`
- Create: `src/sessions.ts`
- Create: `src/messages.ts`
- Create: `src/groups.ts`

- [x] **Step 1: Implement shared types and errors**

Define request/response interfaces matching the current Chatsend HTTP API and `ChatsendApiError`.

- [x] **Step 2: Implement transport**

Build a small fetch wrapper with base URL joining, JSON parsing, auth header handling, query serialization, and timeout support.

- [x] **Step 3: Implement resource modules**

Expose `client.sessions`, `client.messages`, and `client.groups` with business-oriented method names.

- [x] **Step 4: Export public API**

Export `ChatsendClient`, errors, and public types from `src/index.ts`.

### Task 4: Documentation and Verification

**Files:**
- Create: `README.md`

- [x] **Step 1: Add quickstart docs**

Show initialization and representative session/message/group calls.

- [x] **Step 2: Verify**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands exit 0.
