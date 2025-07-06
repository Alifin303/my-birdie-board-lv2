
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MainStats, HandicapCircle } from "@/components/dashboard/StatsDisplay";
import { CourseStatsTable, CourseRoundHistory } from "@/components/dashboard/CourseStats";
import { DetailedStats } from "@/components/dashboard/DetailedStats";
import { AdvancedStats } from "@/components/dashboard/AdvancedStats";
import ScoreProgressionChart from "@/components/dashboard/ScoreProgressionChart";
import { calculateStats, calculateCourseStats } from "@/utils/statsCalculator";

// Sample data for demo
const demoProfile = {
  id: 'demo-user',
  handicap: 8.4,
  first_name: 'Demo',
  last_name: 'Player',
  email: 'demo@mybirdieboard.com',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-07-06T00:00:00Z'
};

const demoRounds = [
  {
    id: 1,
    date: '2024-07-01',
    tee_name: 'Blue Tees',
    tee_id: 'blue-1',
    gross_score: 82,
    net_score: 74,
    to_par_gross: 10,
    to_par_net: 2,
    handicap_at_posting: 8.2,
    hole_scores: [4, 5, 3, 4, 6, 4, 3, 5, 4, 4, 3, 5, 4, 4, 6, 3, 5, 4],
    courses: {
      id: 1,
      name: 'Pebble Beach Golf Links',
      city: 'Pebble Beach',
      state: 'CA',
      clubName: 'Pebble Beach',
      courseName: 'Golf Links'
    }
  },
  {
    id: 2,
    date: '2024-06-28',
    tee_name: 'White Tees',
    tee_id: 'white-1',
    gross_score: 78,
    net_score: 70,
    to_par_gross: 6,
    to_par_net: -2,
    handicap_at_posting: 8.1,
    hole_scores: [4, 4, 3, 5, 5, 4, 3, 4, 4, 3, 4, 4, 4, 5, 5, 3, 4, 4],
    courses: {
      id: 2,
      name: 'Augusta National Golf Club',
      city: 'Augusta',
      state: 'GA',
      clubName: 'Augusta National',
      courseName: 'Golf Club'
    }
  },
  {
    id: 3,
    date: '2024-06-25',
    tee_name: 'Blue Tees',
    tee_id: 'blue-2',
    gross_score: 85,
    net_score: 77,
    to_par_gross: 13,
    to_par_net: 5,
    handicap_at_posting: 8.0,
    hole_scores: [5, 4, 4, 6, 5, 4, 3, 5, 4, 4, 4, 5, 5, 4, 6, 3, 5, 5],
    courses: {
      id: 3,
      name: 'St. Andrews Old Course',
      city: 'St. Andrews',
      state: 'Scotland',
      clubName: 'St. Andrews',
      courseName: 'Old Course'
    }
  },
  {
    id: 4,
    date: '2024-06-20',
    tee_name: 'Championship Tees',
    tee_id: 'champ-1',
    gross_score: 79,
    net_score: 71,
    to_par_gross: 7,
    to_par_net: -1,
    handicap_at_posting: 7.9,
    hole_scores: [4, 4, 3, 4, 5, 4, 4, 5, 4, 3, 4, 4, 4, 5, 5, 3, 4, 4],
    courses: {
      id: 4,
      name: 'Torrey Pines Golf Course',
      city: 'La Jolla',
      state: 'CA',
      clubName: 'Torrey Pines',
      courseName: 'South Course'
    }
  },
  {
    id: 5,
    date: '2024-06-15',
    tee_name: 'Blue Tees',
    tee_id: 'blue-3',
    gross_score: 83,
    net_score: 75,
    to_par_gross: 11,
    to_par_net: 3,
    handicap_at_posting: 7.8,
    hole_scores: [4, 5, 3, 5, 5, 4, 3, 5, 4, 4, 4, 5, 4, 4, 6, 3, 5, 4],
    courses: {
      id: 1,
      name: 'Pebble Beach Golf Links',
      city: 'Pebble Beach',
      state: 'CA',
      clubName: 'Pebble Beach',
      courseName: 'Golf Links'
    }
  }
];

export default function DemoDashboard() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');

  const handleScoreTypeChange = (type: 'gross' | 'net') => {
    setScoreType(type);
  };

  const handicapFromProfile = demoProfile.handicap;

  return (
    <div className="min-h-screen py-4 px-2 sm:py-6 sm:px-4"
      style={{
        backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto max-w-7xl px-2 sm:px-4">
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in">
          {/* Demo Notice */}
          <Alert className="bg-accent/10 border-accent">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                This is a demo dashboard with sample data. 
                <Link to="/" className="ml-2 text-accent hover:underline font-medium">
                  Sign up to create your own golf tracking dashboard!
                </Link>
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </AlertDescription>
          </Alert>

          <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
            <DashboardHeader 
              profileData={demoProfile} 
              onAddRound={() => {}} // No-op for demo
              subscription={null}
              isDemo={true}
            />
          </div>
          
          {!selectedCourseId && (
            <>
              <div className="bg-white/90 rounded-lg shadow-md">
                <MainStats 
                  userRounds={demoRounds}
                  roundsLoading={false}
                  scoreType={scoreType}
                  calculateStats={calculateStats}
                  handicapIndex={handicapFromProfile}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
                  <DetailedStats 
                    userRounds={demoRounds}
                    isLoading={false}
                  />
                </div>
                
                <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center justify-center">
                  <HandicapCircle 
                    userRounds={demoRounds}
                    roundsLoading={false}
                    scoreType={scoreType}
                    onScoreTypeChange={handleScoreTypeChange}
                    calculateStats={calculateStats}
                    handicapIndex={handicapFromProfile}
                    profileHandicap={handicapFromProfile}
                  />
                </div>
              </div>
              
              <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
                <ScoreProgressionChart 
                  rounds={demoRounds}
                  scoreType={scoreType}
                  handicapIndex={handicapFromProfile}
                />
              </div>
              
              <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
                <AdvancedStats 
                  userRounds={demoRounds}
                  isLoading={false}
                />
              </div>
            </>
          )}
          
          <div className="space-y-3 sm:space-y-4 bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
            {selectedCourseId 
              ? <CourseRoundHistory 
                  userRounds={demoRounds} 
                  selectedCourseId={selectedCourseId}
                  onBackClick={() => setSelectedCourseId(null)}
                  handicapIndex={handicapFromProfile}
                  isDemo={true}
                /> 
              : (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold text-primary">Your Courses</h2>
                  <CourseStatsTable 
                    userRounds={demoRounds}
                    scoreType={scoreType}
                    calculateCourseStats={calculateCourseStats}
                    onCourseClick={(courseId) => setSelectedCourseId(courseId)}
                    handicapIndex={handicapFromProfile}
                    isDemo={true}
                  />
                </>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
