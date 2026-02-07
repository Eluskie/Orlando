// ---------------------------------------------------------------------------
// AI Configuration
// ---------------------------------------------------------------------------

export const AI_CONFIG = {
  /** Whether to use mock responses instead of real API calls */
  mockMode: process.env.MOCK_AI_MODE === "true",

  /** Rate limits for generation endpoint */
  rateLimit: {
    /** Max requests per window */
    maxRequests: 10,
    /** Window duration in milliseconds (1 minute) */
    windowMs: 60_000,
  },

  /** Generation settings */
  generation: {
    /** Max prompt length in characters */
    maxPromptLength: 2000,
    /** Default image width */
    defaultWidth: 1024,
    /** Default image height */
    defaultHeight: 1024,
    /** Daily generation limit per user */
    dailyLimit: 50,
  },

  /** Mock mode settings */
  mock: {
    /** Simulated delay range in milliseconds */
    minDelayMs: 500,
    maxDelayMs: 1500,
  },
} as const;

/**
 * Check if the application is running in mock AI mode.
 * Mock mode returns fake responses without making real API calls.
 */
export function isMockMode(): boolean {
  return AI_CONFIG.mockMode;
}
