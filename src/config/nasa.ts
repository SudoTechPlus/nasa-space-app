// config/nasa.ts
export const NASA_CONFIG = {
  baseUrl: 'https://api.nasa.gov',
  eonetBaseUrl: 'https://eonet.gsfc.nasa.gov/api/v2.1',
  apiKey: process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY',
  rateLimit: {
    maxRequests: 1000,
    perHours: 1,
  },
} as const;

export const EONET_CATEGORIES = {
  WILDFIRES: 8,
  VOLCANOES: 12,
  DUST_HAZE: 16,
  WATER_COLOR: 17,
} as const;