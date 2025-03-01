
import { useState } from "react";
import { MainStats, HandicapCircle } from "@/components/dashboard/StatsDisplay";
import { CourseStatsTable, CourseRoundHistory } from "@/components/dashboard/course-stats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { calculateStats, calculateCourseStats } from "@/utils/statsCalculator";

interface Round {
  id: number;
  date: string;
  tee_name: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores?: any;
  courses?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    clubName?: string;
    courseName?: string;
  };
}

interface DashboardContentProps {
  userRounds: Round[] | null;
  roundsLoading: boolean;
  profile: any;
  scoreType: 'gross' | 'net';
  onScoreTypeChange: (type: 'gross' | 'net') => void;
  onAddRound: () => void;
  onViewScorecard: (round: Round) => void;
  onDeleteRound: (roundId: number) => void;
}

export const DashboardContent = ({
  userRounds,
  roundsLoading,
  profile,
  scoreType,
  onScoreTypeChange,
  onAddRound,
  onViewScorecard,
  onDeleteRound
}: DashboardContentProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <DashboardHeader 
        profileData={profile} 
        onAddRound={onAddRound} 
      />
      
      {!selectedCourseId && (
        <>
          <MainStats 
            userRounds={userRounds}
            roundsLoading={roundsLoading}
            scoreType={scoreType}
            calculateStats={calculateStats}
          />
          
          <HandicapCircle 
            userRounds={userRounds}
            roundsLoading={roundsLoading}
            scoreType={scoreType}
            onScoreTypeChange={onScoreTypeChange}
            calculateStats={calculateStats}
          />
        </>
      )}
      
      <div className="space-y-4">
        {selectedCourseId 
          ? <CourseRoundHistory 
              userRounds={userRounds} 
              selectedCourseId={selectedCourseId}
              onBackClick={() => setSelectedCourseId(null)}
              onViewScorecard={onViewScorecard}
              onDeleteRound={onDeleteRound}
              scoreType={scoreType}
            /> 
          : (
            <>
              <h2 className="text-2xl font-semibold">Your Courses</h2>
              <CourseStatsTable 
                userRounds={userRounds}
                scoreType={scoreType}
                calculateCourseStats={calculateCourseStats}
                onCourseClick={(courseId) => setSelectedCourseId(courseId)}
              />
            </>
          )
        }
      </div>
    </div>
  );
};
