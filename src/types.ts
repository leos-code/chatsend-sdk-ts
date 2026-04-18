export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export type ChatsendClientOptions = {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetch?: FetchLike;
};

export type ErrorBody = {
  code: string;
  message: string;
};

export type ErrorEnvelope = {
  success: false;
  data: unknown | null;
  error: ErrorBody | null;
};

export type HealthEnvelope = {
  success: boolean;
  data: {
    status: string;
  };
  error: ErrorBody | null;
};

export type SessionStatus =
  | "CREATED"
  | "STARTING"
  | "QR_REQUIRED"
  | "CONNECTED"
  | "STOPPED"
  | "ERROR"
  | string;

export type Session = {
  uniqueSessionId: string;
  sessionName: string;
  phoneNumber: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
};

export type SessionConfig = {
  enableAccountProtection: boolean;
  enableMessageLogging: boolean;
  enableWebhook: boolean;
  webhookUrl: string;
};

export type SessionWithConfig = Session & {
  config: SessionConfig;
};

export type CreateSessionRequest = {
  sessionName: string;
  phoneNumber: string;
  enableAccountProtection?: boolean;
  enableMessageLogging?: boolean;
  enableWebhook?: boolean;
  webhookUrl?: string;
};

export type ListSessionsResponse = {
  sessions: Array<{
    session: Session;
  }>;
};

export type DeleteSessionResponse = {
  success: boolean;
};

export type QrResponse = {
  data: {
    qrCode: string;
    expiresAt: string;
  } | null;
};

export type SentMessage = {
  id: string;
  content: string;
  type: string;
  timestamp: string;
  status: string;
  fromMe: boolean;
  sender: string;
  to: string;
  recipient: string;
};

export type SendTextRequest = {
  session: string;
  to: string;
  text: string;
  replyTo?: string;
};

export type SendRequest = {
  session: string;
  to: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  audioUrl?: string;
  mimetype?: string;
  filename?: string;
  preview?: LinkPreviewRequest;
};

export type SendImageRequest = {
  session: string;
  to: string;
  url?: string;
  data?: string;
  caption?: string;
};

export type SendFileRequest = {
  session: string;
  to: string;
  url?: string;
  data?: string;
  fileName: string;
  mimeType: string;
};

export type SendVoiceRequest = {
  session: string;
  to: string;
  url?: string;
  data?: string;
};

export type SendVideoRequest = {
  session: string;
  to: string;
  url?: string;
  data?: string;
  caption?: string;
};

export type LinkPreviewRequest = {
  title: string;
  description?: string;
  thumbnailUrl?: string;
};

export type LinkPreviewMessageRequest = {
  session: string;
  to: string;
  text: string;
  preview: LinkPreviewRequest;
};

export type SeenRequest = {
  session: string;
  to: string;
  messageId: string;
};

export type TypingRequest = {
  session: string;
  to: string;
};

export type BooleanSuccessResponse = {
  success: boolean;
};

export type GroupParticipantRequest = {
  id: string;
  isAdmin?: boolean;
};

export type CreateGroupRequest = {
  name: string;
  participants: GroupParticipantRequest[];
  description?: string;
  pictureUrl?: string;
  tags?: string[];
};

export type Group = {
  jid?: string;
  id?: string;
  name: string;
  ownerJid?: string;
  ownerPn?: string;
  description?: string;
  participantsCount?: number;
  participants?: GroupParticipant[];
  isAnnounce?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  status?: string;
  settings?: GroupSettings;
};

export type GroupSettings = {
  infoAdminOnly: boolean;
  messagesAdminOnly: boolean;
};

export type GroupParticipant = {
  jid?: string;
  id?: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  displayName?: string;
  reason?: string;
};

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ListGroupsQuery = {
  sortBy?: "name" | "createdAt" | "participantsCount" | string;
  sortOrder?: "asc" | "desc" | string;
  limit?: number;
  offset?: number;
  exclude?: string | string[];
  status?: string;
  search?: string;
  tags?: string | string[];
};

export type ListGroupsResponse = {
  groups: Group[];
  pagination?: Pagination;
};

export type JoinGroupRequest = {
  inviteCode?: string;
  inviteLink?: string;
};

export type ParticipantsRequest = {
  participants: string[];
  notify?: boolean;
};

export type EnabledRequest = {
  enabled: boolean;
};

export type DescriptionRequest = {
  description: string;
};

export type SubjectRequest = {
  subject: string;
};

export type PictureRequest = {
  url: string;
};
