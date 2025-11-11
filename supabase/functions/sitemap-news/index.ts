import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const currentDate = new Date().toISOString();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  
  <!-- Blog Posts for News Sitemap -->
  <url>
    <loc>https://mybirdieboard.com/blog/golf-score-tracking-tips</loc>
    <news:news>
      <news:publication>
        <news:name>MyBirdieBoard Golf Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${currentDate}</news:publication_date>
      <news:title>How to Track Golf Scores Effectively - Expert Tips for Better Performance</news:title>
      <news:keywords>golf score tracking, golf performance, golf tips, golf analytics</news:keywords>
    </news:news>
  </url>

</urlset>`;

    return new Response(sitemap, { 
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate news sitemap' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
