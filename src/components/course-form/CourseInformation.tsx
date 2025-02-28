
import React from "react";
import { Input } from "@/components/ui/input";
import { ManualCourseData } from "./types";

interface CourseInformationProps {
  formData: ManualCourseData;
  handleInputChange: (field: keyof ManualCourseData, value: string) => void;
  isEditMode: boolean;
}

export function CourseInformation({ 
  formData, 
  handleInputChange,
  isEditMode
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
          onChange={(e) => handleInputChange('name', e.target.value)}
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
            onChange={(e) => handleInputChange('city', e.target.value)}
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
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="e.g. GA"
          />
        </div>
      </div>
    </div>
  );
}
