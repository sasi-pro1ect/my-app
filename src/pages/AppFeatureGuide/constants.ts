export const MEDIA_TYPES = {
  IMAGE: "images",
  VIDEO: "video",
} as const;

export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES];
