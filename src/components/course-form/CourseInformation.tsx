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
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  const handleFindLocation = async () => {
    const query = [formData.name, formData.city, formData.state]
      .filter(Boolean)
      .join(", ");
    if (!query.trim()) {
      toast({
        title: "Enter a name or city first",
        description: "We need at least a course name or city to search.",
        variant: "destructive",
      });
      return;
    }
    setLocating(true);
    try {
      const result = await geocodeWithNominatim(query);
      if (!result) {
        toast({
          title: "Couldn't find that location",
          description: "Try adding the city or refining the course name.",
          variant: "destructive",
        });
        return;
      }
      setCoords?.(result.latitude, result.longitude);
      toast({
        title: "Location found",
        description: result.displayName,
      });
    } finally {
      setLocating(false);
    }
  };

  const hasCoords =
    formData.latitude != null && formData.longitude != null;

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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Location for map pin
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleFindLocation}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                {hasCoords ? "Re-search" : "Find on map"}
              </Button>
              {hasCoords && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCoords(null, null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          {hasCoords ? (
            <p className="text-xs text-muted-foreground">
              Pinned at {formData.latitude!.toFixed(4)},{" "}
              {formData.longitude!.toFixed(4)}. This is used to show the course on
              your map.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Optional. Click "Find on map" to look up coordinates from the course
              name and city so it appears on your Courses Played map.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
