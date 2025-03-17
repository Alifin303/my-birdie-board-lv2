
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { calculateGIRPercentage } from "@/components/add-round/utils/scoreUtils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface GIRChartProps {
  rounds: any[];
  isLoading: boolean;
}

const GIRChart = ({ rounds, isLoading }: GIRChartProps) => {
  const chartData = useMemo(() => {
    if (!rounds || rounds.length === 0) return [];
    
    // Sort rounds by date (earliest first)
    const sortedRounds = [...rounds].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Prepare data for chart, tracking cumulative GIR percentage over time
    let cumulativeGIRTotal = 0;
    let cumulativeHolesWithGIRData = 0;
    
    return sortedRounds.map((round, index) => {
      let scores;
      try {
        scores = typeof round.hole_scores === 'string' 
          ? JSON.parse(round.hole_scores) 
          : round.hole_scores || [];
      } catch (e) {
        return {
          index: index + 1,
          date: new Date(round.date).toLocaleDateString(),
          girPercentage: 0,
          cumulativeGIRPercentage: 0,
          roundNumber: index + 1,
          hasGIRData: false
        };
      }
      
      const hasGIRData = scores.some((score: any) => score.gir !== undefined);
      
      if (!hasGIRData) {
        return {
          index: index + 1,
          date: new Date(round.date).toLocaleDateString(),
          girPercentage: 0,
          cumulativeGIRPercentage: cumulativeHolesWithGIRData > 0 
            ? Math.round((cumulativeGIRTotal / cumulativeHolesWithGIRData) * 100) 
            : 0,
          roundNumber: index + 1,
          hasGIRData: false
        };
      }
      
      // Calculate this round's GIR percentage
      const { girPercentage, totalGIR, totalHoles } = calculateGIRPercentage(scores);
      
      // Update cumulative values
      cumulativeGIRTotal += totalGIR;
      cumulativeHolesWithGIRData += totalHoles;
      
      // Calculate the cumulative GIR percentage so far
      const cumulativeGIRPercentage = Math.round((cumulativeGIRTotal / cumulativeHolesWithGIRData) * 100);
      
      return {
        index: index + 1,
        date: new Date(round.date).toLocaleDateString(),
        girPercentage,
        cumulativeGIRPercentage,
        roundNumber: index + 1,
        hasGIRData: true
      };
    }).filter(data => data.hasGIRData);
  }, [rounds]);

  const config = {
    roundGIR: {
      label: "Round GIR %",
      theme: {
        light: "#22c55e", // green-500
        dark: "#22c55e"
      }
    },
    cumulativeGIR: {
      label: "Average GIR %",
      theme: {
        light: "#7c3aed", // purple-600
        dark: "#8b5cf6" // purple-500
      }
    }
  };
  
  if (isLoading || !rounds) {
    return (
      <Card className="p-4 h-80 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </Card>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <Card className="p-4 h-80 flex flex-col items-center justify-center text-center">
        <Target className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No GIR Data Available</h3>
        <p className="text-sm text-muted-foreground">
          Start tracking Greens in Regulation in your rounds to see your progress over time.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">GIR Percentage Over Time</h3>
      </div>
      
      <div className="h-[350px] w-full">
        <ChartContainer config={config}>
          <LineChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              tickFormatter={(value, index) => {
                // If there are many rounds, only show some dates
                return chartData.length > 10 && index % Math.ceil(chartData.length / 10) !== 0 
                  ? '' 
                  : value;
              }}
            />
            <YAxis 
              domain={[0, 100]} 
              tickCount={6} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              padding={{ bottom: 0 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  labelFormatter={(label) => `Date: ${label}`}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="girPercentage"
              name="roundGIR"
              stroke="var(--color-roundGIR)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeGIRPercentage"
              name="cumulativeGIR"
              stroke="var(--color-cumulativeGIR)"
              strokeWidth={2.5}
              dot={{ r: 0 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default GIRChart;
