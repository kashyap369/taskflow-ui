export enum MeetingAssetScanStatus { Pending = 1, Clean = 2, Rejected = 3, Failed = 4 }
export interface MeetingMessage { id: number; clientMessageId: string; authorParticipantId: number; authorName: string; body: string; replyToMessageId: number | null; createdAt: string; }
export interface MeetingMessagePage { items: MeetingMessage[]; total: number; skip: number; take: number; }
export interface MeetingNote { content: string; version: number; lastEditedByParticipantId: number | null; lastEditedByName: string | null; updatedAt: string | null; canEdit: boolean; }
export interface MeetingAsset { id: number; fileName: string; contentType: string; sizeBytes: number; sha256: string; scanStatus: MeetingAssetScanStatus; uploaderParticipantId: number; uploaderName: string; createdAt: string; canDelete: boolean; }
export interface MeetingAttendance { participantId: number; displayName: string; joinedAtUtc: string; leftAtUtc: string | null; durationSeconds: number; }
export interface MeetingArchive { meetingId: number; title: string; status: number; actualStartUtc: string | null; actualEndUtc: string | null; retainUntilUtc: string; attendance: MeetingAttendance[]; messages: MeetingMessagePage; note: MeetingNote; assets: MeetingAsset[]; }
