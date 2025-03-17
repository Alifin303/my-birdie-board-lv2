
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

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

const ScoreProgressChart = ({ rounds, scoreType, handicapIndex = 0 }: ScoreProgressChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!rounds || rounds.length === 0) return;

    // Sort rounds by date (oldest to newest)
    const sortedRounds = [...rounds].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Format data for the chart
    const data = sortedRounds.map(round => {
      // Calculate scores with handicap when in net mode
      let score = scoreType === 'gross' ? round.gross_score : round.net_score;
      
      // If we're in net mode and there's no net_score but we have a handicap
      if (scoreType === 'net' && handicapIndex > 0 && !round.net_score) {
        score = Math.max(0, round.gross_score - handicapIndex);
      }
      
      return {
        date: format(new Date(round.date), 'MMM d, yyyy'),
        score: score,
        id: round.id
      };
    });

    setChartData(data);
  }, [rounds, scoreType, handicapIndex]);

  if (rounds.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">
          {rounds.length === 0 
            ? "No rounds available for this course." 
            : "At least 2 rounds are needed to display progress."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <h3 className="text-lg font-medium mb-2">Score Progression Over Time</h3>
      <div className="h-64 mb-2">
        <div className="h-[180px]">
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
                domain={['dataMin - 3', 'dataMax + 3']}
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value) => [`${value} strokes`, 'Score']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366F1" 
                strokeWidth={2} 
                activeDot={{ r: 5 }} 
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ScoreProgressChart;
