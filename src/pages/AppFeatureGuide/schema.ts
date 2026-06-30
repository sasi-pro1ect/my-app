import { z } from "zod";
import { MEDIA_TYPES } from "./constants";

export const MediaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  thumbnail_url: z.string().optional(),
  title: z.string().optional(),
  media_url: z.string().optional(),
  type: z.enum([MEDIA_TYPES.VIDEO, MEDIA_TYPES.IMAGE]).optional(),
});

export const StepSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  icon: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  media: z.array(MediaSchema).optional().default([]),
});

export const SectionSchema = z.object({
  section_id: z.union([z.string(), z.number()]).optional(),
  section_key: z.string(),
  icon: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  steps: z.array(StepSchema).optional().default([]),
  common_media: z.array(MediaSchema).optional().default([]),
});

export const AppFeatureGuideSchema = z.object({
  sections: z.array(SectionSchema),
});

export type AppFeatureGuideFormValues = z.infer<typeof AppFeatureGuideSchema>;
export type SectionFormValues = z.infer<typeof SectionSchema>;
export type StepFormValues = z.infer<typeof StepSchema>;
export type MediaFormValues = z.infer<typeof MediaSchema>;
