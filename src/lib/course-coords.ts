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
 * Resolve coordinates for a course via the `course-coords` edge function
 * (Golf Course API first, then server-side Nominatim geocoding) and persist
 * them with elevated privileges. Returns the lat/lng if found.
 */
export async function fetchAndStoreCoordsFromApi(
  courseId: number,
  apiCourseId?: string | null
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("course-coords", {
      body: { courseId, apiCourseId: apiCourseId || undefined },
    });
    if (error) {
      console.warn("course-coords failed", error.message);
      return null;
    }
    if (typeof data?.latitude === "number" && typeof data?.longitude === "number") {
      return { latitude: data.latitude, longitude: data.longitude };
    }
    console.warn("course-coords returned no location", data);
    return null;
  } catch (e) {
    console.error("fetchAndStoreCoordsFromApi failed", e);
    return null;
  }
}



// Nominatim allows ~1 request/second — serialise and throttle calls.
let geocodeQueue: Promise<unknown> = Promise.resolve();
function throttle<T>(fn: () => Promise<T>): Promise<T> {
  const run = geocodeQueue.then(fn, fn);
  geocodeQueue = run.then(
    () => new Promise((r) => setTimeout(r, 1100)),
    () => new Promise((r) => setTimeout(r, 1100))
  );
  return run;
}

/**
 * Geocode a free-text query using OpenStreetMap Nominatim.
 * Returns the first match's lat/lng + display name.
 */
export async function geocodeWithNominatim(
  query: string
): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  if (!query.trim()) return null;
  return throttle(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
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
  });
}

