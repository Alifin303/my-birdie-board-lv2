
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PenLine, ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoundScorecard } from "./scorecard";
import { CourseAdvancedStats } from "./CourseAdvancedStats";
import { ManualCourseForm } from "@/components/ManualCourseForm";
import ScoreProgressionChart from "./ScoreProgressionChart";

interface CourseRoundHistoryProps {
  userRounds: any[];
  selectedCourseId: number;
  onBackClick: () => void;
  handicapIndex: number;
}

export function CourseRoundHistory({
  userRounds,
  selectedCourseId,
  onBackClick,
  handicapIndex
}: CourseRoundHistoryProps) {
  const [courseRounds, setCourseRounds] = useState<any[]>([]);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("rounds");
  const [scoreType, setScoreType] = useState<'gross' | 'net'>('gross');

  // Filter and sort rounds for the selected course
  useEffect(() => {
    if (!userRounds || !userRounds.length) {
      setCourseRounds([]);
      setCourseInfo(null);
      return;
    }

    const filteredRounds = userRounds
      .filter(round => round.course_id === selectedCourseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filteredRounds.length) {
      const firstRound = filteredRounds[0];
      setCourseInfo({
        id: selectedCourseId,
        name: firstRound.courses?.name || "Unknown Course",
        clubName: firstRound.courses?.clubName || "Unknown Club",
        courseName: firstRound.courses?.courseName || "Unknown Course",
        city: firstRound.courses?.city || "",
        state: firstRound.courses?.state || "",
        location: firstRound.courses?.city && firstRound.courses?.state 
          ? `${firstRound.courses.city}, ${firstRound.courses.state}` 
          : firstRound.courses?.city || firstRound.courses?.state || "",
      });
    }

    setCourseRounds(filteredRounds);
  }, [userRounds, selectedCourseId]);

  const handleEditCourse = () => {
    setIsFormOpen(true);
  };

  const handleCourseCreated = (courseId: number, name: string) => {
    console.log("Course updated:", courseId, name);
    // The dashboard will refresh the data when this dialog is closed
  };

  if (!courseRounds.length || !courseInfo) {
    return (
      <div className="text-center">
        <Button variant="ghost" onClick={onBackClick} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to All Courses
        </Button>
        <div className="py-6 text-muted-foreground">
          No rounds found for this course.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBackClick}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to All Courses
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEditCourse}
          className="ml-auto"
        >
          <PenLine className="mr-2 h-4 w-4" /> Edit Course
        </Button>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-primary">
          {courseInfo.clubName}
        </h2>
        <div className="text-muted-foreground">
          {courseInfo.courseName !== courseInfo.clubName && (
            <div>{courseInfo.courseName}</div>
          )}
          {courseInfo.location && <div>{courseInfo.location}</div>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="progression">Progression</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rounds" className="space-y-4 pt-4">
          <div className="space-y-6">
            {courseRounds.map((round) => (
              <RoundScorecard key={round.id} round={round} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="pt-4">
          <CourseAdvancedStats 
            rounds={courseRounds} 
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="progression" className="pt-4">
          <ScoreProgressionChart 
            rounds={courseRounds}
            scoreType={scoreType}
            handicapIndex={handicapIndex}
          />
        </TabsContent>
      </Tabs>

      <ManualCourseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCourseCreated={handleCourseCreated}
        existingCourse={courseInfo}
      />
    </div>
  );
}
