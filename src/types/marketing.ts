export type MarketingPlatform = "instagram" | "facebook" | "tiktok";

export type MarketingReviewAction = "approve" | "reject" | "regenerate";

export type MarketingStatus =
  | "DRAFT"
  | "VIDEO_REVIEW_REQUIRED"
  | "APPROVED_AND_PUBLISHED"
  | "REGENERATED_FOR_REVIEW"
  | "REJECTED"
  | "FAILED";

export interface MarketingGenerationRequest {
  angle: string;
  campaign: string;
  hook: string;
  strictVideoPrompt: string;
  instagramCaption: string;
  facebookPost: string;
  tiktokCaption: string;
  platforms: MarketingPlatform[];
}

export interface MarketingGenerationPayload {
  angle?: string;
  hook?: string;
  video_script_10s?: string;
  visualNotes?: string;
  strictVideoPrompt?: string;
  instagramCaption?: string;
  facebookPost?: string;
  tiktokCaption?: string;
  youtubeTitle?: string;
  youtubeDescription?: string;
  campaign?: string;
  [key: string]: unknown;
}

export interface MarketingPublishPayload {
  approved?: boolean;
  dryRun?: boolean;
  campaign?: string;
  platforms?: MarketingPlatform[];
  mediaUrl?: string;
  instagramCaption?: string;
  facebookPost?: string;
  tiktokCaption?: string;
  aiGenerated?: boolean;
  [key: string]: unknown;
}

export interface MarketingGenerationResult {
  ok?: boolean;
  status: MarketingStatus | string;
  message?: string;
  requestId?: string;
  mediaUrl?: string;
  postizMediaId?: string | null;
  campaign?: string;
  profile?: string;
  angle?: string;
  hook?: string;
  generationPayload: MarketingGenerationPayload;
  publishPayload: MarketingPublishPayload;
  reviewEndpoint?: string;
  [key: string]: unknown;
}

export interface MarketingReviewResult {
  ok?: boolean;
  status: MarketingStatus | string;
  message?: string;
  publisherResult?: unknown;
  generationResult?: MarketingGenerationResult;
  reviewedAt?: string;
  [key: string]: unknown;
}

export interface MarketingHistoryItem {
  id: string;
  campaign: string;
  angle: string;
  status: string;
  mediaUrl?: string;
  platforms: MarketingPlatform[];
  createdAt: string;
  generationPayload: MarketingGenerationPayload;
  publishPayload: MarketingPublishPayload;
}
