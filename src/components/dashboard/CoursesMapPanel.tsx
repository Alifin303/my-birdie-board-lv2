import { courseDisplayName } from "@/lib/course-seo";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CourseCoord, fetchAndStoreCoordsFromApi } from "@/lib/course-coords";

// Leaflet CSS + lib (client only — this file is dynamically imported by the dashboard)
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type PinKind = "played" | "bucket";

const PIN_COLORS: Record<PinKind, string> = {
  played: "#2563eb", // blue
  bucket: "#dc2626", // red
};

function pinIcon(kind: PinKind) {
  const color = PIN_COLORS[kind];
  return L.divIcon({
    className: "",
    html: `<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 11.44 23.5 12 24.2a1.3 1.3 0 0 0 2 0C14.56 36.5 26 22.2 26 13 26 5.82 20.18 0 13 0z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="13" cy="13" r="4.5" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -32],
  });
}

interface MapCourse extends CourseCoord {
  kind: PinKind;
}

export interface BucketCourseInput {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  api_course_id: string | null;
}

interface CoursesMapPanelProps {
  userRounds: Array<{
    course_id: number;
    courses?: { id: number; name: string; city?: string | null; state?: string | null } | null;
  }>;
  bucketCourses?: BucketCourseInput[];
}

function FitBounds({ courses }: { courses: MapCourse[] }) {
  const map = useMap();
  useEffect(() => {
    const points = courses
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => [c.latitude as number, c.longitude as number] as [number, number]);
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 11);
    else map.fitBounds(points, { padding: [40, 40] });
  }, [courses, map]);
  return null;
}

export default function CoursesMapPanel({ userRounds, bucketCourses = [] }: CoursesMapPanelProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<MapCourse[]>([]);
  const fetchedRef = useRef<string>("");

  // Unique played courses with round counts
  const courseSummaries = useMemo(() => {
    const map = new Map<number, { count: number; name: string }>();
    for (const r of userRounds || []) {
      if (!r.course_id) continue;
      const existing = map.get(r.course_id);
      if (existing) existing.count++;
      else
        map.set(r.course_id, {
          count: 1,
          name: r.courses?.name ? courseDisplayName(r.courses.name) : `Course ${r.course_id}`,
        });
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [userRounds]);

  // Bucket-list courses that haven't been played yet
  const bucketOnly = useMemo(() => {
    const playedIds = new Set(courseSummaries.map((c) => c.id));
    return bucketCourses.filter((c) => !playedIds.has(c.id));
  }, [bucketCourses, courseSummaries]);

  const signature = useMemo(
    () =>
      `${courseSummaries.map((c) => c.id).sort().join(",")}|${bucketOnly
        .map((c) => c.id)
        .sort()
        .join(",")}`,
    [courseSummaries, bucketOnly]
  );

  useEffect(() => {
    if (fetchedRef.current === signature) return;
    fetchedRef.current = signature;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ids = courseSummaries.map((c) => c.id);
        let byId = new Map<number, any>();

        if (ids.length > 0) {
          const { data, error } = await supabase
            .from("courses")
            .select("id, name, city, state, latitude, longitude, api_course_id")
            .in("id", ids);
          if (error) throw error;
          byId = new Map(data?.map((c) => [c.id, c]) || []);
        }

        const playedPins: MapCourse[] = courseSummaries.map((s) => {
          const c = byId.get(s.id);
          return {
            id: s.id,
            name: c?.name ? courseDisplayName(c.name) : s.name,
            city: c?.city ?? null,
            state: c?.state ?? null,
            latitude: c?.latitude ?? null,
            longitude: c?.longitude ?? null,
            api_course_id: c?.api_course_id ?? null,
            roundCount: s.count,
            kind: "played",
          };
        });

        const bucketPins: MapCourse[] = bucketOnly.map((c) => ({
          id: c.id,
          name: courseDisplayName(c.name),
          city: c.city,
          state: c.state,
          latitude: c.latitude,
          longitude: c.longitude,
          api_course_id: c.api_course_id,
          roundCount: 0,
          kind: "bucket",
        }));

        const initial = [...playedPins, ...bucketPins];
        if (!cancelled) setCourses(initial);

        // Backfill missing coords server-side
        const missing = initial.filter((c) => c.latitude == null || c.longitude == null);
        for (const c of missing) {
          if (cancelled) return;
          const coords = await fetchAndStoreCoordsFromApi(c.id, c.api_course_id);
          if (coords && !cancelled) {
            setCourses((prev) =>
              prev.map((p) =>
                p.id === c.id && p.kind === c.kind
                  ? { ...p, latitude: coords.latitude, longitude: coords.longitude }
                  : p
              )
            );
          }
        }
      } catch (e) {
        console.error("Failed to load courses for map", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signature, courseSummaries, bucketOnly]);

  const withCoords = courses.filter((c) => c.latitude != null && c.longitude != null);
  const withoutCoords = courses.filter((c) => c.latitude == null || c.longitude == null);

  const initialCenter: [number, number] = withCoords[0]
    ? [withCoords[0].latitude as number, withCoords[0].longitude as number]
    : [54.5, -3];

  return (
    <div className="space-y-3">
      <div className="relative h-[420px] sm:h-[520px] w-full overflow-hidden rounded-lg border bg-muted">
        {courses.length === 0 && !loading ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Log a round or add a bucket-list course to start building your map.
          </div>
        ) : (
          <MapContainer
            center={initialCenter}
            zoom={5}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds courses={withCoords} />
            {withCoords.map((c) => (
              <Marker
                key={`${c.kind}-${c.id}`}
                position={[c.latitude as number, c.longitude as number]}
                icon={pinIcon(c.kind)}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{c.name}</div>
                    {(c.city || c.state) && (
                      <div className="text-xs text-muted-foreground">
                        {[c.city, c.state].filter(Boolean).join(", ")}
                      </div>
                    )}
                    <div className="text-xs">
                      {c.kind === "played"
                        ? `${c.roundCount} round${c.roundCount === 1 ? "" : "s"} played`
                        : "On your bucket list"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {loading && (
          <div className="pointer-events-none absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 text-xs shadow">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading locations…
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: PIN_COLORS.played }}
          />
          Courses you've played
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: PIN_COLORS.bucket }}
          />
          On your bucket list
        </span>
        {withoutCoords.length > 0 && !loading && (
          <span>
            {withoutCoords.length} course{withoutCoords.length === 1 ? "" : "s"} not shown — no location
            on file.
          </span>
        )}
      </div>
    </div>
  );
}
