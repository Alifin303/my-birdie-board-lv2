import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, RotateCcw, Trash2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RoundRow = {
  score: number | "";
  par: number | "";
  rating: number | "";
  slope: number | "";
  holes: 9 | 18;
};

const emptyRow = (): RoundRow => ({
  score: "",
  par: 72,
  rating: 72.0,
  slope: 113,
  holes: 18,
});

const buildInitialRounds = (): RoundRow[] =>
  Array.from({ length: 5 }, () => emptyRow());

// WHS table: how many of the best differentials to use based on total rounds (max 20)
const differentialsToUse = (n: number): number => {
  if (n >= 20) return 8;
  if (n >= 19) return 7;
  if (n >= 17) return 6;
  if (n >= 15) return 5;
  if (n >= 12) return 4;
  if (n >= 9) return 3;
  if (n >= 7) return 2;
  if (n >= 5) return 1;
  if (n >= 3) return 1; // with -2 adjustment
  return 0;
};

const adjustmentForRoundCount = (n: number): number => {
  // WHS low-rounds adjustment (applied to the single lowest differential)
  if (n === 3) return -2;
  if (n === 4) return -1;
  if (n === 5) return 0;
  if (n === 6) return -1;
  return 0;
};

const HandicapCalculator = () => {
  const [rounds, setRounds] = useState<RoundRow[]>(buildInitialRounds());

  const updateRound = (
    idx: number,
    field: keyof RoundRow,
    value: string,
  ) => {
    setRounds((prev) => {
      const next = [...prev];
      let parsed: number | "" | 9 | 18;
      if (value === "") parsed = "";
      else if (field === "holes") parsed = Number(value) === 9 ? 9 : 18;
      else parsed = Math.max(0, Number(value));
      next[idx] = { ...next[idx], [field]: parsed as never };
      return next;
    });
  };

  const addRound = () => {
    if (rounds.length >= 20) return;
    setRounds((prev) => [...prev, emptyRow()]);
  };

  const removeRound = (idx: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => setRounds(buildInitialRounds());

  const calc = useMemo(() => {
    // Build list of valid rounds with differential calculated
    const withDiff = rounds
      .map((r, i) => {
        if (
          r.score === "" ||
          r.rating === "" ||
          r.slope === "" ||
          Number(r.score) <= 0 ||
          Number(r.slope) <= 0
        ) {
          return null;
        }
        const score = Number(r.score);
        const rating = Number(r.rating);
        const slope = Number(r.slope);
        // 9-hole: double the score, then use full 18-hole rating
        const adjustedScore = r.holes === 9 ? score * 2 + 1 : score;
        const diff = ((adjustedScore - rating) * 113) / slope;
        return { idx: i, diff: Math.round(diff * 10) / 10 };
      })
      .filter((x): x is { idx: number; diff: number } => x !== null);

    // WHS uses most recent 20 — order doesn't matter for the calc itself,
    // just take all valid (max 20).
    const usable = withDiff.slice(-20);
    const n = usable.length;

    if (n < 3) {
      return {
        roundsValid: n,
        usedCount: 0,
        usedIdxs: [] as number[],
        index: null as number | null,
        averageBest: 0,
        adjustment: 0,
      };
    }

    const sorted = [...usable].sort((a, b) => a.diff - b.diff);
    const useCount = differentialsToUse(n);
    const best = sorted.slice(0, useCount);
    const adjustment = adjustmentForRoundCount(n);

    const avg = best.reduce((s, x) => s + x.diff, 0) / best.length;
    const indexRaw = avg + adjustment;
    const index = Math.max(-10, Math.min(54, Math.round(indexRaw * 10) / 10));

    return {
      roundsValid: n,
      usedCount: useCount,
      usedIdxs: best.map((b) => b.idx),
      index,
      averageBest: Math.round(avg * 10) / 10,
      adjustment,
    };
  }, [rounds]);

  const formatHcp = (h: number) =>
    h < 0 ? `+${Math.abs(h).toFixed(1)}` : h.toFixed(1);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is a golf handicap calculated under the WHS?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "The World Handicap System calculates a Score Differential for each round using (Adjusted Gross Score − Course Rating) × 113 ÷ Slope Rating. Your Handicap Index is then the average of your best 8 differentials from your most recent 20 rounds.",
        },
      },
      {
        "@type": "Question",
        name: "How many rounds do I need for a handicap?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "You need a minimum of 3 scores (54 holes) to establish a Handicap Index. With fewer than 20 rounds the WHS uses a smaller set of best differentials — for example, the best 1 of 3 (minus 2.0), best 1 of 4 (minus 1.0), best 1 of 5, and so on up to the best 8 of 20.",
        },
      },
      {
        "@type": "Question",
        name: "How do I calculate a Score Differential?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Score Differential = (Adjusted Gross Score − Course Rating) × 113 ÷ Slope Rating. The 113 is the standard slope of a course of average difficulty. For a 9-hole round, double the score and add 1 stroke before applying the formula to a full 18-hole course rating.",
        },
      },
      {
        "@type": "Question",
        name: "What is the maximum golf handicap?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Under the WHS, the maximum Handicap Index is 54.0 for both men and women.",
        },
      },
    ],
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to calculate your golf handicap (WHS)",
    step: [
      {
        "@type": "HowToStep",
        name: "Gather your recent rounds",
        text:
          "Collect up to your last 20 rounds with the course rating and slope rating for the tees you played.",
      },
      {
        "@type": "HowToStep",
        name: "Calculate each Score Differential",
        text:
          "For each round, compute (Adjusted Gross Score − Course Rating) × 113 ÷ Slope Rating.",
      },
      {
        "@type": "HowToStep",
        name: "Select your best differentials",
        text:
          "From your most recent 20 rounds, take the lowest 8 differentials (fewer if you have fewer rounds, per the WHS table).",
      },
      {
        "@type": "HowToStep",
        name: "Average them",
        text:
          "Average your best differentials to get your Handicap Index.",
      },
    ],
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Golf Handicap Calculator",
    applicationCategory: "SportsApplication",
    operatingSystem: "Web",
    url: "https://mybirdieboard.com/tools/handicap-calculator",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  };

  return (
    <>
      <SEOHead
        title="Golf Handicap Calculator (Free, WHS) | MyBirdieBoard"
        description="Free WHS golf handicap calculator. Enter your recent rounds with course rating and slope to get your official Handicap Index instantly."
        keywords="golf handicap calculator, handicap calculator golf, how to calculate golf handicap, whs handicap calculator, golf handicap index, free handicap generator"
        lastModified="2026-06-01T00:00:00Z"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
        />
      </SEOHead>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-8">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex items-center text-white/80 hover:text-white mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">
                Golf Handicap Calculator
              </h1>
              <p className="text-lg mt-2 text-white/90 max-w-3xl">
                Calculate your official World Handicap System (WHS) Handicap
                Index. Enter the gross score, course rating and slope rating
                for each of your recent rounds — we'll work out the
                differentials, pick the best ones, and show your index.
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-10 px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Rounds</CardTitle>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add up to 20 of your most recent rounds. You need at least
                  3 to get an index. Course rating and slope are printed on the
                  scorecard for each set of tees.
                </p>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="min-w-[100px]">Score</TableHead>
                        <TableHead className="min-w-[90px]">Par</TableHead>
                        <TableHead className="min-w-[110px]">Rating</TableHead>
                        <TableHead className="min-w-[100px]">Slope</TableHead>
                        <TableHead className="min-w-[80px]">Holes</TableHead>
                        <TableHead className="text-right min-w-[110px]">
                          Differential
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rounds.map((r, i) => {
                        const diffEntry =
                          r.score !== "" &&
                          r.rating !== "" &&
                          r.slope !== "" &&
                          Number(r.slope) > 0
                            ? Math.round(
                                ((((r.holes === 9
                                  ? Number(r.score) * 2 + 1
                                  : Number(r.score)) -
                                  Number(r.rating)) *
                                  113) /
                                  Number(r.slope)) *
                                  10,
                              ) / 10
                            : null;
                        const toPar =
                          r.score !== "" && r.par !== "" && Number(r.par) > 0
                            ? Number(r.score) - Number(r.par)
                            : null;
                        const isUsed = calc.usedIdxs.includes(i);
                        return (
                          <TableRow
                            key={i}
                            className={isUsed ? "bg-accent/10" : ""}
                          >
                            <TableCell className="font-medium">
                              {i + 1}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                max={200}
                                placeholder="92"
                                value={r.score}
                                onChange={(e) =>
                                  updateRound(i, "score", e.target.value)
                                }
                                className="h-9"
                              />
                              {toPar !== null && (
                                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                                  {toPar === 0
                                    ? "level par"
                                    : toPar > 0
                                      ? `+${toPar} to par`
                                      : `${toPar} to par`}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={27}
                                max={80}
                                value={r.par}
                                onChange={(e) =>
                                  updateRound(i, "par", e.target.value)
                                }
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                min={50}
                                max={85}
                                value={r.rating}
                                onChange={(e) =>
                                  updateRound(i, "rating", e.target.value)
                                }
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={55}
                                max={155}
                                value={r.slope}
                                onChange={(e) =>
                                  updateRound(i, "slope", e.target.value)
                                }
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <select
                                value={r.holes}
                                onChange={(e) =>
                                  updateRound(i, "holes", e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                              >
                                <option value={18}>18</option>
                                <option value={9}>9</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {diffEntry === null ? "–" : diffEntry.toFixed(1)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRound(i)}
                                disabled={rounds.length <= 1}
                                aria-label={`Remove round ${i + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Highlighted rows are the rounds used in your index.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRound}
                    disabled={rounds.length >= 20}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Round
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="sm:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Handicap Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-accent">
                    {calc.index === null ? "–" : formatHcp(calc.index)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calc.index === null
                      ? "need at least 3 rounds"
                      : "WHS Handicap Index"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Rounds Entered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{calc.roundsValid}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calc.usedCount > 0
                      ? `using best ${calc.usedCount}`
                      : "add more rounds"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Average of Best
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {calc.averageBest > 0 ? calc.averageBest.toFixed(1) : "–"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calc.adjustment !== 0
                      ? `low-round adj. ${calc.adjustment.toFixed(1)}`
                      : "no adjustment"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="pt-6 text-center space-y-4">
                <h2 className="text-2xl font-semibold">
                  Stop calculating your handicap by hand
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  MyBirdieBoard saves every round you play, automatically
                  updates your WHS handicap index after each one and shows
                  your trend over time — free for your first four rounds.
                </p>
                <Link to="/get-started">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Track Your Rounds Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <article className="prose prose-lg max-w-none">
              <h2>How the WHS Handicap Calculation Works</h2>
              <p>
                The World Handicap System (WHS) was rolled out globally in
                2020 and is now the single standard used by R&amp;A, USGA and
                national federations including England Golf. It uses a simple
                idea: rate each round against the difficulty of the course
                you played, then average your best recent results.
              </p>

              <h3>Step 1 — Score Differential</h3>
              <p>
                Every round gets a <strong>Score Differential</strong>:
              </p>
              <pre>
                <code>
                  Differential = (Adjusted Gross Score − Course Rating) × 113 ÷ Slope Rating
                </code>
              </pre>
              <p>
                113 is the slope of a course of standard difficulty. A higher
                slope (harder course for the bogey golfer) lowers the
                differential — i.e. you get credit for playing a tougher
                course.
              </p>

              <h3>Step 2 — Best differentials</h3>
              <p>
                Your Handicap Index is the average of your best
                differentials from your most recent 20 rounds. With fewer
                rounds, the WHS uses a smaller set:
              </p>
              <ul>
                <li>3 rounds → best 1 (minus 2.0 adjustment)</li>
                <li>4 rounds → best 1 (minus 1.0)</li>
                <li>5 rounds → best 1</li>
                <li>6 rounds → best 2 (minus 1.0)</li>
                <li>7–8 rounds → best 2</li>
                <li>9–11 rounds → best 3</li>
                <li>12–14 rounds → best 4</li>
                <li>15–16 rounds → best 5</li>
                <li>17–18 rounds → best 6</li>
                <li>19 rounds → best 7</li>
                <li>20 rounds → best 8</li>
              </ul>

              <h3>9-hole rounds</h3>
              <p>
                A 9-hole score is scaled up to an 18-hole equivalent by
                doubling the score and adding 1 stroke before calculating
                the differential against the full 18-hole rating.
              </p>

              <h3>Frequently asked questions</h3>
              <h4>Where do I find course rating and slope?</h4>
              <p>
                They're printed on the official scorecard for each set of
                tees, or you can find them on your national federation's
                course rating database (e.g. England Golf, USGA GHIN).
              </p>
              <h4>Why is my handicap different to my club's?</h4>
              <p>
                This tool gives you a true WHS calculation from the rounds
                you enter. Your club handicap may include additional rounds
                you haven't entered here, or apply soft/hard caps from
                previous indexes.
              </p>
              <h4>What is "Adjusted Gross Score"?</h4>
              <p>
                Under the WHS, the maximum you can score on any hole for
                handicap purposes is net double bogey (par + 2 + any
                handicap strokes you receive on that hole). For most
                weekend rounds this only affects disaster holes.
              </p>

              <h3>Related reading</h3>
              <ul>
                <li>
                  <Link to="/guides/golf-handicap-calculator">
                    Golf Handicap Generator: full WHS guide
                  </Link>
                </li>
                <li>
                  <Link to="/blog/how-to-calculate-golf-handicap">
                    How to calculate your golf handicap (beginner-friendly)
                  </Link>
                </li>
                <li>
                  <Link to="/blog/understanding-golf-handicap-system">
                    Understanding the golf handicap system
                  </Link>
                </li>
                <li>
                  <Link to="/tools/stableford-calculator">
                    Stableford Points Calculator
                  </Link>
                </li>
              </ul>
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default HandicapCalculator;
