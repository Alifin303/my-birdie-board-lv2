import React from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { ManualCourseData } from "./types";
import { LocationPicker } from "@/components/map/LocationPicker";

interface CourseInformationProps {
  formData: ManualCourseData;
  handleInputChange: (field: keyof ManualCourseData, value: string) => void;
  setCoords?: (lat: number | null, lng: number | null) => void;
  isEditMode: boolean;
}

export function CourseInformation({
  formData,
  handleInputChange,
  setCoords,
  isEditMode,
}: CourseInformationProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="course-name" className="text-sm font-medium">
          Course Name
        </label>
        <Input
          id="course-name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g. Augusta National Golf Club"
          required
          disabled={isEditMode}
          className={isEditMode ? "bg-muted cursor-not-allowed" : ""}
        />
        {isEditMode && (
          <p className="text-xs text-muted-foreground mt-1">
            Course name cannot be changed in edit mode.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course-city" className="text-sm font-medium">
            City
          </label>
          <Input
            id="course-city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="e.g. Augusta"
            required
            disabled={isEditMode}
            className={isEditMode ? "bg-muted cursor-not-allowed" : ""}
          />
          {isEditMode && (
            <p className="text-xs text-muted-foreground mt-1">
              City cannot be changed in edit mode.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="course-state" className="text-sm font-medium">
            State/Province (optional)
          </label>
          <Input
            id="course-state"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            placeholder="e.g. GA"
          />
        </div>
      </div>

      {setCoords && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            Location for map pin
          </div>
          <p className="text-xs text-muted-foreground">
            Search by name, postcode or city — or click anywhere on the map to drop a pin. Drag the pin to fine-tune.
          </p>
          <LocationPicker
            latitude={formData.latitude ?? null}
            longitude={formData.longitude ?? null}
            onChange={(lat, lng) => setCoords(lat, lng)}
            defaultSearch={[formData.name, formData.city, formData.state]
              .filter(Boolean)
              .join(", ")}
            height={260}
          />
        </div>
      )}
    </div>
  );
}
