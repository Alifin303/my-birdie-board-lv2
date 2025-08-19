
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Circle, Target, AlertCircle, TrendingUp } from "lucide-react";
import { calculateGIRPercentage } from "@/components/add-round/utils/scoreUtils";

interface DataPoint {
  date: string;
  value: number;
  id: number | string;
}

interface StatsLineChartProps {
  roundsData: any[];
  isLoading: boolean;
}

export const StatsLineChart = ({ roundsData, isLoading }: StatsLineChartProps) => {
  const [selectedStat, setSelectedStat] = useState<"putts" | "gir" | "penalties">("putts");
  const [showScore, setShowScore] = useState(false);
  
  // Format date for display in chart
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  // Process rounds data for chart
  const processChartData = () => {
    if (!roundsData || roundsData.length === 0) return [];
    
    // Sort rounds by date (oldest to newest)
    const sortedRounds = [...roundsData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedRounds.map(round => {
      let scores;
      try {
        scores = typeof round.hole_scores === 'string' 
          ? JSON.parse(round.hole_scores) 
          : round.hole_scores || [];
      } catch (e) {
        scores = [];
      }
      
      let puttsValue = 0;
      let puttHoles = 0;
      let penaltiesValue = 0;
      let totalScore = 0;
      
      // For GIR calculation, use the utility function that calculates consistently
      const { girPercentage } = calculateGIRPercentage(scores);
      
      // Calculate total score and count putts/penalties from played holes
      scores.forEach((score: any) => {
        // Only include if the hole was actually played
        if (score.strokes === undefined || score.strokes <= 0) return;
        
        // Add to total score
        totalScore += score.strokes;
        
        // Count putts
        if (score.putts !== undefined) {
          puttsValue += score.putts;
          puttHoles++;
        }
        
        // Count penalties
        if (score.penalties !== undefined) {
          penaltiesValue += score.penalties;
        }
      });
      
      // Log the processed data for debugging
      console.log(`Chart data for round ${round.id}:`, {
        date: formatDate(round.date),
        girPercentage,
        puttsValue,
        puttHoles,
        penaltiesValue,
        totalScore,
        roundTotalScore: round.total_score
      });
      
      return {
        date: formatDate(round.date),
        rawDate: round.date,
        putts: puttHoles > 0 ? puttsValue : null,
        gir: girPercentage,
        penalties: penaltiesValue,
        score: totalScore || round.total_score || 0,
        id: round.id
      };
    }).filter(item => {
      // Only include rounds that have data for the selected stat
      if (selectedStat === "putts") return item.putts !== null;
      if (selectedStat === "gir") return item.gir !== null;
      if (selectedStat === "penalties") return true; // Always show penalties (0 is valid)
      return false;
    });
  };
  
  const chartData = processChartData();
  
  // Define chart properties based on selected stat
  const getChartProps = () => {
    switch (selectedStat) {
      case "putts":
        return {
          label: "Putts per Round",
          dataKey: "putts",
          color: "#8884d8",
          yAxisLabel: "Total Putts",
          valueFormatter: (value: number) => `${value} putts`,
          emptyMessage: "No putting data available."
        };
      case "gir":
        return {
          label: "Greens in Regulation %",
          dataKey: "gir",
          color: "#82ca9d",
          yAxisLabel: "GIR %",
          valueFormatter: (value: number) => `${value}%`,
          emptyMessage: "No GIR data available."
        };
      case "penalties":
        return {
          label: "Penalties per Round",
          dataKey: "penalties",
          color: "#ff7300",
          yAxisLabel: "Penalties",
          valueFormatter: (value: number) => `${value} penalties`,
          emptyMessage: "No penalty data available."
        };
      default:
        return {
          label: "",
          dataKey: "",
          color: "#000",
          yAxisLabel: "",
          valueFormatter: (value: number) => `${value}`,
          emptyMessage: "No data available."
        };
    }
  };
  
  const chartProps = getChartProps();
  
  if (isLoading) {
    return (
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }
  
  if (chartData.length < 2) {
    return (
      <Card className="p-4 mt-4">
        <div className="flex flex-col space-y-2">
        <div className="flex flex-col gap-3">
          <ToggleGroup type="single" value={selectedStat} onValueChange={(value) => value && setSelectedStat(value as any)}>
            <ToggleGroupItem value="putts" aria-label="Toggle putts chart">
              <Circle className="h-4 w-4 mr-2" />
              Putting
            </ToggleGroupItem>
            <ToggleGroupItem value="gir" aria-label="Toggle GIR chart">
              <Target className="h-4 w-4 mr-2" />
              GIR %
            </ToggleGroupItem>
            <ToggleGroupItem value="penalties" aria-label="Toggle penalties chart">
              <AlertCircle className="h-4 w-4 mr-2" />
              Penalties
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-score"
              checked={showScore}
              onCheckedChange={setShowScore}
            />
            <Label htmlFor="show-score" className="text-sm flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Compare with Score
            </Label>
          </div>
        </div>
          
          <div className="flex items-center justify-center h-[260px] bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-center p-4">
              {chartData.length === 0 
                ? chartProps.emptyMessage
                : "At least 2 rounds with data are needed to display progress."}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 mt-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col gap-3">
          <ToggleGroup type="single" value={selectedStat} onValueChange={(value) => value && setSelectedStat(value as any)}>
            <ToggleGroupItem value="putts" aria-label="Toggle putts chart">
              <Circle className="h-4 w-4 mr-2" />
              Putting
            </ToggleGroupItem>
            <ToggleGroupItem value="gir" aria-label="Toggle GIR chart">
              <Target className="h-4 w-4 mr-2" />
              GIR %
            </ToggleGroupItem>
            <ToggleGroupItem value="penalties" aria-label="Toggle penalties chart">
              <AlertCircle className="h-4 w-4 mr-2" />
              Penalties
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-score"
              checked={showScore}
              onCheckedChange={setShowScore}
            />
            <Label htmlFor="show-score" className="text-sm flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Compare with Score
            </Label>
          </div>
        </div>
        
        <div className="h-80">
          <h3 className="text-sm font-medium mb-1">
            {chartProps.label} Over Time {showScore && "vs Round Score"}
          </h3>
          <div className="h-[280px]">
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
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  label={{ 
                    value: chartProps.yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 11 }
                  }}
                  domain={selectedStat === "gir" ? [0, 100] : ['auto', 'auto']}
                />
                {showScore && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    label={{ 
                      value: "Score", 
                      angle: 90, 
                      position: 'insideRight',
                      style: { textAnchor: 'middle', fontSize: 11 }
                    }}
                  />
                )}
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "score") return [`${value}`, "Round Score"];
                    return [chartProps.valueFormatter(value as number), chartProps.label];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey={chartProps.dataKey} 
                  stroke={chartProps.color} 
                  strokeWidth={2} 
                  activeDot={{ r: 5 }} 
                  dot={{ r: 3 }}
                  name={chartProps.dataKey}
                />
                {showScore && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    activeDot={{ r: 5 }} 
                    dot={{ r: 3 }}
                    name="score"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};
