
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoundScorecard } from './scorecard/RoundScorecard';
import { getExactTeeName } from '@/utils/teeNameUtils';

interface CourseRoundHistoryProps {
  userRounds: any[] | undefined;
  selectedCourseId: number;
  onBackClick: () => void;
}

export const CourseRoundHistory = ({ userRounds, selectedCourseId, onBackClick }: CourseRoundHistoryProps) => {
  const [selectedRound, setSelectedRound] = React.useState<any | null>(null);
  const [isRoundModalOpen, setIsRoundModalOpen] = React.useState(false);

  const courseRounds = useMemo(() => {
    if (!userRounds) return [];
    
    const filteredRounds = userRounds.filter((round) => 
      round.course_id === selectedCourseId
    );
    
    // Debug logging for tee names
    console.log("DEBUGGING TEE DISPLAY: All course rounds with tee information:", filteredRounds.map(r => ({
      id: r.id,
      tee_name: r.tee_name,
      rawTeeName: r.tee_name, // Add another property to see exact value
      tee_id: r.tee_id,
      date: format(new Date(r.date), 'dd/MM/yyyy')
    })));
    
    return filteredRounds;
  }, [userRounds, selectedCourseId]);

  const handleOpenRoundDetails = (round: any) => {
    setSelectedRound(round);
    setIsRoundModalOpen(true);
  };

  if (courseRounds.length === 0) {
    return (
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBackClick}
          className="mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Courses
        </Button>
        <p>No rounds found for this course.</p>
      </div>
    );
  }

  const selectedCourse = courseRounds[0]?.courses;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBackClick}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Courses
        </Button>
        <h2 className="text-2xl font-semibold">
          {selectedCourse?.clubName} - {selectedCourse?.courseName}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Round History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Tees</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">To Par</th>
                  <th className="text-center py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseRounds.map((round) => {
                  // Log each round's tee name as it's being rendered
                  console.log(`Rendering round ${round.id} with tee_name:`, round.tee_name);
                  
                  return (
                    <tr key={round.id} className="border-b">
                      <td className="py-2">
                        {format(new Date(round.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2">
                        {getExactTeeName(round.tee_name)}
                      </td>
                      <td className="py-2">{round.gross_score}</td>
                      <td className="py-2">
                        {round.to_par_gross > 0 ? `+${round.to_par_gross}` : round.to_par_gross}
                      </td>
                      <td className="py-2">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRoundDetails(round)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedRound && (
        <RoundScorecard
          round={selectedRound}
          isOpen={isRoundModalOpen}
          onOpenChange={setIsRoundModalOpen}
        />
      )}
    </div>
  );
};
