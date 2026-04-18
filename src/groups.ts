import type { QueryParams, Transport } from "./transport.js";
import type {
  BooleanSuccessResponse,
  CreateGroupRequest,
  DescriptionRequest,
  EnabledRequest,
  Group,
  GroupParticipant,
  JoinGroupRequest,
  ListGroupsQuery,
  ListGroupsResponse,
  ParticipantsRequest,
  PictureRequest,
  SubjectRequest
} from "./types.js";

export class GroupsResource {
  readonly participants: GroupParticipantsResource;

  constructor(private readonly transport: Transport) {
    this.participants = new GroupParticipantsResource(transport);
  }

  list(sessionId: string, query?: ListGroupsQuery): Promise<ListGroupsResponse> {
    const request: { path: string; query?: QueryParams } = {
      path: `/${encodeURIComponent(sessionId)}/groups`
    };
    if (query !== undefined) {
      request.query = query as QueryParams;
    }
    return this.transport.request(request);
  }

  create(sessionId: string, input: CreateGroupRequest): Promise<Group> {
    return this.transport.request({
      method: "POST",
      path: `/${encodeURIComponent(sessionId)}/groups`,
      body: input
    });
  }

  count(sessionId: string): Promise<unknown> {
    return this.transport.request({
      path: `/${encodeURIComponent(sessionId)}/groups/count`
    });
  }

  joinInfo(sessionId: string, query: JoinGroupRequest): Promise<unknown> {
    return this.transport.request({
      path: `/${encodeURIComponent(sessionId)}/groups/join-info`,
      query: query as QueryParams
    });
  }

  join(sessionId: string, input: JoinGroupRequest): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: `/${encodeURIComponent(sessionId)}/groups/join`,
      body: input
    });
  }

  getInfo(sessionId: string, groupId: string): Promise<unknown> {
    return this.transport.request({
      path: groupPath(sessionId, groupId, "info")
    });
  }

  leave(sessionId: string, groupId: string): Promise<BooleanSuccessResponse> {
    return this.transport.request({
      method: "POST",
      path: groupPath(sessionId, groupId, "leave"),
      body: {}
    });
  }

  getInviteCode(sessionId: string, groupId: string): Promise<unknown> {
    return this.transport.request({
      path: groupPath(sessionId, groupId, "invite-code")
    });
  }

  revokeInviteCode(sessionId: string, groupId: string): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: groupPath(sessionId, groupId, "invite-code/revoke"),
      body: {}
    });
  }

  getPicture(sessionId: string, groupId: string): Promise<unknown> {
    return this.transport.request({
      path: groupPath(sessionId, groupId, "picture")
    });
  }

  setPicture(sessionId: string, groupId: string, input: PictureRequest): Promise<unknown> {
    return this.transport.request({
      method: "PUT",
      path: groupPath(sessionId, groupId, "picture"),
      body: input
    });
  }

  deletePicture(sessionId: string, groupId: string): Promise<BooleanSuccessResponse> {
    return this.transport.request({
      method: "DELETE",
      path: groupPath(sessionId, groupId, "picture")
    });
  }

  setDescription(
    sessionId: string,
    groupId: string,
    input: DescriptionRequest
  ): Promise<unknown> {
    return this.transport.request({
      method: "PUT",
      path: groupPath(sessionId, groupId, "description"),
      body: input
    });
  }

  setSubject(sessionId: string, groupId: string, input: SubjectRequest): Promise<unknown> {
    return this.transport.request({
      method: "PUT",
      path: groupPath(sessionId, groupId, "subject"),
      body: input
    });
  }

  getInfoAdminOnly(sessionId: string, groupId: string): Promise<unknown> {
    return this.transport.request({
      path: groupPath(sessionId, groupId, "settings/security/info-admin-only")
    });
  }

  setInfoAdminOnly(
    sessionId: string,
    groupId: string,
    input: EnabledRequest
  ): Promise<unknown> {
    return this.transport.request({
      method: "PUT",
      path: groupPath(sessionId, groupId, "settings/security/info-admin-only"),
      body: input
    });
  }

  getMessagesAdminOnly(sessionId: string, groupId: string): Promise<unknown> {
    return this.transport.request({
      path: groupPath(sessionId, groupId, "settings/security/messages-admin-only")
    });
  }

  setMessagesAdminOnly(
    sessionId: string,
    groupId: string,
    input: EnabledRequest
  ): Promise<unknown> {
    return this.transport.request({
      method: "PUT",
      path: groupPath(sessionId, groupId, "settings/security/messages-admin-only"),
      body: input
    });
  }
}

export class GroupParticipantsResource {
  constructor(private readonly transport: Transport) {}

  list(sessionId: string, groupId: string): Promise<{ participants: GroupParticipant[] }> {
    return this.transport.request({
      path: groupPath(sessionId, groupId, "participants")
    });
  }

  add(sessionId: string, groupId: string, input: ParticipantsRequest): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: groupPath(sessionId, groupId, "participants/add"),
      body: input
    });
  }

  remove(sessionId: string, groupId: string, input: ParticipantsRequest): Promise<unknown> {
    return this.transport.request({
      method: "DELETE",
      path: groupPath(sessionId, groupId, "participants"),
      body: input
    });
  }

  promote(sessionId: string, groupId: string, input: ParticipantsRequest): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: groupPath(sessionId, groupId, "participants/promote"),
      body: input
    });
  }

  demote(sessionId: string, groupId: string, input: ParticipantsRequest): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: groupPath(sessionId, groupId, "participants/demote"),
      body: input
    });
  }
}

function groupPath(sessionId: string, groupId: string, suffix: string): string {
  return `/${encodeURIComponent(sessionId)}/groups/${encodeURIComponent(groupId)}/${suffix}`;
}
