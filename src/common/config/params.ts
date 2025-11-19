export const params = {
  name: "SEC Agent",
  tagline: "SEC Filing Analysis",
  displayName: "DropAnalysis",
  description:
    "AI-powered SEC filing analysis tool. Analyze 10-K, 10-Q, and other SEC filings with intelligent insights and comprehensive data extraction.",
  socialImage: "/icons/og-image.png",
  favicon: "/icons/android-chrome-192x192.png", // Larger favicon for better visibility
  twitterHandle: "@DropAnalysis", // Your Twitter/X handle (without @ if you prefer)
} as const;

export const screenBreakpoints = {
  DESKTOP: 1080,
} as const;

export const cookieNames = {
  SIDEBAR_STATE: "sidebar:state",
} as const;

export const APP_CONFIG = {
  ...params,
  breakpoints: screenBreakpoints,
  cookies: cookieNames,
} as const;
