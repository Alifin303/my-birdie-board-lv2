/**
 * Build-time snapshot of public course data.
 *
 * Writes src/data/courses-static.json so that /courses/:id pages can be
 * pre-rendered with real content (name, location, holes, par) in the
 * initial HTML rather than only after client-side JavaScript runs.
 *
 * Only course-level facts and anonymised aggregates are included —
 * never user names, user ids, or individual scorecards.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outPath = resolve(root, 'src/data/courses-static.json');

function readEnv() {
  const env = { ...process.env };
  const envFile = resolve(root, '.env');
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf-8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  }
  return env;
}

const env = readEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  Supabase env vars missing — keeping existing courses snapshot.');
    return;
  }

  const courses = await rest('courses?select=id,name,city,state,latitude,longitude&order=name.asc&limit=5000');
  const tees = await rest('course_tees?select=course_id,par,yards,name&limit=20000');
  const rounds = await rest('rounds?select=course_id,gross_score,holes_played&limit=100000');

  const teesByCourse = new Map();
  for (const t of tees) {
    if (!teesByCourse.has(t.course_id)) teesByCourse.set(t.course_id, []);
    teesByCourse.get(t.course_id).push(t);
  }

  const roundsByCourse = new Map();
  for (const r of rounds) {
    if (!roundsByCourse.has(r.course_id)) roundsByCourse.set(r.course_id, []);
    roundsByCourse.get(r.course_id).push(r);
  }

  const data = courses.map((c) => {
    const courseTees = teesByCourse.get(c.id) || [];
    const pars = courseTees.map((t) => t.par).filter((p) => typeof p === 'number' && p > 0);
    const par = pars.length ? Math.round(pars.reduce((a, b) => a + b, 0) / pars.length) : null;

    const courseRounds = roundsByCourse.get(c.id) || [];
    const holesSet = courseRounds.map((r) => r.holes_played).filter(Boolean);
    const holes = par && par <= 40 ? 9 : par ? 18 : holesSet.includes(9) && !holesSet.includes(18) ? 9 : holesSet.length ? 18 : null;

    const scores = courseRounds.map((r) => r.gross_score).filter((s) => typeof s === 'number' && s > 0);
    const averageScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;

    return {
      id: c.id,
      name: c.name,
      city: c.city || null,
      state: c.state || null,
      latitude: c.latitude ?? null,
      longitude: c.longitude ?? null,
      par,
      holes,
      teeCount: courseTees.length,
      roundsCount: courseRounds.length,
      averageScore,
    };
  });

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`✅ courses-static.json written with ${data.length} courses`);
}

main().catch((err) => {
  console.error('Failed to generate courses snapshot:', err);
  process.exitCode = 0; // never break the build; fall back to existing snapshot
});
