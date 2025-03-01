
interface CourseInfoProps {
  courseData: {
    clubName?: string;
    courseName?: string;
    city?: string;
    state?: string;
    name?: string;
  };
  roundDate: string;
  teeName?: string;
}

export const CourseInfo = ({ courseData, roundDate, teeName }: CourseInfoProps) => {
  // Handle both formats of course data (clubName/courseName or just name)
  const displayClubName = courseData.clubName || courseData.name || 'Unknown Club';
  const displayCourseName = courseData.courseName || courseData.name || 'Unknown Course';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-semibold">Course Information</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {displayClubName}{displayCourseName !== displayClubName ? ` - ${displayCourseName}` : ''}
        </p>
        <p className="text-sm text-muted-foreground">
          {courseData.city}{courseData.state ? `, ${courseData.state}` : ''}
        </p>
      </div>
      <div>
        <h3 className="font-semibold">Round Details</h3>
        <p className="text-sm text-muted-foreground mt-1">Date: {roundDate}</p>
        <p className="text-sm text-muted-foreground">Tees: {teeName || 'Not specified'}</p>
      </div>
    </div>
  );
};
