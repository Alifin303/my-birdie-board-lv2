import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CourseScorecardProps {
  courseName: string;
  holeCount: number;
  coursePar: number | null;
}

export const CourseScorecard = ({ courseName, holeCount, coursePar }: CourseScorecardProps) => {
  const [scores, setScores] = useState<string[]>(() => Array(holeCount).fill(""));

  const totalScore = useMemo(
    () => scores.reduce((total, score) => total + (Number.parseInt(score, 10) || 0), 0),
    [scores]
  );
  const hasScore = scores.some((score) => score !== "" && Number.parseInt(score, 10) > 0);

  const updateScore = (index: number, value: string) => {
    const nextValue = value === "" ? "" : String(Math.min(20, Math.max(1, Number.parseInt(value, 10) || 1)));
    setScores((current) => current.map((score, scoreIndex) => scoreIndex === index ? nextValue : score));
  };

  return (
    <section className="mb-10 border-y border-border py-8" aria-labelledby="course-scorecard-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2 id="course-scorecard-heading" className="text-2xl font-semibold mb-1">
            Try the {courseName} scorecard
          </h2>
          <p className="text-muted-foreground">
            Enter your strokes for each of the {holeCount} holes{coursePar ? ` on this par ${coursePar} course` : ""}.
          </p>
        </div>
        <div className="text-right" aria-live="polite">
          <span className="block text-sm text-muted-foreground">Total score</span>
          <strong className="text-3xl text-foreground">{totalScore}</strong>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: holeCount }, (_, index) => (
          <div key={index} className="text-center">
            <label htmlFor={`course-hole-${index + 1}`} className="block text-sm font-medium mb-1">
              Hole {index + 1}
            </label>
            <Input
              id={`course-hole-${index + 1}`}
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={scores[index] ?? ""}
              onChange={(event) => updateScore(index, event.target.value)}
              className="score-input text-center"
              aria-label={`Score for hole ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {hasScore && (
        <div className="mt-6 bg-secondary p-5 rounded-lg text-center">
          <p className="font-medium text-secondary-foreground mb-3">
            Want to save this round and track your progress?
          </p>
          <Button asChild>
            <Link to="/get-started">Sign up free</Link>
          </Button>
        </div>
      )}
    </section>
  );
};