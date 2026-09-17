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
  holePars: number[] | null;
  teeCount: number;
  roundsCount: number;
  averageScore: number | null;
}

/** Minimum logged rounds before the anonymised average score is shown. */
export const MIN_ROUNDS_FOR_AGGREGATE = 15;

export const staticCourses = coursesData as StaticCourse[];

const GENERIC_COURSE_WORDS = new Set([
  'and', 'cc', 'centre', 'center', 'club', 'complex', 'country', 'course',
  'g', 'gc', 'gcc', 'golf', 'hotel', 'ltd', 'municipal', 'resort', 'the',
]);

function comparableCourseWords(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word && !GENERIC_COURSE_WORDS.has(word));
}

/** Removes source IDs and clearly redundant suffixes for display only. */
export function courseDisplayName(name: string): string {
  const withoutSystemLabels = name
    .replace(/\s*\(\d+\)/g, '')
    .replace(/\s*\[\s*(?:user[\s_-]*added(?:\s+course)?|system(?:\s+label)?|custom(?:\s+course)?|manually?[\s_-]*added(?:\s+course)?)\s*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const separatorIndex = withoutSystemLabels.indexOf(' - ');
  if (separatorIndex === -1) return withoutSystemLabels;

  const primaryName = withoutSystemLabels.slice(0, separatorIndex).trim();
  const suffix = withoutSystemLabels.slice(separatorIndex + 3).trim();
  if (!suffix) return primaryName;

  const primaryWords = comparableCourseWords(primaryName);
  const suffixWords = comparableCourseWords(suffix);
  const exactRepeat = primaryName.toLowerCase() === suffix.toLowerCase();
  const suffixRepeatsPrimary = suffixWords.length > 0 && suffixWords.every((word) => primaryWords.includes(word));

  return exactRepeat || suffixRepeatsPrimary ? primaryName : `${primaryName} - ${suffix}`;
}

export function getStaticCourse(id: number | string | undefined): StaticCourse | null {
  const numeric = typeof id === 'string' ? parseInt(id, 10) : id;
  if (numeric === undefined || numeric === null || Number.isNaN(numeric)) return null;
  return staticCourses.find((c) => c.id === numeric) ?? null;
}

export function courseLocation(course: { city?: string | null; state?: string | null }): string {
  return [course.city, course.state].filter(Boolean).join(', ');
}

export function courseTitle(name: string): string {
  return `${courseDisplayName(name)} — Scorecard & Golf Stats | MyBirdieBoard`;
}

export function courseDescription(name: string): string {
  return `Track your rounds at ${courseDisplayName(name)}. See course details and log your scores with MyBirdieBoard's free golf tracker.`;
}

/** All pre-renderable course routes, e.g. /courses/40 */
export const courseRoutes = staticCourses.map((c) => `/courses/${c.id}`);
