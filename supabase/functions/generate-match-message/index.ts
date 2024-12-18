import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchType, score, itemDetails, preferences } = await req.json();
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) throw new Error('OpenAI API key not configured');

    console.log('🤖 Generating match message for:', { matchType, score });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a friendly AI food recommender. Generate a short, engaging message (max 4 words) about how well a menu item matches a user's preferences. 
            Be creative and fun, but clear about the match quality. Include an appropriate emoji.
            
            Examples:
            - "Perfect for you! 🎯"
            - "Great protein match! 💪"
            - "Matches your style! ✨"
            - "Careful: contains dairy 🥛"`
          },
          {
            role: 'user',
            content: `Generate a match message for a menu item with:
            Match type: ${matchType}
            Score: ${score}
            Item details: ${JSON.stringify(itemDetails)}
            User preferences: ${JSON.stringify(preferences)}
            
            The message should reflect the match quality and any relevant dietary considerations.`
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate message');
    }

    const data = await response.json();
    const message = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating match message:', error);
    return new Response(
      JSON.stringify({ 
        message: matchType === 'warning' ? 'Check ingredients ⚠️' : 'Possible match 🤔'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});