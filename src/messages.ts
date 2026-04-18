import type { Transport } from "./transport.js";
import type {
  BooleanSuccessResponse,
  LinkPreviewMessageRequest,
  SeenRequest,
  SendFileRequest,
  SendImageRequest,
  SendRequest,
  SendTextRequest,
  SendVideoRequest,
  SendVoiceRequest,
  SentMessage,
  TypingRequest
} from "./types.js";

export class MessagesResource {
  constructor(private readonly transport: Transport) {}

  send(input: SendRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/send",
      body: input
    });
  }

  sendText(input: SendTextRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/sendText",
      body: input
    });
  }

  sendImage(input: SendImageRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/sendImage",
      body: input
    });
  }

  sendFile(input: SendFileRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/sendFile",
      body: input
    });
  }

  sendVoice(input: SendVoiceRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/sendVoice",
      body: input
    });
  }

  sendVideo(input: SendVideoRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/sendVideo",
      body: input
    });
  }

  sendLinkCustomPreview(input: LinkPreviewMessageRequest): Promise<SentMessage> {
    return this.transport.request({
      method: "POST",
      path: "/sendLinkCustomPreview",
      body: input
    });
  }

  markSeen(input: SeenRequest): Promise<BooleanSuccessResponse> {
    return this.transport.request({
      method: "POST",
      path: "/sendSeen",
      body: input
    });
  }

  startTyping(input: TypingRequest): Promise<BooleanSuccessResponse> {
    return this.transport.request({
      method: "POST",
      path: "/startTyping",
      body: input
    });
  }

  stopTyping(input: TypingRequest): Promise<BooleanSuccessResponse> {
    return this.transport.request({
      method: "POST",
      path: "/stopTyping",
      body: input
    });
  }
}
