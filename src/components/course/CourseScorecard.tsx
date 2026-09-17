import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CourseScorecardProps {
  courseName: string;
  holeCount: number;
  coursePar: number | null;
  holePars?: number[] | null;
}

const formatToPar = (difference: number) => difference === 0 ? "E" : difference > 0 ? `+${difference}` : `${difference}`;

interface ScorecardNineProps {
  title: string;
  startIndex: number;
  pars: number[];
  scores: string[];
  updateScore: (index: number, value: string) => void;
}

const ScorecardNine = ({ title, startIndex, pars, scores, updateScore }: ScorecardNineProps) => {
  const sectionScores = scores.slice(startIndex, startIndex + pars.length);
  const totalPar = pars.reduce((total, par) => total + par, 0);
  const totalScore = sectionScores.reduce(
    (total, score) => total + (Number.parseInt(score, 10) || 0),
    0
  );

  return (
    <div>
      <h3 className="mb-2 font-medium text-primary">{title}</h3>
      <div className="overflow-x-auto rounded-md border border-border shadow-sm">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              <th scope="col" className="w-16 px-2 py-2 text-left text-sm font-medium text-primary">
                Hole
              </th>
              {pars.map((_, index) => (
                <th
                  key={`hole-${startIndex + index + 1}`}
                  scope="col"
                  className="px-1 py-2 text-center text-sm font-medium text-primary"
                >
                  {startIndex + index + 1}
                </th>
              ))}
              <th scope="col" className="w-16 px-2 py-2 text-center text-sm font-medium text-primary">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <th scope="row" className="px-2 py-2 text-left text-sm font-medium text-primary">
                Par
              </th>
              {pars.map((par, index) => (
                <td key={`par-${startIndex + index + 1}`} className="px-1 py-2 text-center">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-md border border-secondary/60 bg-secondary/40 font-medium text-primary">
                    {par}
                  </span>
                </td>
              ))}
              <td className="px-2 py-2 text-center font-medium text-primary">{totalPar}</td>
            </tr>
            <tr>
              <th scope="row" className="px-2 py-2 text-left text-sm font-medium text-primary">
                Score
              </th>
              {pars.map((par, index) => {
                const scoreIndex = startIndex + index;
                const score = scores[scoreIndex] ?? "";
                const strokes = Number.parseInt(score, 10);
                const difference = strokes > 0 ? strokes - par : null;

                return (
                  <td key={`score-${scoreIndex + 1}`} className="px-1 py-2 text-center align-top">
                    <Input
                      id={`course-hole-${scoreIndex + 1}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={20}
                      value={score}
                      onChange={(event) => updateScore(scoreIndex, event.target.value)}
                      className="score-input mx-auto h-8 w-10 px-1 text-center"
                      aria-label={`Score for hole ${scoreIndex + 1}`}
                    />
                    {difference !== null && (
                      <span className={`mx-auto mt-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${difference > 0 ? "bg-destructive/10 text-destructive" : difference < 0 ? "bg-success/20 text-success" : "bg-secondary/40 text-primary"}`}>
                        {formatToPar(difference)}
                      </span>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-2 text-center align-top font-medium text-primary">{totalScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CourseScorecard = ({ courseName, holeCount, coursePar, holePars }: CourseScorecardProps) => {
  const [scores, setScores] = useState<string[]>(() => Array(holeCount).fill(""));
  const hasCompletePars = holePars?.length === holeCount && holePars.every((par) => par >= 2 && par <= 6);

  const totalScore = useMemo(
    () => scores.reduce((total, score) => total + (Number.parseInt(score, 10) || 0), 0),
    [scores]
  );
  const hasScore = scores.some((score) => score !== "" && Number.parseInt(score, 10) > 0);
  const scoredHoles = scores.reduce((count, score) => count + (Number.parseInt(score, 10) > 0 ? 1 : 0), 0);
  const runningToPar = hasCompletePars
    ? scores.reduce((total, score, index) => {
        const strokes = Number.parseInt(score, 10);
        return strokes > 0 ? total + strokes - (holePars[index] ?? 0) : total;
      }, 0)
    : null;

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
          {runningToPar !== null && scoredHoles > 0 && (
            <span className={`block text-sm font-medium ${runningToPar > 0 ? "text-destructive" : runningToPar < 0 ? "text-success" : "text-primary"}`}>
              {formatToPar(runningToPar)} through {scoredHoles} {scoredHoles === 1 ? "hole" : "holes"}
            </span>
          )}
        </div>
      </div>

      {hasCompletePars ? (
        <div className="space-y-6">
          <ScorecardNine
            title="Front Nine"
            startIndex={0}
            pars={holePars.slice(0, Math.min(9, holeCount))}
            scores={scores}
            updateScore={updateScore}
          />
          {holeCount > 9 && (
            <ScorecardNine
              title="Back Nine"
              startIndex={9}
              pars={holePars.slice(9, 18)}
              scores={scores}
              updateScore={updateScore}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: holeCount }, (_, index) => (
            <div key={index} className="text-center">
              <label htmlFor={`course-hole-${index + 1}`} className="mb-1 block text-sm font-medium">
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
      )}

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