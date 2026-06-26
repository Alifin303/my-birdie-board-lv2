import { supabase } from "@/integrations/supabase/client";

export interface CourseCoord {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  api_course_id: string | null;
  roundCount: number;
}

/**
 * Fetch coordinates from the Golf Course API for a course with an api_course_id,
 * persist them to the DB, and return the lat/lng.
 */
export async function fetchAndStoreCoordsFromApi(
  courseId: number,
  apiCourseId: string
): Promise<{ latitude: number; longitude: number } | null> {
  return rawFetchAndStore(courseId, apiCourseId);
}



async function rawFetchAndStore(
  courseId: number,
  apiCourseId: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!projectId || !anonKey) return null;

    const url = `https://${projectId}.supabase.co/functions/v1/golf-course-api?action=course&id=${encodeURIComponent(
      apiCourseId
    )}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const lat = json?.location?.latitude;
    const lng = json?.location?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") return null;

    await supabase
      .from("courses")
      .update({ latitude: lat, longitude: lng })
      .eq("id", courseId);

    return { latitude: lat, longitude: lng };
  } catch (e) {
    console.error("rawFetchAndStore failed", e);
    return null;
  }
}

/**
 * Geocode a free-text query using OpenStreetMap Nominatim.
 * Returns the first match's lat/lng + display name.
 */
export async function geocodeWithNominatim(
  query: string
): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  if (!query.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const hit = data[0];
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng, displayName: hit.display_name };
  } catch (e) {
    console.error("geocodeWithNominatim failed", e);
    return null;
  }
}
