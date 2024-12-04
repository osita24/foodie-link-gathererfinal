/**
 * Extracts place ID from various Google Maps URL formats
 */
export const extractPlaceId = async (url: string): Promise<string | null> => {
  console.log('Attempting to extract Place ID from URL:', url);

  try {
    // Handle shortened g.co links
    if (url.includes('g.co/kgs/')) {
      console.log('Detected shortened g.co URL, attempting to handle...');
      
      // Extract the identifier from g.co/kgs/XXXXX format
      const identifier = url.split('g.co/kgs/')[1];
      if (!identifier) {
        console.error('Could not extract identifier from shortened URL');
        return null;
      }

      // Construct the likely place ID format
      // Note: This is a temporary solution until we implement server-side URL resolution
      console.log('Extracted identifier:', identifier);
      return identifier;
    }

    // Handle regular Google Maps URLs
    const urlObj = new URL(url);
    
    // Format: ?query=place_id:ChIJ...
    const searchParams = new URLSearchParams(urlObj.search);
    if (searchParams.has('query')) {
      const query = searchParams.get('query');
      if (query?.startsWith('place_id:')) {
        const placeId = query.split('place_id:')[1];
        console.log('Extracted Place ID from query:', placeId);
        return placeId;
      }
    }

    // Format: ?place_id=ChIJ...
    if (searchParams.has('place_id')) {
      const placeId = searchParams.get('place_id');
      console.log('Extracted Place ID from URL:', placeId);
      return placeId;
    }

    // Format: maps/place/.../@...,17z/data=!3m1!4b1!4m5!3m4!1s0x...
    const matches = url.match(/!1s([^!]+)!/);
    if (matches && matches[1]) {
      console.log('Extracted Place ID from URL data:', matches[1]);
      return matches[1];
    }

    // Format: maps/place/.../data=!4m[numbers]!1s[placeId]!
    const altMatches = url.match(/!1s([^!]+)(?:!|$)/);
    if (altMatches && altMatches[1]) {
      console.log('Extracted Place ID from alternative URL format:', altMatches[1]);
      return altMatches[1];
    }

    console.log('No Place ID found in URL');
    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    return null;
  }
};