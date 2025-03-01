
import React from 'react';
import { Button } from '@/components/ui/button';

interface AddCourseButtonProps {
  onAddCourse: () => void;
}

export const AddCourseButton = ({ onAddCourse }: AddCourseButtonProps) => {
  return (
    <div className="text-center">
      <Button 
        variant="outline" 
        className="w-full text-accent"
        onClick={onAddCourse}
      >
        Can't find your course? Add it now
      </Button>
    </div>
  );
};
