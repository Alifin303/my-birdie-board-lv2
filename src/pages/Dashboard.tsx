
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Activity, Award, TrendingDown, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const Dashboard = () => {
  // This would come from your backend in a real application
  const stats = {
    roundsPlayed: 24,
    bestGrossScore: 72,
    bestNetScore: 65,
    bestToPar: -2,
    handicap: 8.4
  };

  // Initial courses data
  const initialCourses = [
    { id: 1, name: "Pine Valley Golf Club", roundsPlayed: 8, bestGrossScore: 75, bestNetScore: 68, bestToPar: 3, bestToParNet: -4, bestToParGross: 3 },
    { id: 2, name: "Augusta National Golf Club", roundsPlayed: 6, bestGrossScore: 78, bestNetScore: 71, bestToPar: 6, bestToParNet: -1, bestToParGross: 6 },
    { id: 3, name: "St Andrews Links", roundsPlayed: 10, bestGrossScore: 72, bestNetScore: 65, bestToPar: -2, bestToParNet: -7, bestToParGross: -2 },
  ];

  // State for courses and sorting
  const [courses, setCourses] = useState(initialCourses);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  // State for view mode: "gross" or "net"
  const [viewMode, setViewMode] = useState<"gross" | "net">("gross");

  // Sorting function
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedCourses = [...courses].sort((a, b) => {
      if (a[key as keyof typeof a] < b[key as keyof typeof b]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key as keyof typeof a] > b[key as keyof typeof b]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setCourses(sortedCourses);
  };

  // Get sort direction icon
  const getSortDirectionIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Helper function to format par scores
  const formatParScore = (score: number | undefined): string => {
    if (score === undefined || score === null) return "N/A";
    return score <= 0 ? score.toString() : `+${score}`;
  };

  // Toggle view mode between gross and net
  const toggleViewMode = () => {
    setViewMode(viewMode === "gross" ? "net" : "gross");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Welcome back, Golfer!</h1>
      
      {/* Stats Section with Handicap Circle and Stats Grid */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Main Stats Grid in 2x2 formation */}
        <div className="flex-grow grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rounds Played</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.roundsPlayed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Gross Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestGrossScore}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Net Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestNetScore}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best To Par</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.bestToPar <= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatParScore(stats.bestToPar)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Handicap Circle */}
        <div className="flex items-center justify-center md:w-48">
          <div className="flex flex-col items-center justify-center rounded-full bg-primary w-36 h-36 shadow-lg">
            <span className="text-sm text-white font-medium mb-1">Handicap</span>
            <span className="text-4xl text-white font-bold">{stats.handicap}</span>
          </div>
        </div>
      </div>

      {/* Add New Round Button */}
      <div className="mb-8">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add a new round
        </Button>
      </div>

      {/* Table Controls with Toggle Button */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleViewMode}
          className="text-xs"
        >
          Show {viewMode === "gross" ? "Net" : "Gross"} Scores
        </Button>
      </div>

      {/* Courses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                <div className="flex items-center">
                  Course Name
                  {getSortDirectionIcon('name')}
                </div>
              </TableHead>
              <TableHead onClick={() => requestSort('roundsPlayed')} className="text-right cursor-pointer">
                <div className="flex items-center justify-end">
                  Rounds Played
                  {getSortDirectionIcon('roundsPlayed')}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => requestSort(viewMode === "gross" ? 'bestGrossScore' : 'bestNetScore')} 
                className="text-right cursor-pointer"
              >
                <div className="flex items-center justify-end">
                  Best {viewMode === "gross" ? "Gross" : "Net"}
                  {getSortDirectionIcon(viewMode === "gross" ? 'bestGrossScore' : 'bestNetScore')}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => requestSort(viewMode === "gross" ? 'bestToParGross' : 'bestToParNet')} 
                className="text-right cursor-pointer"
              >
                <div className="flex items-center justify-end">
                  To Par ({viewMode === "gross" ? "Gross" : "Net"})
                  {getSortDirectionIcon(viewMode === "gross" ? 'bestToParGross' : 'bestToParNet')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell className="text-right">{course.roundsPlayed}</TableCell>
                <TableCell className="text-right">
                  {viewMode === "gross" ? course.bestGrossScore : course.bestNetScore}
                </TableCell>
                <TableCell 
                  className={`text-right ${
                    (viewMode === "gross" ? course.bestToParGross : course.bestToParNet) <= 0 
                    ? "text-green-500" 
                    : "text-red-500"
                  }`}
                >
                  {formatParScore(viewMode === "gross" ? course.bestToParGross : course.bestToParNet)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
