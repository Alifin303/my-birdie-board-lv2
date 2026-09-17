/**
 * Helpers for per-course SEO metadata and static course facts.
 * The snapshot is generated at build time by scripts/generate-courses-data.mjs.
 */
import coursesData from '../data/courses-static.json';

export interface StaticCourse {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  par: number | null;
  holes: number | null;
  teeCount: number;
  roundsCount: number;
  averageScore: number | null;
}

/** Minimum logged rounds before the anonymised average score is shown. */
export const MIN_ROUNDS_FOR_AGGREGATE = 15;

export const staticCourses = coursesData as StaticCourse[];

export function getStaticCourse(id: number | string | undefined): StaticCourse | null {
  const numeric = typeof id === 'string' ? parseInt(id, 10) : id;
  if (numeric === undefined || numeric === null || Number.isNaN(numeric)) return null;
  return staticCourses.find((c) => c.id === numeric) ?? null;
}

export function courseLocation(course: { city?: string | null; state?: string | null }): string {
  return [course.city, course.state].filter(Boolean).join(', ');
}

export function courseTitle(name: string): string {
  return `${name} — Scorecard & Golf Stats | MyBirdieBoard`;
}

export function courseDescription(name: string): string {
  return `Track your rounds at ${name}. See course details and log your scores with MyBirdieBoard's free golf tracker.`;
}

/** All pre-renderable course routes, e.g. /courses/40 */
export const courseRoutes = staticCourses.map((c) => `/courses/${c.id}`);
