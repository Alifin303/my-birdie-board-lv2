
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Activity, Award, TrendingDown } from "lucide-react";

const Dashboard = () => {
  // This would come from your backend in a real application
  const stats = {
    roundsPlayed: 24,
    bestScore: 72,
    handicap: 8.4
  };

  const courses = [
    { id: 1, name: "Pine Valley Golf Club", roundsPlayed: 8, bestScore: 75 },
    { id: 2, name: "Augusta National Golf Club", roundsPlayed: 6, bestScore: 78 },
    { id: 3, name: "St Andrews Links", roundsPlayed: 10, bestScore: 72 },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Welcome back, Golfer!</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Handicap</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.handicap}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Round Button */}
      <div className="mb-8">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add a new round
        </Button>
      </div>

      {/* Courses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead className="text-right">Rounds Played</TableHead>
              <TableHead className="text-right">Best Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell className="text-right">{course.roundsPlayed}</TableCell>
                <TableCell className="text-right">{course.bestScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
