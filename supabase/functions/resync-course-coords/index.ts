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
      .or("coords_source.is.null,coords_source.neq.api")
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

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Fetch with retry/backoff on rate limiting (429).
    const apiFetch = async (url: string) => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await fetch(url, {
          headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
          signal: AbortSignal.timeout(15000),
        });
        if (res.status !== 429) return res;
        await sleep(1500 * (attempt + 1));
      }
      return null;
    };

    // Strip the trailing " - Course" part and any "(12345)" club ids from stored names.
    const searchName = (name: string) =>
      (name.split(" - ")[0] || name).replace(/\(\d+\)/g, "").trim();

    for (const course of courses ?? []) {
      try {
        let loc: Record<string, unknown> = {};
        let newApiId: string | null = null;

        const res = await apiFetch(`${API_BASE_URL}/courses/${course.api_course_id}`);
        if (res && res.ok) {
          const json = await res.json();
          loc = (json?.course ?? json)?.location ?? {};
        } else {
          // Stale or unknown id — look the course up by name; search now returns coords too.
          const sres = await apiFetch(
            `${API_BASE_URL}/search?search_query=${encodeURIComponent(searchName(course.name))}`
          );
          if (!sres || !sres.ok) {
            failed++;
            details.push({ id: course.id, name: course.name, status: res?.status ?? sres?.status ?? "no-response" });
            await sleep(400);
            continue;
          }
          const sjson = await sres.json();
          const hit = Array.isArray(sjson?.courses) ? sjson.courses[0] : null;
          if (!hit) {
            failed++;
            details.push({ id: course.id, name: course.name, status: "not-found" });
            await sleep(400);
            continue;
          }
          loc = hit.location ?? {};
          newApiId = hit.id ? String(hit.id) : null;
        }

        const lat = typeof loc.latitude === "number" ? loc.latitude : null;
        const lng = typeof loc.longitude === "number" ? loc.longitude : null;
        if (lat === null || lng === null) {
          noCoords++;
          details.push({ id: course.id, name: course.name, status: "no-coords" });
          await sleep(400);
          continue;
        }
        const update: Record<string, unknown> = {
          latitude: lat,
          longitude: lng,
          coords_source: "api",
        };
        if (newApiId) update.api_course_id = newApiId;
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
