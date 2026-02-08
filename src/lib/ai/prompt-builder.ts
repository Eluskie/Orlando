import type { ExtractedStyleData } from "@/types/brand";

/**
 * Builds a styled prompt by combining the user's prompt with extracted brand style.
 * The style descriptors are appended AFTER the user prompt to make them harder to override.
 *
 * @param userPrompt - The raw prompt from the user
 * @param style - The extracted brand style data (optional)
 * @returns The enhanced prompt with style descriptors, or the original prompt if no style
 */
export function buildStyledPrompt(
  userPrompt: string,
  style: ExtractedStyleData | undefined
): string {
  // If no style data, return the prompt unchanged
  if (!style) {
    return userPrompt;
  }

  // Extract key style descriptors
  const styleKeywords = style.mood.keywords.join(", ");
  const colorDescription = `${style.mood.tone} tones with primary ${style.colors.primary}`;
  const visualDescription = `${style.visualStyle.complexity} design, ${style.visualStyle.contrast} contrast`;
  const moodDescription = style.mood.primary;

  // Construct enhanced prompt with style appended
  // Format: "{userPrompt}. Style: {keywords}. Color palette: {colors}. {visual}. {mood} mood."
  return `${userPrompt}. Style: ${styleKeywords}. Color palette: ${colorDescription}. ${visualDescription}. ${moodDescription} mood.`;
}
