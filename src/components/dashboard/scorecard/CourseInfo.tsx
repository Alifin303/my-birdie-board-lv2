
interface CourseInfoProps {
  courseData: {
    clubName?: string;
    courseName?: string;
    city?: string;
    state?: string;
  };
  roundDate: string;
  teeName?: string;
}

export const CourseInfo = ({ courseData, roundDate, teeName }: CourseInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-semibold">Course Information</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {courseData.clubName} - {courseData.courseName}
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
