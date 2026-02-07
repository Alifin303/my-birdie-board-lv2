import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const API_BASE_URL = "https://api.golfcourseapi.com/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('GOLF_COURSE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    const apiHeaders = {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    let apiUrl: string;
    
    if (action === 'search') {
      const query = url.searchParams.get('q') || '';
      apiUrl = `${API_BASE_URL}/search?search_query=${encodeURIComponent(query)}`;
    } else if (action === 'course') {
      const courseId = url.searchParams.get('id');
      if (!courseId) {
        return new Response(JSON.stringify({ error: 'Course ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      apiUrl = `${API_BASE_URL}/courses/${courseId}`;
    } else if (action === 'health') {
      apiUrl = `${API_BASE_URL}/healthcheck`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use: search, course, health' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Proxying request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: apiHeaders,
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Golf Course API proxy error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
