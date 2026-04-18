# API Mapping

This document maps SDK methods to Chatsend HTTP API endpoints.

## Client

```ts
const client = new ChatsendClient({
  baseUrl: "http://localhost:8080",
  apiKey: "dev-key"
});
```

All business endpoints use Bearer authentication when `apiKey` is configured.

## Health

| SDK method | HTTP endpoint | Response type |
| --- | --- | --- |
| `client.health.check()` | `GET /health` | `HealthEnvelope` |

## Sessions

| SDK method | HTTP endpoint | Request type | Response type |
| --- | --- | --- | --- |
| `client.sessions.list()` | `GET /sessions` | None | `ListSessionsResponse` |
| `client.sessions.create(input)` | `POST /sessions` | `CreateSessionRequest` | `Session` |
| `client.sessions.get(sessionId)` | `GET /sessions/{sessionId}` | None | `SessionWithConfig` |
| `client.sessions.getQr(sessionId)` | `GET /sessions/{sessionId}/qr` | None | `QrResponse` |
| `client.sessions.stop(sessionId)` | `POST /sessions/{sessionId}/stop` | None | `Session` |
| `client.sessions.restart(sessionId)` | `POST /sessions/{sessionId}/restart` | None | `Session` |
| `client.sessions.delete(sessionId)` | `DELETE /sessions/{sessionId}` | None | `DeleteSessionResponse` |

`getQr` treats HTTP `202` as a successful response. In that case `data` can be `null`.

## Messages

| SDK method | HTTP endpoint | Request type | Response type |
| --- | --- | --- | --- |
| `client.messages.send(input)` | `POST /send` | `SendRequest` | `SentMessage` |
| `client.messages.sendText(input)` | `POST /sendText` | `SendTextRequest` | `SentMessage` |
| `client.messages.sendImage(input)` | `POST /sendImage` | `SendImageRequest` | `SentMessage` |
| `client.messages.sendFile(input)` | `POST /sendFile` | `SendFileRequest` | `SentMessage` |
| `client.messages.sendVoice(input)` | `POST /sendVoice` | `SendVoiceRequest` | `SentMessage` |
| `client.messages.sendVideo(input)` | `POST /sendVideo` | `SendVideoRequest` | `SentMessage` |
| `client.messages.sendLinkCustomPreview(input)` | `POST /sendLinkCustomPreview` | `LinkPreviewMessageRequest` | `SentMessage` |
| `client.messages.markSeen(input)` | `POST /sendSeen` | `SeenRequest` | `BooleanSuccessResponse` |
| `client.messages.startTyping(input)` | `POST /startTyping` | `TypingRequest` | `BooleanSuccessResponse` |
| `client.messages.stopTyping(input)` | `POST /stopTyping` | `TypingRequest` | `BooleanSuccessResponse` |

## Groups

| SDK method | HTTP endpoint | Request type | Response type |
| --- | --- | --- | --- |
| `client.groups.list(sessionId, query)` | `GET /{sessionId}/groups` | `ListGroupsQuery` query params | `ListGroupsResponse` |
| `client.groups.create(sessionId, input)` | `POST /{sessionId}/groups` | `CreateGroupRequest` | `Group` |
| `client.groups.count(sessionId)` | `GET /{sessionId}/groups/count` | None | `unknown` |
| `client.groups.joinInfo(sessionId, query)` | `GET /{sessionId}/groups/join-info` | `JoinGroupRequest` query params | `unknown` |
| `client.groups.join(sessionId, input)` | `POST /{sessionId}/groups/join` | `JoinGroupRequest` | `unknown` |
| `client.groups.getInfo(sessionId, groupId)` | `GET /{sessionId}/groups/{groupId}/info` | None | `unknown` |
| `client.groups.leave(sessionId, groupId)` | `POST /{sessionId}/groups/{groupId}/leave` | Empty object | `BooleanSuccessResponse` |
| `client.groups.getInviteCode(sessionId, groupId)` | `GET /{sessionId}/groups/{groupId}/invite-code` | None | `unknown` |
| `client.groups.revokeInviteCode(sessionId, groupId)` | `POST /{sessionId}/groups/{groupId}/invite-code/revoke` | Empty object | `unknown` |
| `client.groups.getPicture(sessionId, groupId)` | `GET /{sessionId}/groups/{groupId}/picture` | None | `unknown` |
| `client.groups.setPicture(sessionId, groupId, input)` | `PUT /{sessionId}/groups/{groupId}/picture` | `PictureRequest` | `unknown` |
| `client.groups.deletePicture(sessionId, groupId)` | `DELETE /{sessionId}/groups/{groupId}/picture` | None | `BooleanSuccessResponse` |
| `client.groups.setDescription(sessionId, groupId, input)` | `PUT /{sessionId}/groups/{groupId}/description` | `DescriptionRequest` | `unknown` |
| `client.groups.setSubject(sessionId, groupId, input)` | `PUT /{sessionId}/groups/{groupId}/subject` | `SubjectRequest` | `unknown` |
| `client.groups.getInfoAdminOnly(sessionId, groupId)` | `GET /{sessionId}/groups/{groupId}/settings/security/info-admin-only` | None | `unknown` |
| `client.groups.setInfoAdminOnly(sessionId, groupId, input)` | `PUT /{sessionId}/groups/{groupId}/settings/security/info-admin-only` | `EnabledRequest` | `unknown` |
| `client.groups.getMessagesAdminOnly(sessionId, groupId)` | `GET /{sessionId}/groups/{groupId}/settings/security/messages-admin-only` | None | `unknown` |
| `client.groups.setMessagesAdminOnly(sessionId, groupId, input)` | `PUT /{sessionId}/groups/{groupId}/settings/security/messages-admin-only` | `EnabledRequest` | `unknown` |

## Group Participants

| SDK method | HTTP endpoint | Request type | Response type |
| --- | --- | --- | --- |
| `client.groups.participants.list(sessionId, groupId)` | `GET /{sessionId}/groups/{groupId}/participants` | None | `{ participants: GroupParticipant[] }` |
| `client.groups.participants.add(sessionId, groupId, input)` | `POST /{sessionId}/groups/{groupId}/participants/add` | `ParticipantsRequest` | `unknown` |
| `client.groups.participants.remove(sessionId, groupId, input)` | `DELETE /{sessionId}/groups/{groupId}/participants` | `ParticipantsRequest` | `unknown` |
| `client.groups.participants.promote(sessionId, groupId, input)` | `POST /{sessionId}/groups/{groupId}/participants/promote` | `ParticipantsRequest` | `unknown` |
| `client.groups.participants.demote(sessionId, groupId, input)` | `POST /{sessionId}/groups/{groupId}/participants/demote` | `ParticipantsRequest` | `unknown` |

## Query Encoding

Array query values are encoded as repeated parameters:

```ts
await client.groups.list("session_123", {
  exclude: ["participants", "settings"],
  tags: ["vip", "team"]
});
```

Produces:

```text
/{sessionId}/groups?exclude=participants&exclude=settings&tags=vip&tags=team
```

## Error Behavior

All non-2xx HTTP responses throw `ChatsendApiError`.

The SDK copies server error fields when the API returns:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "session is required"
  }
}
```

The resulting error includes:

```ts
error.status;   // 400
error.code;     // "VALIDATION_ERROR"
error.message;  // "session is required"
error.response; // original parsed response body
```
