
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
        <label className="text-sm font-medium">Course Name</label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter course name"
          className="mt-1"
          required
          disabled={isEditMode}
        />
        {isEditMode && (
          <p className="text-xs text-muted-foreground mt-1">
            Course name cannot be changed after creation
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">City</label>
          <Input
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
            className="mt-1"
            required
            disabled={isEditMode}
          />
          {isEditMode && (
            <p className="text-xs text-muted-foreground mt-1">
              City cannot be changed after creation
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">State</label>
          <Input
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state (optional)"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
