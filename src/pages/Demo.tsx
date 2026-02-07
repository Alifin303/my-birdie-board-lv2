import React, { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignUpDialog } from '@/components/SignUpDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ArrowLeft, CalendarDays, Trophy, Flag, TrendingUp, Hash } from 'lucide-react';
import ScoreProgressionChart from '@/components/dashboard/ScoreProgressionChart';
import { DetailedStats } from '@/components/dashboard/DetailedStats';
import { AdvancedStats } from '@/components/dashboard/AdvancedStats';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
const Demo = () => {
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');
  const [scoreMode, setScoreMode] = useState<'stroke' | 'stableford'>('stroke');
  const [roundFilter, setRoundFilter] = useState<'all' | '9hole' | '18hole'>('all');

  // Demo profile data
  const demoProfile = {
    first_name: 'Demo',
    last_name: 'Golfer',
    handicap: 12.4
  };

  // Demo rounds data matching the real Round interface
  // hole_scores must be an array of objects for AdvancedStats compatibility
  const demoRounds = [{
    id: 1,
    date: '2024-08-05',
    tee_name: 'White',
    gross_score: 82,
    net_score: 70,
    to_par_gross: 10,
    to_par_net: -2,
    holes_played: 18,
    stableford_gross: 32,
    stableford_net: 38,
    hole_scores: null,
    // No advanced stats in demo
    courses: {
      id: 1,
      name: 'Pine Valley Golf Club',
      city: 'Pine Valley',
      state: 'NJ',
      clubName: 'Pine Valley Golf Club',
      courseName: 'Championship Course'
    }
  }, {
    id: 2,
    date: '2024-08-01',
    tee_name: 'Blue',
    gross_score: 89,
    net_score: 77,
    to_par_gross: 17,
    to_par_net: 5,
    holes_played: 18,
    stableford_gross: 26,
    stableford_net: 33,
    hole_scores: null,
    courses: {
      id: 2,
      name: 'Augusta National Golf Club',
      city: 'Augusta',
      state: 'GA',
      clubName: 'Augusta National',
      courseName: 'Championship Course'
    }
  }, {
    id: 3,
    date: '2024-07-28',
    tee_name: 'White',
    gross_score: 78,
    net_score: 66,
    to_par_gross: 6,
    to_par_net: -6,
    holes_played: 18,
    stableford_gross: 36,
    stableford_net: 42,
    hole_scores: null,
    courses: {
      id: 3,
      name: 'Pebble Beach Golf Links',
      city: 'Pebble Beach',
      state: 'CA',
      clubName: 'Pebble Beach',
      courseName: 'Links Course'
    }
  }, {
    id: 4,
    date: '2024-07-20',
    tee_name: 'White',
    gross_score: 85,
    net_score: 73,
    to_par_gross: 13,
    to_par_net: 1,
    holes_played: 18,
    stableford_gross: 29,
    stableford_net: 35,
    hole_scores: null,
    courses: {
      id: 4,
      name: 'St Andrews Old Course',
      city: 'St Andrews',
      state: 'Scotland',
      clubName: 'St Andrews',
      courseName: 'Old Course'
    }
  }, {
    id: 5,
    date: '2024-07-15',
    tee_name: 'Blue',
    gross_score: 91,
    net_score: 79,
    to_par_gross: 19,
    to_par_net: 7,
    holes_played: 18,
    stableford_gross: 24,
    stableford_net: 31,
    hole_scores: null,
    courses: {
      id: 1,
      name: 'Pine Valley Golf Club',
      city: 'Pine Valley',
      state: 'NJ',
      clubName: 'Pine Valley Golf Club',
      courseName: 'Championship Course'
    }
  }];

  // Calculate demo stats
  const totalRounds = demoRounds.length;
  const bestGrossScore = Math.min(...demoRounds.map(r => r.gross_score));
  const bestNetScore = Math.min(...demoRounds.map(r => r.net_score));
  const bestToPar = Math.min(...demoRounds.map(r => r.to_par_gross));
  const bestToParNet = Math.min(...demoRounds.map(r => r.to_par_net));
  const bestStablefordGross = Math.max(...demoRounds.map(r => r.stableford_gross));
  const bestStablefordNet = Math.max(...demoRounds.map(r => r.stableford_net));
  const avgStablefordGross = Math.round(demoRounds.reduce((a, b) => a + b.stableford_gross, 0) / totalRounds);
  const avgStablefordNet = Math.round(demoRounds.reduce((a, b) => a + b.stableford_net, 0) / totalRounds);
  const isStablefordMode = scoreMode === 'stableford';
  const getDisplayValues = () => {
    if (isStablefordMode) {
      return {
        mainLabel: 'Best Stableford',
        mainValue: scoreType === 'gross' ? bestStablefordGross : bestStablefordNet,
        secondLabel: 'Avg Stableford',
        secondValue: scoreType === 'gross' ? avgStablefordGross : avgStablefordNet
      };
    }
    return {
      mainLabel: 'Best Score',
      mainValue: scoreType === 'gross' ? bestGrossScore : bestNetScore,
      secondLabel: 'Best to Par',
      secondValue: scoreType === 'gross' ? (bestToPar > 0 ? '+' : '') + bestToPar : (bestToParNet > 0 ? '+' : '') + bestToParNet
    };
  };
  const displayValues = getDisplayValues();

  // Get unique courses for the course stats table
  const courseStats = demoRounds.reduce((acc, round) => {
    const courseId = round.courses.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: round.courses,
        rounds: [],
        bestScore: round.gross_score,
        avgScore: 0
      };
    }
    acc[courseId].rounds.push(round);
    if (round.gross_score < acc[courseId].bestScore) {
      acc[courseId].bestScore = round.gross_score;
    }
    return acc;
  }, {} as Record<number, any>);
  Object.values(courseStats).forEach((stat: any) => {
    stat.avgScore = Math.round(stat.rounds.reduce((a: number, b: any) => a + b.gross_score, 0) / stat.rounds.length * 10) / 10;
  });
  return <>
      <SEOHead
        title="Demo Dashboard - See MyBirdieBoard in Action"
        description="Experience MyBirdieBoard's golf tracking features with our interactive demo. See how easy it is to track scores, analyze performance, and improve your game."
      />

      <div className="min-h-screen py-4 px-2 sm:py-6 sm:px-4" style={{
      backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
        <div className="container mx-auto max-w-7xl px-2 sm:px-4">
          <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in">
            
            {/* Demo Header with CTA */}
            <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-4">
                  <Link to="/">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <img src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" alt="BirdieBoard Logo" className="h-10 sm:h-12 w-auto object-contain brightness-[0.85] contrast-[1.15]" width="48" height="48" loading="eager" decoding="async" />
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                    Welcome, {demoProfile.first_name}!
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-accent text-accent-foreground text-sm px-3 py-1">
                    Demo Mode
                  </Badge>
                  <Button onClick={() => setShowSignupDialog(true)} className="bg-primary hover:bg-primary/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Stats */}
            <div className="bg-white/90 rounded-lg shadow-md">
              <div className="space-y-4 p-4 sm:p-6">
                {/* Score Type & Mode Toggles */}
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setScoreType('gross')} className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      Gross
                    </button>
                    <button onClick={() => setScoreType('net')} className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'net' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      Net
                    </button>
                  </div>
                  
                  <ToggleGroup type="single" value={scoreMode} onValueChange={value => value && setScoreMode(value as 'stroke' | 'stableford')} className="bg-muted/50 p-1 rounded-lg">
                    <ToggleGroupItem value="stroke" aria-label="Stroke play" className="px-4">
                      <Hash className="h-4 w-4 mr-2" />
                      Stroke
                    </ToggleGroupItem>
                    <ToggleGroupItem value="stableford" aria-label="Stableford" className="px-4">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Stableford
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                {/* Round Filter Toggle */}
                <div className="flex justify-center">
                  <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                    <Button variant={roundFilter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setRoundFilter('all')} className="h-8 px-3 text-xs">
                      All Rounds
                    </Button>
                    <Button variant={roundFilter === '9hole' ? 'default' : 'ghost'} size="sm" onClick={() => setRoundFilter('9hole')} className="h-8 px-3 text-xs">
                      9 Hole
                    </Button>
                    <Button variant={roundFilter === '18hole' ? 'default' : 'ghost'} size="sm" onClick={() => setRoundFilter('18hole')} className="h-8 px-3 text-xs">
                      18 Hole
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 pr-2">
                        <p className="text-sm font-medium text-muted-foreground">Rounds Played</p>
                        <p className="text-2xl sm:text-3xl font-bold truncate">{totalRounds}</p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
                        <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 pr-2">
                        <p className="text-sm font-medium text-muted-foreground">{displayValues.mainLabel}</p>
                        <p className="text-2xl sm:text-3xl font-bold truncate">{displayValues.mainValue}</p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
                        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 pr-2">
                        <p className="text-sm font-medium text-muted-foreground">{displayValues.secondLabel}</p>
                        <p className="text-2xl sm:text-3xl font-bold truncate">{displayValues.secondValue}</p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary/10">
                        {isStablefordMode ? <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> : <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats & Handicap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
                <DetailedStats userRounds={demoRounds} isLoading={false} />
              </div>
              
              <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="relative mb-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setScoreType('gross')} className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'gross' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        Gross
                      </button>
                      <button onClick={() => setScoreType('net')} className={`px-3 py-1 rounded-full text-sm font-medium ${scoreType === 'net' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        Net
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-60 h-60 rounded-full border-8 border-primary flex items-center justify-center">
                    <div className="text-center px-6">
                      <p className="text-sm font-medium text-muted-foreground">Handicap Index</p>
                      <p className="text-5xl font-bold my-2">{demoProfile.handicap}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Progression Chart */}
            <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
              <ScoreProgressionChart rounds={demoRounds} scoreType={scoreType} onScoreTypeChange={setScoreType} handicapIndex={demoProfile.handicap} scoreMode={scoreMode} onScoreModeChange={setScoreMode} />
            </div>

            {/* Advanced Stats */}
            <div className="bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
              <AdvancedStats userRounds={demoRounds} isLoading={false} />
            </div>

            {/* Course Stats Table */}
            <div className="space-y-3 sm:space-y-4 bg-white/90 rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary">Your Courses</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Rounds</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Best</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(courseStats).map((stat: any) => <tr key={stat.course.id} className="border-b hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{stat.course.clubName}</p>
                            <p className="text-sm text-muted-foreground">{stat.course.city}, {stat.course.state}</p>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{stat.rounds.length}</td>
                        <td className="text-center py-3 px-4 font-semibold">{stat.bestScore}</td>
                        <td className="text-center py-3 px-4">{stat.avgScore}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg border border-white/20 p-6 sm:p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-white">Ready to Track Your Own Rounds?</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                This is just a preview of what MyBirdieBoard can do for your game. Start tracking your real rounds 
                and unlock detailed analytics, handicap calculations, Stableford scoring, and course leaderboards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setShowSignupDialog(true)} className="bg-white text-primary hover:bg-white/90">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Start Your Free Trial
                </Button>
                <Link to="/faq">
                  <Button size="lg" variant="outline" className="border-white text-white bg-ring">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SignUpDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} />
    </>;
};
export default Demo;