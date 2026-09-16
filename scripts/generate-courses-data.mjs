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

  const courses = await rest('rpc/get_public_courses');

  const data = courses.map((c) => {
    const par = typeof c.par === 'number' && c.par > 0 ? c.par : null;
    const holes = par ? (par <= 40 ? 9 : 18) : null;
    const avg = c.average_score === null || c.average_score === undefined ? null : Number(c.average_score);

    return {
      id: c.id,
      name: c.name,
      city: c.city || null,
      state: c.state || null,
      latitude: c.latitude ?? null,
      longitude: c.longitude ?? null,
      par,
      holes,
      teeCount: c.tee_count ?? 0,
      roundsCount: c.rounds_count ?? 0,
      averageScore: avg,
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
