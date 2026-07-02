import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export interface DemoMapCourse {
  id: number;
  name: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  roundCount: number;
}

function FitBounds({ courses }: { courses: DemoMapCourse[] }) {
  const map = useMap();
  useEffect(() => {
    const points = courses.map((c) => [c.latitude, c.longitude] as [number, number]);
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 8);
    else map.fitBounds(points, { padding: [40, 40] });
  }, [courses, map]);
  return null;
}

export default function DemoCoursesMap({ courses }: { courses: DemoMapCourse[] }) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={[30, -20]}
        zoom={2}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds courses={courses} />
        {courses.map((c) => (
          <Marker key={c.id} position={[c.latitude, c.longitude]}>
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
    </div>
  );
}
