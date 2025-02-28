
// Define interface for tee data
export interface TeeData {
  id: string;
  name: string;
  color: string;
  gender: 'male' | 'female';
  holes: HoleData[];
}

// Interface for hole data
export interface HoleData {
  number: number;
  par: number;
  yards: number;
  handicap: number;
}

// Define interface for manual course data
export interface ManualCourseData {
  name: string;
  city: string;
  state: string;
  tees: TeeData[];
}

// Available tee options with standard colors
export const teeOptions = [
  { name: 'Black', color: '#000000', gender: 'male' },
  { name: 'Blue', color: '#0000FF', gender: 'male' },
  { name: 'White', color: '#FFFFFF', gender: 'male' },
  { name: 'Yellow', color: '#FFFF00', gender: 'male' },
  { name: 'Red', color: '#FF0000', gender: 'female' },
  { name: 'Green', color: '#008000', gender: 'female' },
  { name: 'Gold', color: '#FFD700', gender: 'male' },
  { name: 'Silver', color: '#C0C0C0', gender: 'female' },
];

export interface ManualCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: (courseId: number, courseName: string) => void;
  existingCourse?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    tees?: TeeData[];
  };
}
