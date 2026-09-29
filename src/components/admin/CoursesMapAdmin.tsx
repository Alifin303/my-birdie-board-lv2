import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { courseDisplayName } from "@/lib/course-seo";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

interface Row {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

function Fit({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length) map.fitBounds(pts, { padding: [30, 30] });
  }, [pts, map]);
  return null;
}

export default function CoursesMapAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all: Row[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("courses")
          .select("id,name,city,state,country,latitude,longitude")
          .order("id")
          .range(from, from + 999);
        if (error || !data) break;
        all.push(...(data as Row[]));
        if (data.length < 1000) break;
      }
      setRows(all);
      setLoading(false);
    })();
  }, []);

  const mapped = useMemo(() => rows.filter((r) => r.latitude != null && r.longitude != null), [rows]);
  const pts = useMemo(() => mapped.map((r) => [Number(r.latitude), Number(r.longitude)] as [number, number]), [mapped]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {mapped.length} of {rows.length} courses in the database have map coordinates
        {rows.length - mapped.length > 0 ? ` (${rows.length - mapped.length} not shown).` : "."}
      </p>
      <div className="isolate z-0 h-[600px] w-full overflow-hidden rounded-lg border">
        <MapContainer center={[30, 0]} zoom={2} className="h-full w-full" preferCanvas>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Fit pts={pts} />
          {mapped.map((r) => (
            <CircleMarker
              key={r.id}
              center={[Number(r.latitude), Number(r.longitude)]}
              radius={5}
              pathOptions={{ color: "#ffffff", weight: 1, fillColor: "#2563eb", fillOpacity: 0.9 }}
            >
              <Popup>
                <strong>{courseDisplayName(r.name)}</strong>
                <br />
                {[r.city, r.state, r.country].filter(Boolean).join(", ")}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
