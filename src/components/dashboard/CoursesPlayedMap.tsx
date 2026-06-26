import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CourseCoord,
  fetchAndStoreCoordsFromApi,
} from "@/lib/course-coords";

// Leaflet CSS + lib (client only — this file is dynamically imported by the dashboard)
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

// Fix default marker icon paths (Leaflet ships icons via webpack-relative URLs)
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface CoursesPlayedMapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRounds: Array<{
    course_id: number;
    courses?: { id: number; name: string; city?: string | null; state?: string | null } | null;
  }>;
}

function FitBounds({ courses }: { courses: CourseCoord[] }) {
  const map = useMap();
  useEffect(() => {
    const points = courses
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => [c.latitude as number, c.longitude as number] as [number, number]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 11);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [courses, map]);
  return null;
}

export default function CoursesPlayedMap({
  open,
  onOpenChange,
  userRounds,
}: CoursesPlayedMapProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseCoord[]>([]);
  const fetchedRef = useRef(false);

  // Build the list of unique courses with round counts
  const courseSummaries = useMemo(() => {
    const map = new Map<number, { count: number; name: string }>();
    for (const r of userRounds || []) {
      if (!r.course_id) continue;
      const existing = map.get(r.course_id);
      if (existing) existing.count++;
      else
        map.set(r.course_id, {
          count: 1,
          name: r.courses?.name || `Course ${r.course_id}`,
        });
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [userRounds]);

  useEffect(() => {
    if (!open) {
      fetchedRef.current = false;
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ids = courseSummaries.map((c) => c.id);
        if (ids.length === 0) {
          setCourses([]);
          return;
        }

        const { data, error } = await supabase
          .from("courses")
          .select("id, name, city, state, latitude, longitude, api_course_id")
          .in("id", ids);
        if (error) throw error;

        const byId = new Map(data?.map((c) => [c.id, c]) || []);
        const initial: CourseCoord[] = courseSummaries.map((s) => {
          const c = byId.get(s.id);
          return {
            id: s.id,
            name: c?.name || s.name,
            city: c?.city ?? null,
            state: c?.state ?? null,
            latitude: c?.latitude ?? null,
            longitude: c?.longitude ?? null,
            api_course_id: c?.api_course_id ?? null,
            roundCount: s.count,
          };
        });
        if (!cancelled) setCourses(initial);

        // Backfill missing coords from the Golf Course API where possible
        const missing = initial.filter(
          (c) => (c.latitude == null || c.longitude == null) && c.api_course_id
        );
        for (const c of missing) {
          if (cancelled) return;
          const coords = await fetchAndStoreCoordsFromApi(c.id, c.api_course_id!);
          if (coords && !cancelled) {
            setCourses((prev) =>
              prev.map((p) =>
                p.id === c.id
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
  }, [open, courseSummaries]);

  const withCoords = courses.filter(
    (c) => c.latitude != null && c.longitude != null
  );
  const withoutCoords = courses.filter(
    (c) => c.latitude == null || c.longitude == null
  );

  const initialCenter: [number, number] =
    withCoords[0]
      ? [withCoords[0].latitude as number, withCoords[0].longitude as number]
      : [54.5, -3]; // roughly centre of the UK as a default

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Courses You've Played
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[70vh] w-full bg-muted">
          {courseSummaries.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Log a round to start building your map.
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
                  key={c.id}
                  position={[c.latitude as number, c.longitude as number]}
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
                        {c.roundCount} round{c.roundCount === 1 ? "" : "s"} played
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {loading && (
            <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 text-xs shadow">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading locations…
            </div>
          )}
        </div>

        {withoutCoords.length > 0 && !loading && (
          <div className="border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            {withoutCoords.length} course{withoutCoords.length === 1 ? "" : "s"} not
            shown — no location on file. Edit a user-added course to add its location.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
