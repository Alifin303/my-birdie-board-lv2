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
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

<!-- Main pages -->
<url>
  <loc>https://mybirdieboard.com/</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>1.0</priority>
  <changefreq>weekly</changefreq>
  <xhtml:link rel="alternate" hreflang="en" href="https://mybirdieboard.com/"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://mybirdieboard.com/"/>
  <image:image>
    <image:loc>https://mybirdieboard.com/og-image.png</image:loc>
    <image:title>MyBirdieBoard Golf Score Tracking App</image:title>
  </image:image>
</url>

<url>
  <loc>https://mybirdieboard.com/about</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/faq</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/courses</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>daily</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/dashboard</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/privacy</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.5</priority>
  <changefreq>yearly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/demo</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.7</priority>
  <changefreq>monthly</changefreq>
</url>

<!-- High-volume keyword landing pages -->
<url>
  <loc>https://mybirdieboard.com/golf-equipment</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/golf-tips</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/golf-lessons</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>

<!-- Blog section -->
<url>
  <loc>https://mybirdieboard.com/blog</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/blog/golf-score-tracking-tips</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/blog/best-golf-clubs-for-beginners</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/blog/improve-your-golf-swing</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/blog/course-management-tips</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/blog/understanding-golf-handicap-system</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/blog/stableford-scoring</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<!-- SEO-focused guide pages -->
<url>
  <loc>https://mybirdieboard.com/guides/how-to-track-golf-scores</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/guides/golf-handicap-calculator</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/guides/best-golf-score-tracking-apps</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.9</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/guides/golf-performance-analytics</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

<url>
  <loc>https://mybirdieboard.com/guides/golf-statistics-tracker</loc>
  <lastmod>${currentDate}</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>

</urlset>`;

    return new Response(sitemap, { 
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
