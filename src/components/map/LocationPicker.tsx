import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { geocodeWithNominatim } from "@/lib/course-coords";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface LocationPickerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onChange: (lat: number | null, lng: number | null) => void;
  defaultSearch?: string;
  height?: number;
}

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 12));
    }
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  defaultSearch = "",
  height = 280,
}: LocationPickerProps) {
  const [query, setQuery] = useState(defaultSearch);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const hasCoords = latitude != null && longitude != null;
  const center: [number, number] = hasCoords
    ? [latitude as number, longitude as number]
    : [54.5, -3]; // UK default

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      toast({
        title: "Enter a location to search",
        description: "Type a course name, city, or address.",
        variant: "destructive",
      });
      return;
    }
    setSearching(true);
    try {
      const result = await geocodeWithNominatim(q);
      if (!result) {
        toast({
          title: "Couldn't find that location",
          description: "Try a different search or click the map to drop a pin.",
          variant: "destructive",
        });
        return;
      }
      onChange(result.latitude, result.longitude);
      toast({ title: "Location found", description: result.displayName });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search address, postcode or course"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        {hasCoords && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null, null)}
            title="Clear pin"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        className="overflow-hidden rounded-md border"
        style={{ height: `${height}px` }}
      >
        <MapContainer
          center={center}
          zoom={hasCoords ? 13 : 5}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            onClick={(lat, lng) => onChange(lat, lng)}
          />
          <Recenter
            lat={hasCoords ? (latitude as number) : null}
            lng={hasCoords ? (longitude as number) : null}
          />
          {hasCoords && (
            <Marker
              position={[latitude as number, longitude as number]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  onChange(ll.lat, ll.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        {hasCoords
          ? `Pinned at ${(latitude as number).toFixed(4)}, ${(longitude as number).toFixed(4)} — click or drag the pin to adjust.`
          : "Search above or click the map to drop a pin."}
      </p>
    </div>
  );
}

export default LocationPicker;
