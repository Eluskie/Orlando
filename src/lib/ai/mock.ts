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
 * Detects brand creation intent and includes [CREATE_BRAND:name] marker.
 */
export async function mockChat(message: string): Promise<{
  id: string;
  role: "assistant";
  content: string;
}> {
  await randomDelay();

  const lowerMessage = message.toLowerCase();

  // Detect brand creation intent and extract brand name
  let brandName = "";

  // Pattern 1: "called/named X" - explicit name
  const calledMatch = message.match(/(?:called|named)\s+["']?([A-Za-z][A-Za-z0-9\s]{1,30})["']?/i);
  if (calledMatch) {
    brandName = calledMatch[1].trim();
  }

  // Pattern 2: "brand for X" - the subject/industry is the brand
  if (!brandName) {
    const forMatch = message.match(/brand\s+for\s+["']?([A-Za-z][A-Za-z0-9\s]{1,30})["']?/i);
    if (forMatch) {
      // Capitalize first letter of each word
      brandName = forMatch[1].trim().split(/\s+/).map(w =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join("");
    }
  }

  // Pattern 3: Quoted name anywhere - "MyBrand" or 'MyBrand'
  if (!brandName) {
    const quotedMatch = message.match(/["']([A-Za-z][A-Za-z0-9\s]{1,30})["']/);
    if (quotedMatch) {
      brandName = quotedMatch[1].trim();
    }
  }

  // Clean up brand name - keep only alphanumeric, capitalize
  if (brandName) {
    brandName = brandName.replace(/[^A-Za-z0-9\s]/g, "").trim();
    // Remove common words if they're the only thing captured
    const stopWords = ["for", "the", "a", "an", "my", "our", "new"];
    if (stopWords.includes(brandName.toLowerCase())) {
      brandName = "";
    }
  }

  // If we have a brand creation intent but no valid name
  const hasBrandIntent = lowerMessage.includes("brand") || lowerMessage.includes("create");

  if (hasBrandIntent) {
    if (!brandName || brandName.length < 2) {
      // Ask for a name instead of defaulting
      return {
        id: randomId(),
        role: "assistant",
        content: `I'd love to help you create a brand! What would you like to name it? You can say something like "Create a brand called MyBrandName" or just tell me the name.`,
      };
    }

    return {
      id: randomId(),
      role: "assistant",
      content: `Great! I'll help you create a brand called "${brandName}". This will set up a new workspace where we can define your brand's visual identity, colors, typography, and generate on-brand content.\n\n[CREATE_BRAND:${brandName}]`,
    };
  }

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

/**
 * Mock function to generate multiple image variations.
 * Returns base64-encoded SVG placeholders with different colors.
 * Used in mock mode to simulate multi-image generation without real API calls.
 *
 * @param prompt - The generation prompt (shown in placeholder)
 * @param count - Number of variations to generate (1-4)
 * @returns Promise resolving to array of base64-encoded images
 */
export async function mockGenerateImages(
  prompt: string,
  count: number
): Promise<{ images: { base64: string }[] }> {
  // Simulate realistic generation delay (2-5 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  // Generate count variations with different colors
  const images = Array.from({ length: count }, (_, i) => {
    const color = PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length];
    const truncatedPrompt = prompt.slice(0, 40);

    // Create a 512x512 SVG placeholder
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="100%" height="100%" fill="#${color}"/>
    <text x="50%" y="45%" font-family="sans-serif" font-size="24" fill="white"
      text-anchor="middle" dominant-baseline="middle">Generated #${i + 1}</text>
    <text x="50%" y="55%" font-family="sans-serif" font-size="14" fill="white"
      text-anchor="middle" dominant-baseline="middle">${truncatedPrompt}...</text>
  </svg>`;

    // Convert to base64
    const base64 = Buffer.from(svg).toString("base64");

    return { base64 };
  });

  return { images };
}
