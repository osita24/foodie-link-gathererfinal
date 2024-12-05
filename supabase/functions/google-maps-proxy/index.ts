import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function expandUrl(shortUrl: string): Promise<string> {
  console.log('Expanding URL:', shortUrl)
  try {
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
    })
    console.log('Expanded URL:', response.url)
    return response.url
  } catch (error) {
    console.error('Error expanding URL:', error)
    throw new Error('Failed to expand shortened URL')
  }
}

function extractAddressFromUrl(url: string): string | null {
  console.log('Extracting address from URL:', url)
  try {
    const urlObj = new URL(url)
    const address = urlObj.searchParams.get('q')
    console.log('Extracted address:', address)
    return address
  } catch (error) {
    console.error('Error extracting address:', error)
    return null
  }
}

async function findPlaceByAddress(address: string): Promise<any> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Places API key not configured')
  }

  console.log('Searching for place with address:', address)
  
  // First, use Places API to find the place
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
  searchUrl.searchParams.set('input', address)
  searchUrl.searchParams.set('inputtype', 'textquery')
  searchUrl.searchParams.set('fields', 'place_id,name,formatted_address')
  searchUrl.searchParams.set('key', GOOGLE_API_KEY)

  const response = await fetch(searchUrl.toString())
  const data = await response.json()
  console.log('Place search response:', data)

  if (data.status !== 'OK' || !data.candidates?.length) {
    throw new Error('No places found for this address')
  }

  // Get detailed place information
  const placeId = data.candidates[0].place_id
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  detailsUrl.searchParams.set('place_id', placeId)
  detailsUrl.searchParams.set('fields', 'place_id,name,rating,formatted_address,formatted_phone_number,opening_hours,website,price_level,reviews,photos,types,user_ratings_total')
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY)

  const detailsResponse = await fetch(detailsUrl.toString())
  const detailsData = await detailsResponse.json()
  console.log('Place details response status:', detailsData.status)

  if (detailsData.status !== 'OK') {
    throw new Error('Failed to fetch place details')
  }

  return detailsData.result
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('Processing URL:', url)

    // Expand the URL if it's shortened
    const expandedUrl = url.includes('goo.gl') ? await expandUrl(url) : url
    console.log('Working with URL:', expandedUrl)

    // Extract address from the URL
    const address = extractAddressFromUrl(expandedUrl)
    if (!address) {
      throw new Error('Could not extract address from URL')
    }

    // Find the place using the address
    const placeDetails = await findPlaceByAddress(address)
    console.log('Successfully found place:', placeDetails.name)

    return new Response(
      JSON.stringify(placeDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})