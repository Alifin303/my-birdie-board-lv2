import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
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
import {
  calculateHoleStableford,
  calculateNetHoleStableford,
} from "@/utils/stablefordCalculator";

const DEFAULT_PARS = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5];
const DEFAULT_SI = [7, 1, 15, 3, 11, 5, 17, 9, 13, 8, 2, 16, 4, 12, 6, 18, 10, 14];

type Row = { par: number; si: number; strokes: number | ""; };

const buildInitialRows = (): Row[] =>
  DEFAULT_PARS.map((par, i) => ({ par, si: DEFAULT_SI[i], strokes: "" }));

const getHandicapStrokesForHole = (si: number, courseHandicap: number) => {
  if (courseHandicap <= 0 || si <= 0) return 0;
  let strokes = si <= courseHandicap ? 1 : 0;
  if (courseHandicap > 18) {
    const extra = courseHandicap - 18;
    if (si <= extra) strokes += 1;
  }
  return strokes;
};

const StablefordCalculator = () => {
  const [rows, setRows] = useState<Row[]>(buildInitialRows());
  const [courseHandicap, setCourseHandicap] = useState<number | "">("");

  const updateRow = (idx: number, field: keyof Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      const num = value === "" ? "" : Math.max(0, Number(value));
      next[idx] = { ...next[idx], [field]: num as number | "" };
      return next;
    });
  };

  const ch = typeof courseHandicap === "number" ? courseHandicap : 0;

  const perHole = useMemo(
    () =>
      rows.map((r) => {
        if (r.strokes === "" || !r.par)
          return { gross: 0, net: 0, hStrokes: 0 };
        const hStrokes = getHandicapStrokesForHole(r.si, ch);
        return {
          gross: calculateHoleStableford(Number(r.strokes), r.par),
          net: ch > 0
            ? calculateNetHoleStableford(Number(r.strokes), r.par, hStrokes)
            : calculateHoleStableford(Number(r.strokes), r.par),
          hStrokes,
        };
      }),
    [rows, ch]
  );

  const totals = useMemo(() => {
    const gross = perHole.reduce((s, p) => s + p.gross, 0);
    const net = perHole.reduce((s, p) => s + p.net, 0);
    const totalStrokes = rows.reduce(
      (s, r) => s + (r.strokes === "" ? 0 : Number(r.strokes)),
      0
    );
    const totalPar = rows.reduce(
      (s, r) => s + (r.strokes === "" ? 0 : r.par),
      0
    );
    return { gross, net, totalStrokes, totalPar };
  }, [perHole, rows]);

  const reset = () => {
    setRows(buildInitialRows());
    setCourseHandicap("");
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How are Stableford points calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Standard Stableford awards points per hole based on your score relative to par: albatross 5, eagle 4, birdie 3, par 2, bogey 1, double bogey or worse 0. Add the per-hole points together to get your round total.",
        },
      },
      {
        "@type": "Question",
        name: "What is a good Stableford score for 18 holes?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "36 points represents level handicap (a net par on every hole). 30–35 is a solid round for most amateurs, 36+ means you played to or better than your handicap, and 40+ is excellent.",
        },
      },
      {
        "@type": "Question",
        name: "How do handicap strokes affect Stableford points?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Your course handicap is distributed across the holes using each hole's stroke index. On holes where you receive a shot, your gross score is reduced by 1 (or more) before points are calculated, which usually increases your net Stableford total.",
        },
      },
    ],
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Stableford Points Calculator",
    applicationCategory: "SportsApplication",
    operatingSystem: "Web",
    url: "https://mybirdieboard.com/tools/stableford-calculator",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  };

  return (
    <>
      <SEOHead
        title="Stableford Points Calculator (Free, 18-Hole) | MyBirdieBoard"
        description="Free Stableford points calculator. Enter strokes for each hole and your course handicap to get gross and net Stableford points instantly."
        keywords="stableford points calculator, stableford calculator, golf stableford, net stableford, how to calculate stableford"
        lastModified="2026-06-01T00:00:00Z"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
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
                Stableford Points Calculator
              </h1>
              <p className="text-lg mt-2 text-white/90 max-w-3xl">
                Enter your strokes for each hole and (optionally) your course
                handicap. We'll calculate your gross and net Stableford points
                instantly using the standard scoring system.
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-10 px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Round</CardTitle>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ch">Course Handicap (optional)</Label>
                    <Input
                      id="ch"
                      type="number"
                      min={0}
                      max={54}
                      placeholder="e.g. 18"
                      value={courseHandicap}
                      onChange={(e) =>
                        setCourseHandicap(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank for gross Stableford only.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Hole</TableHead>
                        <TableHead className="w-20">Par</TableHead>
                        <TableHead className="w-20">SI</TableHead>
                        <TableHead className="w-28">Strokes</TableHead>
                        <TableHead className="w-20 text-right">Gross</TableHead>
                        <TableHead className="w-20 text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{i + 1}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={3}
                              max={6}
                              value={r.par}
                              onChange={(e) =>
                                updateRow(i, "par", e.target.value)
                              }
                              className="h-9"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              max={18}
                              value={r.si}
                              onChange={(e) =>
                                updateRow(i, "si", e.target.value)
                              }
                              className="h-9"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              max={15}
                              placeholder="–"
                              value={r.strokes}
                              onChange={(e) =>
                                updateRow(i, "strokes", e.target.value)
                              }
                              className="h-9"
                            />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {perHole[i].gross}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {perHole[i].net}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Gross Stableford
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{totals.gross}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    points (no handicap)
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Net Stableford
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-accent">
                    {totals.net}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ch > 0 ? `using handicap ${ch}` : "enter a handicap above"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Total Strokes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {totals.totalStrokes || "–"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totals.totalPar > 0
                      ? `vs par ${totals.totalPar}`
                      : "fill in some holes"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="pt-6 text-center space-y-4">
                <h2 className="text-2xl font-semibold">
                  Stop calculating by hand
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  MyBirdieBoard saves every round, tracks your handicap
                  automatically and shows your Stableford history over time.
                </p>
                <Link to="/get-started">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Track Your Rounds Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <article className="prose prose-lg max-w-none">
              <h2>How Stableford Scoring Works</h2>
              <p>
                Stableford is a points-based golf scoring system designed to
                keep rounds enjoyable — a disaster hole costs you nothing more
                than zero points, so you can pick up and move on. The higher
                your total, the better.
              </p>
              <h3>Standard Stableford points per hole</h3>
              <ul>
                <li><strong>Albatross</strong> (3 under par) – 5 points</li>
                <li><strong>Eagle</strong> (2 under par) – 4 points</li>
                <li><strong>Birdie</strong> (1 under par) – 3 points</li>
                <li><strong>Par</strong> – 2 points</li>
                <li><strong>Bogey</strong> (1 over par) – 1 point</li>
                <li><strong>Double bogey or worse</strong> – 0 points</li>
              </ul>

              <h3>Gross vs Net Stableford</h3>
              <p>
                <strong>Gross</strong> Stableford uses your raw score on each
                hole. <strong>Net</strong> Stableford applies your course
                handicap first — strokes are distributed across the holes using
                each hole's stroke index (SI 1 is the hardest). On a hole where
                you receive a shot, your gross score is reduced by 1 before
                points are calculated.
              </p>

              <h3>What's a good Stableford score?</h3>
              <p>
                36 points = level handicap, i.e. a net par on every hole. Most
                club competitions are won with somewhere between 36 and 42
                points. Anything above 40 is a very good round.
              </p>

              <h3>Frequently asked questions</h3>
              <h4>Do I have to play 18 holes?</h4>
              <p>
                No — leave holes blank in the calculator above and you'll get
                your running points total for the holes you have played.
              </p>
              <h4>Why is my net score sometimes lower than gross?</h4>
              <p>
                If you've already scored well on a hole (say a birdie), receiving
                an extra handicap stroke can't add more than the 5-point cap, and
                strokes never reduce points. Net will always be ≥ gross when a
                handicap is entered correctly.
              </p>

              <h3>Related reading</h3>
              <ul>
                <li>
                  <Link to="/blog/stableford-scoring">
                    Stableford Scoring Explained
                  </Link>
                </li>
                <li>
                  <Link to="/blog/golf-scoring-terms">
                    Golf Scoring Terms Glossary
                  </Link>
                </li>
                <li>
                  <Link to="/guides/golf-handicap-calculator">
                    Golf Handicap Calculator
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

export default StablefordCalculator;
