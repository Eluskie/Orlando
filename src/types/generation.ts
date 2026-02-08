export type GenerationStatus = "pending" | "processing" | "completed" | "failed";
export type AssetType = "logo" | "banner" | "social" | "illustration" | "custom";

export interface GenerationMetadata {
  model?: string;
  seed?: number;
  negativePrompt?: string;
  aspectRatio?: string;
  styleStrength?: number;
  styledPrompt?: string;
  count?: number;
  sourceImage?: string;
}
