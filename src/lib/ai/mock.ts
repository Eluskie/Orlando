import { AI_CONFIG } from "./config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomDelay(): Promise<void> {
  const { minDelayMs, maxDelayMs } = AI_CONFIG.mock;
  const delay = Math.floor(
    Math.random() * (maxDelayMs - minDelayMs) + minDelayMs,
  );
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function randomId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Mock placeholder images
// ---------------------------------------------------------------------------

const PLACEHOLDER_COLORS = [
  "6366f1", // indigo
  "8b5cf6", // violet
  "ec4899", // pink
  "f97316", // orange
  "10b981", // emerald
];

function getPlaceholderImageUrl(
  width: number,
  height: number,
  label: string,
): string {
  const color =
    PLACEHOLDER_COLORS[Math.floor(Math.random() * PLACEHOLDER_COLORS.length)];
  // Use a simple SVG data URL as placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#${color}"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white"
      text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ---------------------------------------------------------------------------
// Mock AI functions
// ---------------------------------------------------------------------------

/**
 * Simulates an image generation call.
 * Returns placeholder image URLs after a realistic delay.
 */
export async function mockGenerate(prompt: string): Promise<{
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  model: string;
  seed: number;
}> {
  await randomDelay();

  const width = AI_CONFIG.generation.defaultWidth;
  const height = AI_CONFIG.generation.defaultHeight;
  const label = prompt.slice(0, 30) || "Generated";

  return {
    id: randomId(),
    imageUrl: getPlaceholderImageUrl(width, height, label),
    thumbnailUrl: getPlaceholderImageUrl(256, 256, label),
    prompt,
    model: "mock-v1",
    seed: Math.floor(Math.random() * 999999),
  };
}

/**
 * Simulates a chat response.
 * Returns a canned assistant message after a realistic delay.
 */
export async function mockChat(message: string): Promise<{
  id: string;
  role: "assistant";
  content: string;
}> {
  await randomDelay();

  const responses = [
    `I understand you'd like to work on "${message.slice(0, 50)}". Let me help you with that. I can suggest some style adjustments based on your brand guidelines.`,
    `Great idea! Based on your brand's visual identity, I'd recommend using your primary color palette with clean lines. Shall I generate some options?`,
    `I've analyzed your request. For brand consistency, I suggest we maintain the established typography and color scheme while exploring new composition approaches.`,
    `Looking at your brand guidelines, here's what I'd suggest: keep the core visual elements but experiment with the layout. Want me to generate a few variations?`,
  ];

  return {
    id: randomId(),
    role: "assistant",
    content: responses[Math.floor(Math.random() * responses.length)],
  };
}

/**
 * Returns a sample style extraction result for mock mode.
 * Simulates what the real AI would extract from a reference image.
 */
export async function getMockStyleExtraction(): Promise<{
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
  tone: string;
  keywords: string[];
}> {
  await randomDelay();

  return {
    primaryColor: "#6366f1",
    secondaryColor: "#1e1b4b",
    accentColor: "#f97316",
    fontFamily: "Inter",
    headingFont: "Inter",
    tone: "professional, modern, clean",
    keywords: ["minimalist", "geometric", "tech-forward", "accessible"],
  };
}
