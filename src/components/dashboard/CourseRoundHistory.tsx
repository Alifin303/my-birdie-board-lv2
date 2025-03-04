
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { calculateStats } from "@/utils/statsCalculator";
import { ScoreProgressChart } from "./ScoreProgressChart";
import { CourseLeaderboard, RoundScorecard } from "./CourseStats";
import { Round } from "./types";
import { PotentialBestScore } from "./PotentialBestScore";

interface CourseRoundHistoryProps {
  userRounds: Round[] | undefined;
  selectedCourseId: number;
  onBackClick: () => void;
  handicapIndex: number;
}

export const CourseRoundHistory = ({
  userRounds,
  selectedCourseId,
  onBackClick,
  handicapIndex
}: CourseRoundHistoryProps) => {
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  
  const courseRounds = useMemo(() => {
    if (!userRounds) return [];
    return userRounds.filter(round => round.courses?.id === selectedCourseId);
  }, [userRounds, selectedCourseId]);
  
  const selectedCourse = courseRounds[0]?.courses;
  
  const stats = useMemo(() => {
    if (courseRounds.length === 0) return null;
    return calculateStats(courseRounds);
  }, [courseRounds]);
  
  const handleRoundClick = (roundId: number) => {
    setSelectedRoundId(prev => prev === roundId ? null : roundId);
  };
  
  if (selectedRoundId) {
    const round = courseRounds.find(r => r.id === selectedRoundId);
    if (!round) return null;
    
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
          onClick={() => setSelectedRoundId(null)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to rounds
        </Button>
        
        <RoundScorecard 
          round={round} 
          onClose={() => setSelectedRoundId(null)} 
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
          onClick={onBackClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all courses
        </Button>
        
        <div>
          <h2 className="text-xl font-bold text-white">
            {selectedCourse?.clubName || "Unknown Club"}
          </h2>
          <p className="text-sm text-white/80">
            {selectedCourse?.courseName || "Unknown Course"}
          </p>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-1">Rounds Played</h3>
            <p className="text-2xl font-bold">{courseRounds.length}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-1">Best Score</h3>
            <p className="text-2xl font-bold">{stats.bestGrossScore}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-1">Best to Par</h3>
            <p className="text-2xl font-bold">{stats.bestToPar > 0 ? '+' : ''}{stats.bestToPar}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Score Progression Over Time</h3>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <ScoreProgressChart rounds={courseRounds} />
        </div>
      </div>
      
      <PotentialBestScore rounds={courseRounds} />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Want to see how your score compares to other golfers at this course?</h3>
        <CourseLeaderboard courseId={selectedCourseId} />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Your Rounds</h3>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="text-left border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-white/80">Date</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-white/80">Tees</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-white/80">Gross Score</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-white/80">To Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {courseRounds.map((round) => (
                  <tr 
                    key={round.id} 
                    className="hover:bg-white/20 cursor-pointer transition-colors"
                    onClick={() => handleRoundClick(round.id)}
                  >
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(round.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {round.tee_name || "Standard"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {round.gross_score}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
