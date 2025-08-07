import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignUpDialog } from '@/components/SignUpDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ArrowLeft, TrendingUp, Target, Trophy } from 'lucide-react';
import ScoreProgressChart from '@/components/dashboard/ScoreProgressChart';
const Demo = () => {
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  // Demo data
  const demoStats = {
    averageScore: 85.2,
    bestScore: 78,
    handicap: 12.4,
    roundsPlayed: 24
  };
  const demoRounds = [{
    id: '1',
    date: '2024-08-05',
    course_name: 'Pine Valley Golf Club',
    total_score: 82,
    par: 72,
    tee_played: 'White',
    scores: [4, 3, 5, 4, 4, 3, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4]
  }, {
    id: '2',
    date: '2024-08-01',
    course_name: 'Augusta National',
    total_score: 89,
    par: 72,
    tee_played: 'Blue',
    scores: [5, 4, 6, 5, 4, 4, 6, 5, 4, 5, 6, 5, 4, 5, 6, 5, 4, 5]
  }, {
    id: '3',
    date: '2024-07-28',
    course_name: 'Pebble Beach',
    total_score: 78,
    par: 72,
    tee_played: 'White',
    scores: [4, 3, 4, 4, 3, 3, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 3, 4]
  }];
  const demoChartData = [{
    round: 1,
    score: 92
  }, {
    round: 2,
    score: 89
  }, {
    round: 3,
    score: 87
  }, {
    round: 4,
    score: 85
  }, {
    round: 5,
    score: 82
  }, {
    round: 6,
    score: 86
  }, {
    round: 7,
    score: 83
  }, {
    round: 8,
    score: 81
  }, {
    round: 9,
    score: 78
  }, {
    round: 10,
    score: 80
  }];
  return <>
      <Helmet>
        <title>Demo Dashboard - See MyBirdieBoard in Action</title>
        <meta name="description" content="Experience MyBirdieBoard's golf tracking features with our interactive demo. See how easy it is to track scores, analyze performance, and improve your game." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-variant to-secondary">
        <div className="container mx-auto px-4 py-8 bg-zinc-950">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Demo Dashboard</h1>
                <p className="text-white/80">Experience MyBirdieBoard with sample data</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Demo Mode
            </Badge>
          </div>

          {/* CTA Banner */}
          <Card className="mb-8 bg-white/20 border-white/30 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-semibold text-white mb-2">Ready to track your real rounds?</h2>
                  <p className="text-white/90">Start your free trial and begin improving your game today</p>
                </div>
                <Button size="lg" onClick={() => setShowSignupDialog(true)} className="bg-secondary-foreground text-accent-foreground">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/20 border-white/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Average Score</p>
                    <p className="text-2xl font-bold text-white">{demoStats.averageScore}</p>
                    <p className="text-xs text-green-400">-2.3 from last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/20 border-white/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Best Score</p>
                    <p className="text-2xl font-bold text-white">{demoStats.bestScore}</p>
                    <p className="text-xs text-green-400">Personal best!</p>
                  </div>
                  <Trophy className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/20 border-white/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Handicap</p>
                    <p className="text-2xl font-bold text-white">{demoStats.handicap}</p>
                    <p className="text-xs text-green-400">-1.2 this quarter</p>
                  </div>
                  <Target className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/20 border-white/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Rounds Played</p>
                    <p className="text-2xl font-bold text-white">{demoStats.roundsPlayed}</p>
                    <p className="text-xs text-green-400">+8 this month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-white/20 border-white/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Score Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreProgressChart rounds={demoRounds.map((round, index) => ({
                id: parseInt(round.id),
                date: round.date,
                gross_score: round.total_score,
                net_score: round.total_score - 5,
                // Demo net score
                to_par_gross: round.total_score - round.par,
                to_par_net: round.total_score - 5 - round.par
              }))} scoreType="gross" handicapIndex={12.4} />
              </CardContent>
            </Card>

            <Card className="bg-white/20 border-white/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Recent Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoRounds.map(round => <div key={round.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{round.course_name}</p>
                        <p className="text-sm text-white/70">{new Date(round.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{round.total_score}</p>
                        <p className="text-sm text-white/70">
                          {round.total_score - round.par > 0 ? '+' : ''}{round.total_score - round.par}
                        </p>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <Card className="bg-white/20 border-white/30 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Like what you see?</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                This is just a preview of what MyBirdieBoard can do for your game. Start tracking your real rounds 
                and unlock detailed analytics, handicap calculations, and course leaderboards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setShowSignupDialog(true)} className="bg-secondary-foreground text-accent-foreground">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Start Your Free Trial
                </Button>
                <Link to="/faq">
                  <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <SignUpDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} />
    </>;
};
export default Demo;