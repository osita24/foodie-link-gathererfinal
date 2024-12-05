/**
 * Utility functions for parsing and handling Google Maps URLs
 */

// Common URL patterns for Google Maps
const URL_PATTERNS = {
  SHORTENED: /^https?:\/\/(goo\.gl\/maps|maps\.app\.goo\.gl|g\.co\/kgs)\/.+/i,
  PLACE_ID: /!1s(ChIJ[^!]+)/,
  PLACE_ID_PARAM: /place_id=([^&]+)/,
  FTID: /ftid=([^&]+)/,
  COORDINATES: /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  HEX_ID: /!1s(0x[a-fA-F0-9]+:[a-fA-F0-9]+)/,
};

interface ParsedMapUrl {
  type: 'place_id' | 'coordinates' | 'shortened' | 'unknown';
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  originalUrl: string;
}

/**
 * Resolves a shortened URL to its full form
 */
const resolveShortUrl = async (url: string): Promise<string> => {
  console.log('Resolving shortened URL:', url);
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    console.log('Resolved URL:', response.url);
    return response.url;
  } catch (error) {
    console.error('Error resolving shortened URL:', error);
    throw new Error('Failed to resolve shortened URL');
  }
};

/**
 * Extracts coordinates from a Google Maps URL
 */
const extractCoordinates = (url: string) => {
  const matches = url.match(URL_PATTERNS.COORDINATES);
  if (matches && matches[1] && matches[2]) {
    return {
      lat: parseFloat(matches[1]),
      lng: parseFloat(matches[2]),
    };
  }
  return null;
};

/**
 * Extracts place ID from various URL formats
 */
const extractPlaceId = (url: string): string | null => {
  // Check for place_id parameter
  const placeIdMatch = url.match(URL_PATTERNS.PLACE_ID_PARAM);
  if (placeIdMatch?.[1]) {
    return placeIdMatch[1];
  }

  // Check for ChIJ format in URL
  const chijMatch = url.match(URL_PATTERNS.PLACE_ID);
  if (chijMatch?.[1]) {
    return chijMatch[1];
  }

  // Check for hex format
  const hexMatch = url.match(URL_PATTERNS.HEX_ID);
  if (hexMatch?.[1]) {
    return hexMatch[1];
  }

  // Check for ftid parameter
  const ftidMatch = url.match(URL_PATTERNS.FTID);
  if (ftidMatch?.[1]) {
    return ftidMatch[1];
  }

  return null;
};

/**
 * Main function to parse any Google Maps URL
 */
export const parseGoogleMapsUrl = async (url: string): Promise<ParsedMapUrl> => {
  console.log('Parsing Google Maps URL:', url);
  let finalUrl = url;

  try {
    // Handle shortened URLs
    if (URL_PATTERNS.SHORTENED.test(url)) {
      console.log('Detected shortened URL, resolving...');
      finalUrl = await resolveShortUrl(url);
    }

    // Try to extract place ID first
    const placeId = extractPlaceId(finalUrl);
    if (placeId) {
      console.log('Found place ID:', placeId);
      return {
        type: 'place_id',
        placeId,
        originalUrl: url,
      };
    }

    // Try to extract coordinates
    const coordinates = extractCoordinates(finalUrl);
    if (coordinates) {
      console.log('Found coordinates:', coordinates);
      return {
        type: 'coordinates',
        coordinates,
        originalUrl: url,
      };
    }

    // If it's still a shortened URL but we couldn't extract information
    if (URL_PATTERNS.SHORTENED.test(url)) {
      return {
        type: 'shortened',
        originalUrl: url,
      };
    }

    console.log('Could not parse URL format');
    return {
      type: 'unknown',
      originalUrl: url,
    };
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    throw error;
  }
};