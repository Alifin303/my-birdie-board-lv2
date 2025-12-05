import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Achievement, 
  calculateAchievements, 
  getAchievementStats 
} from '@/utils/achievementsCalculator';
import { Trophy, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface Round {
  id: number;
  gross_score: number;
  holes_played?: number;
  course_id?: number;
  date: string;
  hole_scores?: string | any[];
  courses?: { id: number; name: string };
}

interface AchievementBadgesProps {
  rounds: Round[];
}

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  return (
    <div
      className={`relative p-4 rounded-lg border transition-all ${
        achievement.unlocked
          ? 'bg-primary/10 border-primary/30 shadow-sm'
          : 'bg-muted/30 border-muted opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`text-3xl ${
            achievement.unlocked ? '' : 'grayscale opacity-50'
          }`}
        >
          {achievement.unlocked ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${
            achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {achievement.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {achievement.description}
          </p>
          {achievement.unlocked && achievement.unlockedDate && (
            <p className="text-xs text-primary mt-1">
              Unlocked {format(new Date(achievement.unlockedDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        {achievement.unlocked && (
          <Badge variant="default" className="shrink-0 text-xs">
            Unlocked
          </Badge>
        )}
      </div>
    </div>
  );
};

export const AchievementBadges = ({ rounds }: AchievementBadgesProps) => {
  const achievements = calculateAchievements(rounds);
  const stats = getAchievementStats(achievements);
  
  const categories = {
    scoring: achievements.filter(a => a.category === 'scoring'),
    milestones: achievements.filter(a => a.category === 'milestones'),
    courses: achievements.filter(a => a.category === 'courses'),
    consistency: achievements.filter(a => a.category === 'consistency'),
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {stats.unlocked}/{stats.total}
          </Badge>
        </div>
        <div className="space-y-1">
          <Progress value={stats.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.percentage}% complete
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unlocked" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="unlocked" className="text-xs">
              Unlocked ({unlockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-xs">Scoring</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">Milestones</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs">Courses</TabsTrigger>
            <TabsTrigger value="consistency" className="text-xs">Rounds</TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked" className="mt-0">
            {unlockedAchievements.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {unlockedAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No achievements unlocked yet</p>
                <p className="text-sm">Keep playing to earn your first badge!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scoring" className="mt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.scoring.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="mt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.milestones.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.courses.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consistency" className="mt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.consistency.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
