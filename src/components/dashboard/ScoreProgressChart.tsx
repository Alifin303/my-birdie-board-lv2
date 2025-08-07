import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Hash, Target } from "lucide-react";
interface Round {
  id: number;
  date: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
}
interface ScoreProgressChartProps {
  rounds: Round[];
  scoreType: 'gross' | 'net';
  handicapIndex?: number;
}
const ScoreProgressChart = ({
  rounds,
  scoreType,
  handicapIndex = 0
}: ScoreProgressChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [displayMode, setDisplayMode] = useState<'strokes' | 'to_par'>('strokes');
  const [showParLine, setShowParLine] = useState(false);
  useEffect(() => {
    if (!rounds || rounds.length === 0) return;

    // Sort rounds by date (oldest to newest)
    const sortedRounds = [...rounds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Format data for the chart
    const data = sortedRounds.map(round => {
      // Calculate scores with handicap when in net mode
      let score = scoreType === 'gross' ? round.gross_score : round.net_score;
      let toPar = scoreType === 'gross' ? round.to_par_gross : round.to_par_net;

      // If we're in net mode and there's no net_score but we have a handicap
      if (scoreType === 'net' && handicapIndex > 0 && !round.net_score) {
        score = Math.max(0, round.gross_score - handicapIndex);
      }

      // If we're in net mode and there's no to_par_net but we have a handicap
      if (scoreType === 'net' && handicapIndex > 0 && !round.to_par_net) {
        toPar = Math.max(-36, round.to_par_gross - handicapIndex);
      }

      // Calculate actual par for this round based on the score and to_par
      const actualPar = score ? score - toPar : 72; // fallback to 72 if we can't calculate

      return {
        date: format(new Date(round.date), 'MMM d, yyyy'),
        strokes: score,
        to_par: toPar,
        par: displayMode === 'strokes' ? actualPar : 0,
        // Use actual par for strokes mode, 0 for to_par mode
        id: round.id
      };
    });
    setChartData(data);
  }, [rounds, scoreType, handicapIndex, displayMode]);
  if (rounds.length < 2) {
    return <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">
          {rounds.length === 0 ? "No rounds available for this course." : "At least 2 rounds are needed to display progress."}
        </p>
      </div>;
  }

  // Determine the data key and label based on display mode
  const dataKey = displayMode === 'strokes' ? 'strokes' : 'to_par';
  const tooltipLabel = displayMode === 'strokes' ? 'Score' : 'To Par';
  const tooltipFormat = (value: number) => displayMode === 'strokes' ? `${value} strokes` : value > 0 ? `+${value}` : value === 0 ? 'Even' : `${value}`;
  return <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-slate-50">Score Progression Over Time</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-transparent">
            <Switch id="show-par" checked={showParLine} onCheckedChange={setShowParLine} />
            <label htmlFor="show-par" className="text-sm font-medium text-slate-50 bg-transparent">Show Par Line</label>
          </div>
          <ToggleGroup type="single" value={displayMode} onValueChange={value => value && setDisplayMode(value as 'strokes' | 'to_par')} className="ml-auto">
            <ToggleGroupItem value="strokes" aria-label="Display strokes">
              <Hash className="h-4 w-4 mr-2" />
              Strokes
            </ToggleGroupItem>
            <ToggleGroupItem value="to_par" aria-label="Display to par" className="text-slate-50">
              <Target className="h-4 w-4 mr-2" />
              To Par
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="h-80 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 25
        }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{
            fontSize: 11
          }} interval="preserveStartEnd" height={35} padding={{
            left: 10,
            right: 10
          }} />
            <YAxis domain={displayMode === 'to_par' ? ['dataMin - 2', 'dataMax + 2'] : ['dataMin - 3', 'dataMax + 3']} allowDecimals={false} tick={{
            fontSize: 11
          }} />
            <Tooltip formatter={(value, name) => {
            if (name === 'par') {
              return [displayMode === 'strokes' ? `Par ${value}` : 'Even Par', 'Par'];
            }
            return [tooltipFormat(value as number), tooltipLabel];
          }} labelFormatter={label => `Date: ${label}`} />
            <Line type="monotone" dataKey={dataKey} stroke="#6366F1" strokeWidth={2} activeDot={{
            r: 5
          }} dot={{
            r: 3
          }} name="score" />
            {showParLine && <Line type="monotone" dataKey="par" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} name="par" />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>;
};
export default ScoreProgressChart;