import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE_URL = "https://api.golfcourseapi.com/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GOLF_COURSE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit: number = Math.min(Number(body.limit) || 200, 500);
    const onlyMissing: boolean = body.onlyMissing === true;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase
      .from("courses")
      .select("id, name, api_course_id, latitude, longitude, coords_source")
      .not("api_course_id", "is", null)
      .neq("coords_source", "api")
      .limit(limit);

    if (onlyMissing) query = supabase
      .from("courses")
      .select("id, name, api_course_id, latitude, longitude, coords_source")
      .not("api_course_id", "is", null)
      .is("latitude", null)
      .limit(limit);

    const { data: courses, error } = await query;
    if (error) throw error;

    let updated = 0;
    let noCoords = 0;
    let failed = 0;
    const details: Array<Record<string, unknown>> = [];

    for (const course of courses ?? []) {
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${course.api_course_id}`, {
          headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
          failed++;
          details.push({ id: course.id, name: course.name, status: res.status });
          continue;
        }
        const json = await res.json();
        const c = json?.course ?? json;
        const loc = c?.location ?? {};
        const lat = typeof loc.latitude === "number" ? loc.latitude : null;
        const lng = typeof loc.longitude === "number" ? loc.longitude : null;
        if (lat === null || lng === null) {
          noCoords++;
          continue;
        }
        const update: Record<string, unknown> = {
          latitude: lat,
          longitude: lng,
          coords_source: "api",
        };
        if (loc.country && loc.country !== "Unknown") update.country = loc.country;
        if (loc.city && loc.city !== "Unknown") update.city = loc.city;
        if (loc.state && loc.state !== "Unknown") update.state = loc.state;

        const { error: updErr } = await supabase.from("courses").update(update).eq("id", course.id);
        if (updErr) {
          failed++;
          details.push({ id: course.id, error: updErr.message });
        } else {
          updated++;
        }
      } catch (e) {
        failed++;
        details.push({ id: course.id, error: String(e) });
      }
    }

    return new Response(
      JSON.stringify({ checked: courses?.length ?? 0, updated, noCoords, failed, details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("resync-course-coords error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
