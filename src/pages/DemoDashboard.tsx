
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2, Trophy, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CourseStatsTable } from "@/components/dashboard/CourseStatsTable";
import { RoundScorecard } from "@/components/dashboard/scorecard/RoundScorecard";
import { CourseStats, Round } from "@/components/dashboard/types";

// Demo data
const demoRounds: Round[] = [
  {
    id: 1,
    course_id: 1,
    date: "2024-01-15",
    gross_score: 78,
    net_score: 72,
    to_par_gross: 6,
    to_par_net: 0,
    hole_scores: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    handicap_at_posting: 6,
    holes_played: 18,
    tee_id: "blue-tees",
    tee_name: "Blue Tees",
    courses: {
      id: 1,
      name: "Pebble Beach Golf Links",
      city: "Pebble Beach",
      state: "CA"
    }
  },
  {
    id: 2,
    course_id: 2,
    date: "2024-01-10",
    gross_score: 82,
    net_score: 76,
    to_par_gross: 10,
    to_par_net: 4,
    hole_scores: null,
    created_at: "2024-01-10T14:00:00Z",
    updated_at: "2024-01-10T14:00:00Z",
    handicap_at_posting: 6,
    holes_played: 18,
    tee_id: "white-tees",
    tee_name: "White Tees",
    courses: {
      id: 2,
      name: "St. Andrews Old Course",
      city: "St. Andrews",
      state: "Scotland"
    }
  },
  {
    id: 3,
    course_id: 3,
    date: "2024-01-05",
    gross_score: 75,
    net_score: 69,
    to_par_gross: 3,
    to_par_net: -3,
    hole_scores: null,
    created_at: "2024-01-05T09:00:00Z",
    updated_at: "2024-01-05T09:00:00Z",
    handicap_at_posting: 6,
    holes_played: 18,
    tee_id: "blue-tees",
    tee_name: "Blue Tees",
    courses: {
      id: 3,
      name: "Augusta National Golf Club",
      city: "Augusta",
      state: "GA"
    }
  }
];

const DemoDashboard = () => {
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');

  const handicapIndex = 6;

  const calculateCourseStats = (rounds: Round[]): CourseStats[] => {
    const courseMap = new Map<number, CourseStats>();
    
    rounds.forEach(round => {
      const courseId = round.course_id;
      const existing = courseMap.get(courseId);
      
      if (!existing) {
        courseMap.set(courseId, {
          courseId,
          courseName: round.courses?.name || 'Unknown Course',
          clubName: round.courses?.name || 'Unknown Course',
          city: round.courses?.city || '',
          state: round.courses?.state || '',
          roundsPlayed: 1,
          bestGrossScore: round.gross_score,
          bestNetScore: round.net_score || round.gross_score - handicapIndex,
          bestToPar: round.to_par_gross || 0,
          bestToParNet: round.to_par_net || (round.to_par_gross || 0) - handicapIndex
        });
      } else {
        existing.roundsPlayed += 1;
        if (round.gross_score < existing.bestGrossScore) {
          existing.bestGrossScore = round.gross_score;
          existing.bestToPar = round.to_par_gross || 0;
        }
        const netScore = round.net_score || round.gross_score - handicapIndex;
        if (netScore < existing.bestNetScore) {
          existing.bestNetScore = netScore;
          existing.bestToParNet = round.to_par_net || (round.to_par_gross || 0) - handicapIndex;
        }
      }
    });
    
    return Array.from(courseMap.values());
  };

  const handleViewScorecard = (round: Round) => {
    setSelectedRound(round);
    setScorecardOpen(true);
  };

  const handleCourseClick = (courseId: number) => {
    // In demo mode, we don't navigate to individual course pages
    console.log(`Course ${courseId} clicked in demo mode`);
  };

  const bestScore = Math.min(...demoRounds.map(r => scoreType === 'gross' ? r.gross_score : r.net_score || r.gross_score - handicapIndex));
  const avgScore = Math.round(demoRounds.reduce((sum, r) => sum + (scoreType === 'gross' ? r.gross_score : r.net_score || r.gross_score - handicapIndex), 0) / demoRounds.length);
  const totalRounds = demoRounds.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center">
        <p className="text-sm font-medium">
          🎯 Demo Dashboard - Experience MyBirdieBoard's Features
        </p>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Demo Dashboard</h1>
              <p className="text-muted-foreground">Experience MyBirdieBoard's golf tracking features</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={scoreType === 'gross' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScoreType('gross')}
            >
              Gross
            </Button>
            <Button
              variant={scoreType === 'net' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScoreType('net')}
            >
              Net
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalRounds}</p>
            <p className="text-sm text-muted-foreground">Total Rounds</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{bestScore}</p>
            <p className="text-sm text-muted-foreground">Best Score</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{avgScore}</p>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{handicapIndex}</p>
            <p className="text-sm text-muted-foreground">Handicap Index</p>
          </div>
        </div>

        {/* Course Stats Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Course Performance</h2>
          <CourseStatsTable
            userRounds={demoRounds}
            scoreType={scoreType}
            calculateCourseStats={calculateCourseStats}
            onCourseClick={handleCourseClick}
            handicapIndex={handicapIndex}
          />
        </div>

        {/* Recent Rounds */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Rounds</h2>
          <div className="space-y-4">
            {demoRounds.map((round) => (
              <div key={round.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{round.courses?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(round.date).toLocaleDateString()} • {round.tee_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-semibold">
                        {scoreType === 'gross' ? round.gross_score : round.net_score || round.gross_score - handicapIndex}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">To Par</p>
                      <p className="font-semibold">
                        {scoreType === 'gross' 
                          ? (round.to_par_gross > 0 ? '+' : '') + round.to_par_gross
                          : (round.to_par_net !== null && round.to_par_net !== undefined
                              ? (round.to_par_net > 0 ? '+' : '') + round.to_par_net
                              : ((round.to_par_gross || 0) - handicapIndex > 0 ? '+' : '') + ((round.to_par_gross || 0) - handicapIndex))}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewScorecard(round)}
                    >
                      View Scorecard
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-card border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-2">Ready to track your own golf journey?</h3>
          <p className="text-muted-foreground mb-4">
            Start your 7-day free trial and begin improving your game today!
          </p>
          <Link to="/">
            <Button size="lg">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </div>

      {/* Scorecard Modal */}
      {selectedRound && (
        <RoundScorecard
          round={selectedRound}
          isOpen={scorecardOpen}
          onOpenChange={setScorecardOpen}
          handicapIndex={handicapIndex}
          isDemo={true}
        />
      )}
    </div>
  );
};

export default DemoDashboard;
