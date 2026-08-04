import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE_URL = "https://api.golfcourseapi.com/v1";
const UA = "MyBirdieBoard/1.0 (https://mybirdieboard.com)";

async function geocode(query: string) {
  if (!query || query.trim().length < 3) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en", Accept: "application/json" },
  });
  if (!res.ok) {
    console.log("nominatim failed", res.status, query);
    return null;
  }
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  if (isNaN(lat) || isNaN(lon)) return null;
  return { latitude: lat, longitude: lon };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const courseId: number | undefined = body.courseId;
    const apiCourseId: string | undefined = body.apiCourseId;
    let name: string | undefined = body.name;
    let city: string | undefined = body.city;
    let state: string | undefined = body.state;
    let country: string | undefined;
    let address: string | undefined;

    if (!courseId) {
      return new Response(JSON.stringify({ error: "courseId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load DB row for fallbacks
    const { data: row } = await supabase
      .from("courses")
      .select("id, name, city, state, api_course_id")
      .eq("id", courseId)
      .maybeSingle();

    name = name || row?.name || undefined;
    city = city || row?.city || undefined;
    state = state || row?.state || undefined;
    const effectiveApiId = apiCourseId || row?.api_course_id || undefined;

    // Try the Golf Course API for richer location data
    if (effectiveApiId) {
      const apiKey = Deno.env.get("GOLF_COURSE_API_KEY");
      if (apiKey) {
        try {
          const res = await fetch(`${API_BASE_URL}/courses/${effectiveApiId}`, {
            headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
          });
          if (res.ok) {
            const json = await res.json();
            const course = json?.course ?? json;
            const loc = course?.location ?? {};
            if (typeof loc.latitude === "number" && typeof loc.longitude === "number") {
              await supabase
                .from("courses")
                .update({ latitude: loc.latitude, longitude: loc.longitude })
                .eq("id", courseId);
              return new Response(
                JSON.stringify({ latitude: loc.latitude, longitude: loc.longitude, source: "api" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            address = loc.address && loc.address !== "Unknown" ? loc.address : undefined;
            city = (loc.city && loc.city !== "Unknown" ? loc.city : undefined) || city;
            state = (loc.state && loc.state !== "Unknown" ? loc.state : undefined) || state;
            country = loc.country && loc.country !== "Unknown" ? loc.country : undefined;
            const clubName = [course?.club_name, course?.course_name]
              .filter(Boolean)
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
              .join(" ");
            if (clubName) name = clubName;
          } else {
            console.log("golf api failed", res.status);
          }
        } catch (e) {
          console.log("golf api error", String(e));
        }
      }
    }

    const cleanName = (name || "").replace(/\s+-\s+/g, " ").trim();
    const place = [city, state, country].filter(Boolean).join(", ");
    const candidates = [
      address ? [address, place].filter(Boolean).join(", ") : undefined,
      [cleanName, place].filter(Boolean).join(", "),
      cleanName,
      place,
    ].filter((q): q is string => !!q && q.trim().length > 2);

    for (const q of candidates) {
      const hit = await geocode(q);
      if (hit) {
        const { error } = await supabase
          .from("courses")
          .update({ latitude: hit.latitude, longitude: hit.longitude })
          .eq("id", courseId);
        if (error) console.log("update failed", error.message);
        return new Response(
          JSON.stringify({ ...hit, source: "geocode", query: q }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await new Promise((r) => setTimeout(r, 1100));
    }

    return new Response(JSON.stringify({ error: "No location found", candidates }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("course-coords error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
