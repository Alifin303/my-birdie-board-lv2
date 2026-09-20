import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UA = "MyBirdieBoard/1.0 (https://mybirdieboard.com)";

async function reverse(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=5&addressdetails=1&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en", Accept: "application/json" },
  });
  if (!res.ok) {
    console.log("nominatim reverse failed", res.status, lat, lon);
    return null;
  }
  const data = await res.json();
  const address = data?.address ?? {};
  const country: string | undefined = address.country;
  const code: string | undefined = address.country_code;
  if (!country || !code) return null;
  return { country, country_code: code.toUpperCase() };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 40);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: rows, error } = await supabase
      .from("courses")
      .select("id, latitude, longitude")
      .is("country_code", null)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("id")
      .limit(limit);

    if (error) throw error;

    let updated = 0;
    const failed: number[] = [];

    for (const row of rows ?? []) {
      const hit = await reverse(Number(row.latitude), Number(row.longitude));
      if (hit) {
        const { error: upErr } = await supabase
          .from("courses")
          .update({ country: hit.country, country_code: hit.country_code })
          .eq("id", row.id);
        if (upErr) {
          console.log("update failed", row.id, upErr.message);
          failed.push(row.id);
        } else {
          updated++;
        }
      } else {
        failed.push(row.id);
      }
      await new Promise((r) => setTimeout(r, 1100));
    }

    const { count: remaining } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .is("country_code", null)
      .not("latitude", "is", null);

    return new Response(JSON.stringify({ processed: rows?.length ?? 0, updated, failed, remaining }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("course-countries error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
