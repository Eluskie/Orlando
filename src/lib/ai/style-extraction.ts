import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Zod schema for style extraction - matches RESEARCH.md specification
export const StyleExtractionSchema = z.object({
  colors: z.object({
    primary: z.string().describe('Main dominant color as hex code (#RRGGBB)'),
    secondary: z.string().describe('Secondary color as hex code'),
    accent: z.string().describe('Accent/highlight color as hex code'),
    neutral: z.string().describe('Background/neutral color as hex code'),
  }),
  typography: z.object({
    style: z.enum(['serif', 'sans-serif', 'display', 'handwritten', 'monospace'])
      .describe('Overall typography style that would match this visual'),
    weight: z.enum(['light', 'regular', 'medium', 'bold', 'heavy'])
      .describe('Dominant font weight impression'),
    mood: z.string().describe('Typography mood: modern, classic, playful, elegant, etc.'),
  }),
  mood: z.object({
    primary: z.string().describe('Primary mood/feeling: energetic, calm, luxurious, minimal, etc.'),
    keywords: z.array(z.string()).min(3).max(5).describe('3-5 descriptive style keywords'),
    tone: z.enum(['warm', 'cool', 'neutral']).describe('Overall color temperature'),
  }),
  visualStyle: z.object({
    complexity: z.enum(['minimal', 'moderate', 'detailed', 'ornate']),
    contrast: z.enum(['low', 'medium', 'high']),
    texture: z.string().describe('Texture quality: smooth, grainy, organic, geometric, etc.'),
  }),
  confidence: z.number().min(0).max(1).describe('Extraction confidence 0-1'),
});

export type ExtractedStyle = z.infer<typeof StyleExtractionSchema>;

const EXTRACTION_PROMPT = `Analyze this reference image(s) and extract the visual style characteristics.

Return a JSON object with:
1. colors: Extract dominant colors as precise hex codes (#RRGGBB format)
   - primary: The main brand/dominant color
   - secondary: A supporting color
   - accent: A highlight or call-to-action color
   - neutral: Background or text-suitable color

2. typography: Infer the typography style that would complement this visual
   - style: serif, sans-serif, display, handwritten, or monospace
   - weight: light, regular, medium, bold, or heavy
   - mood: A word describing the typography feel

3. mood: The emotional and stylistic impression
   - primary: Main mood descriptor
   - keywords: 3-5 words capturing the brand essence
   - tone: warm, cool, or neutral

4. visualStyle: Technical visual characteristics
   - complexity: minimal, moderate, detailed, or ornate
   - contrast: low, medium, or high
   - texture: A word describing the texture quality

5. confidence: Your confidence in this extraction (0-1)

Be specific and precise. When analyzing multiple images, find common threads.`;

/**
 * Extract style from one or more reference images
 * Uses Gemini 2.5 Flash for vision analysis with structured output
 */
export async function extractStyleFromImages(
  imageUrls: string[]
): Promise<ExtractedStyle> {
  // Build content array with all images
  const imageContent = imageUrls.map(url => ({
    type: 'image' as const,
    image: url,
  }));

  const { output } = await generateText({
    model: google('gemini-2.5-flash-preview-04-17'),
    output: Output.object({ schema: StyleExtractionSchema }),
    messages: [
      {
        role: 'user',
        content: [
          ...imageContent,
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  if (!output) {
    throw new Error('Style extraction failed - no output returned');
  }

  return output;
}

/**
 * Mock style extraction for development
 */
export function mockExtractStyle(): ExtractedStyle {
  const palettes = [
    { primary: '#2563EB', secondary: '#1E40AF', accent: '#F59E0B', neutral: '#F3F4F6' },
    { primary: '#059669', secondary: '#047857', accent: '#EC4899', neutral: '#ECFDF5' },
    { primary: '#7C3AED', secondary: '#5B21B6', accent: '#10B981', neutral: '#F5F3FF' },
  ];
  const moods = ['modern', 'playful', 'elegant', 'bold', 'minimal'];
  const keywords = [
    ['clean', 'professional', 'trustworthy', 'innovative'],
    ['vibrant', 'energetic', 'youthful', 'dynamic'],
    ['luxurious', 'sophisticated', 'premium', 'refined'],
  ];

  const idx = Math.floor(Math.random() * 3);

  return {
    colors: palettes[idx],
    typography: {
      style: 'sans-serif',
      weight: 'medium',
      mood: moods[Math.floor(Math.random() * moods.length)],
    },
    mood: {
      primary: moods[Math.floor(Math.random() * moods.length)],
      keywords: keywords[idx],
      tone: ['warm', 'cool', 'neutral'][Math.floor(Math.random() * 3)] as 'warm' | 'cool' | 'neutral',
    },
    visualStyle: {
      complexity: 'moderate',
      contrast: 'medium',
      texture: 'smooth',
    },
    confidence: 0.85 + Math.random() * 0.1,
  };
}
