import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const API = "https://api.golfcourseapi.com/v1";
const DAILY_CAP = 9000; // stay safely under the 10,000/day allowance
const MAX_REQUESTS_PER_CALL = 60;
const TIME_BUDGET_MS = 45_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const COLORS = ["black", "blue", "white", "yellow", "red", "green", "gold", "silver", "orange", "purple"];
const teeColor = (name: string, gender: string) => {
  const hit = COLORS.find((c) => name.toLowerCase().includes(c));
  if (hit) return hit[0].toUpperCase() + hit.slice(1);
  return gender === "female" ? "Red" : "Blue";
};

type ApiHole = { par?: number; yardage?: number; handicap?: number };
type ApiTee = {
  tee_name?: string; course_rating?: number; slope_rating?: number;
  total_yards?: number; number_of_holes?: number; par_total?: number; holes?: ApiHole[];
};

const completeTee = (t: ApiTee) => {
  const holes = t.holes ?? [];
  if (holes.length !== 9 && holes.length !== 18) return false;
  return holes.every((h) => Number.isInteger(h.par) && h.par! >= 3 && h.par! <= 6);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return json({ error: "Not signed in" }, 401);

  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: isAdmin } = await db.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Admins only" }, 403);

  const body = await req.json().catch(() => ({}));
  const action = ["run", "resume", "add_terms"].includes(body.action) ? body.action : "status";

  if (action === "add_terms") {
    const raw: unknown[] = Array.isArray(body.terms) ? body.terms : [];
    const cleaned = [...new Set(raw
      .map((t) => String(t ?? "").trim().replace(/\s+/g, " "))
      .filter((t) => t.length >= 2 && t.length <= 80))].slice(0, 2000);
    if (!cleaned.length) return json({ error: "No valid places given" }, 400);
    const { data: existing } = await db.from("course_import_terms").select("term");
    const known = new Set((existing ?? []).map((r) => r.term.toLowerCase()));
    const fresh = cleaned.filter((t) => !known.has(t.toLowerCase()));
    const { data: maxRow } = await db.from("course_import_terms")
      .select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    let order = (maxRow?.sort_order ?? 0) + 1;
    if (fresh.length) {
      const { error } = await db.from("course_import_terms").insert(
        fresh.map((term) => ({ term, region: "custom", sort_order: order++ })),
      );
      if (error) return json({ error: error.message }, 500);
    }
    return json({ added: fresh.length, alreadyListed: cleaned.length - fresh.length });
  }

  const status = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [usage, state, termsLeft, pending, imported, skipped, total] = await Promise.all([
      db.from("course_import_usage").select("requests").eq("day", today).maybeSingle(),
      db.from("course_import_state").select("paused_reason").eq("id", 1).single(),
      db.from("course_import_terms").select("id", { count: "exact", head: true }).is("searched_at", null),
      db.from("course_import_candidates").select("api_course_id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("course_import_candidates").select("api_course_id", { count: "exact", head: true }).eq("status", "imported"),
      db.from("course_import_candidates").select("api_course_id", { count: "exact", head: true }).eq("status", "skipped"),
      db.from("courses").select("id", { count: "exact", head: true }),
    ]);
    const areas = await db.from("course_import_points").select("id", { count: "exact", head: true }).is("searched_at", null);
    return {
      requestsToday: usage.data?.requests ?? 0,
      dailyCap: DAILY_CAP,
      pausedReason: state.data?.paused_reason ?? null,
      placesLeft: termsLeft.count ?? 0,
      pending: pending.count ?? 0,
      importedTotal: imported.count ?? 0,
      skippedTotal: skipped.count ?? 0,
      coursesInDatabase: total.count ?? 0,
      areasLeft: areas.count ?? 0,
    };
  };

  if (action === "status") return json(await status());
  if (action === "resume") {
    await db.from("course_import_state").update({ paused_reason: null }).eq("id", 1);
    return json(await status());
  }

  // ---- run one bounded batch ----
  const mode = body.mode === "area" ? "area" : "name";
  const wanted = Math.max(1, Math.min(Number(body.maxNew) || 50, 200));
  const { data: st } = await db.from("course_import_state").select("paused_reason").eq("id", 1).single();
  if (st?.paused_reason) return json({ stop: "paused", reason: st.paused_reason, ...(await status()) });

  const { data: locked } = await db.rpc("acquire_course_import_lock", { _seconds: 90 });
  if (!locked) return json({ stop: "busy", ...(await status()) });

  const started = Date.now();
  const apiKey = Deno.env.get("GOLF_COURSE_API_KEY")!;
  let used = 0, imported = 0, skipped = 0, found = 0;
  let stop: string | null = null;

  const pause = async (reason: string) => {
    await db.from("course_import_state").update({ paused_reason: reason }).eq("id", 1);
    stop = "paused";
  };

  // Returns parsed JSON, or null when the batch must stop.
  const apiGet = async (path: string): Promise<any | null> => {
    const { data: total } = await db.rpc("add_course_import_usage", { _n: 1 });
    used++;
    if ((total ?? 0) > DAILY_CAP) { stop = "daily_limit"; return null; }
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 429) { stop = "rate_limited"; return null; }
    if (res.status === 401 || res.status === 403) {
      await pause(`Course service refused access (${res.status}). Check the API key or plan.`);
      return null;
    }
    if (!res.ok) return { __error: res.status };
    return res.json();
  };

  const canContinue = () =>
    !stop && imported < wanted && used < MAX_REQUESTS_PER_CALL && Date.now() - started < TIME_BUDGET_MS;

  try {
    while (canContinue()) {
      const { data: next } = await db
        .from("course_import_candidates").select("api_course_id")
        .eq("status", "pending").order("created_at").limit(1).maybeSingle();

      if (next) {
        const id = next.api_course_id as string;
        const detail = await apiGet(`/courses/${encodeURIComponent(id)}`);
        if (detail === null) break;
        const mark = (s: string, reason?: string) =>
          db.from("course_import_candidates")
            .update({ status: s, reason: reason ?? null, processed_at: new Date().toISOString() })
            .eq("api_course_id", id);

        if (detail.__error) { await mark("failed", `HTTP ${detail.__error}`); continue; }
        const c = detail.course ?? detail;
        const tees: Array<{ gender: string; idx: number; t: ApiTee }> = [];
        for (const gender of ["male", "female"]) {
          (c.tees?.[gender] ?? []).forEach((t: ApiTee, idx: number) => {
            if (completeTee(t)) tees.push({ gender, idx, t });
          });
        }
        if (tees.length === 0) { await mark("skipped", "Incomplete scorecard"); skipped++; continue; }

        // Guard against a course added by a member meanwhile.
        const { data: exists } = await db.from("courses").select("id").eq("api_course_id", id).maybeSingle();
        if (exists) { await mark("skipped", "Already in database"); skipped++; continue; }

        const club = (c.club_name ?? "").trim();
        const course = (c.course_name ?? "").trim();
        const name = club && course && club.toLowerCase() !== course.toLowerCase()
          ? `${club} - ${course}` : club || course;
        const loc = c.location ?? {};
        const hasCoords = typeof loc.latitude === "number" && typeof loc.longitude === "number";

        const { data: inserted, error: insErr } = await db.from("courses").insert({
          name, api_course_id: id, city: loc.city ?? null, state: loc.state ?? null,
          country: loc.country ?? null,
          latitude: hasCoords ? loc.latitude : null, longitude: hasCoords ? loc.longitude : null,
          coords_source: hasCoords ? "api" : null, user_id: null,
        }).select("id").single();
        if (insErr || !inserted) { await mark("failed", insErr?.message ?? "Insert failed"); continue; }
        if (hasCoords) {
          const r = (n: number) => Math.round(n / 0.2) * 0.2;
          await db.from("course_import_points").upsert(
            { lat: r(loc.latitude).toFixed(1), lng: r(loc.longitude).toFixed(1) },
            { onConflict: "lat,lng", ignoreDuplicates: true },
          );
        }

        for (const { gender, idx, t } of tees) {
          const holes = t.holes!;
          const { data: teeRow, error: teeErr } = await db.from("course_tees").insert({
            course_id: inserted.id,
            tee_id: `${gender === "female" ? "f" : "m"}-${idx}`,
            name: t.tee_name || (gender === "female" ? "Ladies" : "Mens"),
            color: teeColor(t.tee_name ?? "", gender),
            gender,
            rating: t.course_rating ?? 72,
            slope: t.slope_rating ?? 113,
            par: t.par_total ?? holes.reduce((s, h) => s + (h.par ?? 0), 0),
            yards: t.total_yards ?? holes.reduce((s, h) => s + (h.yardage ?? 0), 0),
          }).select("id").single();
          if (teeErr || !teeRow) continue;
          await db.from("course_holes").insert(holes.map((h, i) => ({
            tee_id: teeRow.id, hole_number: i + 1, par: h.par!,
            yards: h.yardage ?? null, handicap: h.handicap ?? null,
          })));
        }
        await mark("imported");
        imported++;
        continue;
      }

      // No pending candidates: run the next search.
      let res: any;
      let finish: () => Promise<unknown>;
      if (mode === "area") {
        const { data: pt } = await db
          .from("course_import_points").select("id, lat, lng")
          .is("searched_at", null).order("id").limit(1).maybeSingle();
        if (!pt) { stop = "no_more_areas"; break; }
        res = await apiGet(`/proximity?latitude=${pt.lat}&longitude=${pt.lng}&radius=15&unit=mi&limit=25`);
        finish = () => db.from("course_import_points")
          .update({ searched_at: new Date().toISOString(), results_found: freshCount }).eq("id", pt.id);
      } else {
        const { data: term } = await db
          .from("course_import_terms").select("id, term")
          .is("searched_at", null).order("sort_order").limit(1).maybeSingle();
        if (!term) { stop = "no_more_places"; break; }
        res = await apiGet(`/search?search_query=${encodeURIComponent(term.term)}`);
        finish = () => db.from("course_import_terms")
          .update({ searched_at: new Date().toISOString(), results_found: freshCount }).eq("id", term.id);
      }
      if (res === null) break;
      let freshCount = 0;
      const results: any[] = res.__error ? [] : res.courses ?? [];
      const ids = results
        .filter((r) => r?.id && r.tees && Object.values(r.tees).some((n) => Number(n) > 0))
        .map((r) => ({ id: String(r.id), label: `${r.club_name ?? ""} ${r.location?.city ? "· " + r.location.city : ""}`.trim() }));

      if (ids.length) {
        const list = ids.map((x) => x.id);
        const [{ data: inCourses }, { data: inCands }] = await Promise.all([
          db.from("courses").select("api_course_id").in("api_course_id", list),
          db.from("course_import_candidates").select("api_course_id").in("api_course_id", list),
        ]);
        const known = new Set([...(inCourses ?? []), ...(inCands ?? [])].map((r) => r.api_course_id));
        const fresh = ids.filter((x, i, arr) => !known.has(x.id) && arr.findIndex((y) => y.id === x.id) === i);
        if (fresh.length) {
          await db.from("course_import_candidates").upsert(
            fresh.map((x) => ({ api_course_id: x.id, label: x.label })),
            { onConflict: "api_course_id", ignoreDuplicates: true },
          );
        }
        freshCount = fresh.length;
      }
      found += freshCount;
      await finish();
    }
  } finally {
    await db.from("course_import_state").update({ lock_until: null }).eq("id", 1);
  }

  return json({ stop, imported, skipped, found, requestsUsed: used, ...(await status()) });
});
