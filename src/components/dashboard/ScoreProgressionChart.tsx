
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Hash, Target, TrendingUp } from "lucide-react";

interface Round {
  id: number;
  date: string;
  gross_score: number;
  net_score?: number;
  to_par_gross: number;
  to_par_net?: number;
  hole_scores?: any;
  holes_played?: number;
  stableford_gross?: number;
  stableford_net?: number;
}

interface ScoreProgressionChartProps {
  rounds: Round[];
  scoreType: 'gross' | 'net';
  handicapIndex?: number;
  scoreMode?: 'stroke' | 'stableford';
  onScoreModeChange?: (mode: 'stroke' | 'stableford') => void;
}

type ScoreMode = 'stroke' | 'stableford';

const ScoreProgressionChart = ({ 
  rounds, 
  scoreType, 
  handicapIndex = 0,
  scoreMode: externalScoreMode,
  onScoreModeChange 
}: ScoreProgressionChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [displayMode, setDisplayMode] = useState<'strokes' | 'to_par'>('strokes');
  const [showParLine, setShowParLine] = useState(false);
  const [holeFilter, setHoleFilter] = useState<'all' | '9' | '18'>('all');
  const [internalScoreMode, setInternalScoreMode] = useState<ScoreMode>('stroke');
  
  // Use external scoreMode if provided, otherwise use internal state
  const scoreMode = externalScoreMode ?? internalScoreMode;
  const handleScoreModeChange = (mode: ScoreMode) => {
    if (onScoreModeChange) {
      onScoreModeChange(mode);
    } else {
      setInternalScoreMode(mode);
    }
  };

  useEffect(() => {
    if (!rounds || rounds.length === 0) return;

    // Filter rounds by hole count
    const filteredRounds = rounds.filter(round => {
      if (holeFilter === 'all') return true;
      if (holeFilter === '9') return round.holes_played === 9;
      if (holeFilter === '18') return round.holes_played === 18;
      return true;
    });

    // Sort rounds by date (oldest to newest)
    const sortedRounds = [...filteredRounds].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Format data for the chart
    const data = sortedRounds.map(round => {
      if (scoreMode === 'stableford') {
        // Stableford mode
        const stablefordScore = scoreType === 'gross' 
          ? round.stableford_gross 
          : round.stableford_net;
        
        return {
          date: format(new Date(round.date), 'MMM d, yyyy'),
          score: stablefordScore ?? 0,
          id: round.id
        };
      } else {
        // Stroke mode (existing logic)
        let score = scoreType === 'gross' ? round.gross_score : round.net_score;
        let toPar = scoreType === 'gross' ? round.to_par_gross : round.to_par_net;
        
        if (scoreType === 'net' && handicapIndex > 0 && !round.net_score) {
          score = Math.max(0, round.gross_score - handicapIndex);
        }
        
        if (scoreType === 'net' && handicapIndex > 0 && !round.to_par_net) {
          toPar = Math.max(-36, round.to_par_gross - handicapIndex);
        }
        
        const actualPar = score ? score - toPar : 72;
        
        return {
          date: format(new Date(round.date), 'MMM d, yyyy'),
          strokes: score,
          to_par: toPar,
          par: displayMode === 'strokes' ? actualPar : 0,
          id: round.id
        };
      }
    });

    setChartData(data);
  }, [rounds, scoreType, handicapIndex, displayMode, holeFilter, scoreMode]);

  if (rounds.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">
          {rounds.length === 0 
            ? "No rounds available." 
            : "At least 2 rounds are needed to display progress."}
        </p>
      </div>
    );
  }

  // Determine the data key and label based on display mode and score mode
  const getDataConfig = () => {
    if (scoreMode === 'stableford') {
      return {
        dataKey: 'score',
        tooltipLabel: 'Stableford Points',
        tooltipFormat: (value: number) => `${value} points`
      };
    }
    return {
      dataKey: displayMode === 'strokes' ? 'strokes' : 'to_par',
      tooltipLabel: displayMode === 'strokes' ? 'Score' : 'To Par',
      tooltipFormat: (value: number) => displayMode === 'strokes' 
        ? `${value} strokes` 
        : value > 0 
          ? `+${value}` 
          : value === 0 
            ? 'Even' 
            : `${value}`
    };
  };

  const { dataKey, tooltipLabel, tooltipFormat } = getDataConfig();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Score Progression Over Time</h3>
        </div>
        
        {/* Score Mode Toggle (Stroke/Stableford) */}
        <div className="flex justify-center">
          <ToggleGroup 
            type="single" 
            value={scoreMode} 
            onValueChange={(value) => value && handleScoreModeChange(value as ScoreMode)}
            className="bg-muted/50 p-1 rounded-lg"
          >
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
        
        <div className="flex justify-between items-center flex-wrap gap-3">
          <ToggleGroup 
            type="single" 
            value={holeFilter} 
            onValueChange={(value) => value && setHoleFilter(value as 'all' | '9' | '18')}
          >
            <ToggleGroupItem value="all" aria-label="All rounds">
              All Rounds
            </ToggleGroupItem>
            <ToggleGroupItem value="9" aria-label="9 hole rounds">
              9 Holes
            </ToggleGroupItem>
            <ToggleGroupItem value="18" aria-label="18 hole rounds">
              18 Holes
            </ToggleGroupItem>
          </ToggleGroup>
          
          {scoreMode === 'stroke' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-par"
                  checked={showParLine}
                  onCheckedChange={setShowParLine}
                />
                <label htmlFor="show-par" className="text-sm font-medium">
                  Show Par Line
                </label>
              </div>
              <ToggleGroup 
                type="single" 
                value={displayMode} 
                onValueChange={(value) => value && setDisplayMode(value as 'strokes' | 'to_par')}
                className="ml-auto"
              >
                <ToggleGroupItem value="strokes" aria-label="Display strokes">
                  <Hash className="h-4 w-4 mr-2" />
                  Strokes
                </ToggleGroupItem>
                <ToggleGroupItem value="to_par" aria-label="Display to par">
                  <Target className="h-4 w-4 mr-2" />
                  To Par
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </div>
      </div>
      <div className="h-80 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              height={35}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={scoreMode === 'stableford' 
                ? ['dataMin - 2', 'dataMax + 2'] 
                : displayMode === 'to_par' 
                  ? ['dataMin - 2', 'dataMax + 2'] 
                  : ['dataMin - 3', 'dataMax + 3']}
              allowDecimals={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'par') {
                  return [displayMode === 'strokes' ? `Par ${value}` : 'Even Par', 'Par'];
                }
                return [tooltipFormat(value as number), tooltipLabel];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={scoreMode === 'stableford' ? '#10B981' : '#6366F1'} 
              strokeWidth={2} 
              activeDot={{ r: 5 }} 
              dot={{ r: 3 }}
              name="score"
            />
            {scoreMode === 'stroke' && showParLine && (
              <Line 
                type="monotone" 
                dataKey="par" 
                stroke="#94A3B8" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                name="par"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreProgressionChart;
