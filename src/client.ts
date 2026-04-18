import { GroupsResource } from "./groups.js";
import { MessagesResource } from "./messages.js";
import { SessionsResource } from "./sessions.js";
import { Transport } from "./transport.js";
import type { ChatsendClientOptions, HealthEnvelope } from "./types.js";

export class ChatsendClient {
  readonly health: {
    check: () => Promise<HealthEnvelope>;
  };
  readonly sessions: SessionsResource;
  readonly messages: MessagesResource;
  readonly groups: GroupsResource;

  constructor(options: ChatsendClientOptions) {
    const transport = new Transport(options);
    this.health = {
      check: () => transport.request({ path: "/health" })
    };
    this.sessions = new SessionsResource(transport);
    this.messages = new MessagesResource(transport);
    this.groups = new GroupsResource(transport);
  }
}
