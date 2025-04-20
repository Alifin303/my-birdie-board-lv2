
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ChevronDown, ChevronUp, User } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  handicap: number;
  created_at: string;
}

interface Round {
  id: number;
  date: string;
  gross_score: number;
  to_par_gross: number;
  holes_played?: number;
  course: {
    name: string;
    city?: string;
    state?: string;
  };
}

export function UserDetail({ userId }: { userId: string }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<'date' | 'gross_score' | 'to_par_gross'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showHandicapDetails, setShowHandicapDetails] = useState(false);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        
        setUserProfile(profile);
        
        // Fetch user rounds with course info
        const { data: userRounds, error: roundsError } = await supabase
          .from('rounds')
          .select(`
            id,
            date,
            gross_score,
            to_par_gross,
            holes_played,
            courses:course_id (
              id,
              name,
              city,
              state
            )
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (roundsError) throw roundsError;
        
        // Transform data to match our interface
        const formattedRounds = userRounds.map(round => ({
          id: round.id,
          date: round.date,
          gross_score: round.gross_score,
          to_par_gross: round.to_par_gross,
          holes_played: round.holes_played || 18,
          course: {
            name: round.courses?.name || 'Unknown Course',
            city: round.courses?.city,
            state: round.courses?.state
          }
        }));
        
        setRounds(formattedRounds);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserDetails();
  }, [userId]);

  const handleSort = (field: 'date' | 'gross_score' | 'to_par_gross') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIndicator = (field: 'date' | 'gross_score' | 'to_par_gross') => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline-block h-4 w-4 ml-1" /> 
      : <ChevronDown className="inline-block h-4 w-4 ml-1" />;
  };
  
  const sortedRounds = [...rounds].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'gross_score') {
      return sortDirection === 'asc' ? a.gross_score - b.gross_score : b.gross_score - a.gross_score;
    } else { // to_par_gross
      return sortDirection === 'asc' ? a.to_par_gross - b.to_par_gross : b.to_par_gross - a.to_par_gross;
    }
  });

  // Handicap calculation for debugging purposes
  const calculateHandicapDetails = () => {
    if (!rounds || rounds.length === 0) return null;
    
    // Prepare scores and hole counts
    const scores = rounds.map(r => r.gross_score);
    const holeCounts = rounds.map(r => r.holes_played || 18);
    
    // Convert 9-hole scores to 18-hole equivalent scores
    const adjustedScores = scores.map((score, index) => {
      const holeCount = holeCounts[index];
      if (holeCount === 9) {
        const estimatedPar = 36;
        const isLikelyOutlier = score > (estimatedPar + 20);
        
        if (isLikelyOutlier) {
          return score + estimatedPar;
        }
        return score * 2 + 1;
      }
      return score;
    });
    
    // Sort scores from best to worst (lowest to highest)
    const sortedScores = [...adjustedScores].sort((a, b) => a - b);
    
    // Determine how many scores to use
    let scoresToUse = 0;
    if (scores.length >= 20) scoresToUse = 8;
    else if (scores.length >= 15) scoresToUse = 6;
    else if (scores.length >= 10) scoresToUse = 4;
    else if (scores.length >= 5) scoresToUse = 3;
    else if (scores.length >= 3) scoresToUse = 1;
    else scoresToUse = 1;
    
    // Take the best scores
    const bestScores = sortedScores.slice(0, scoresToUse);
    
    // Calculate the average
    const averageScore = bestScores.reduce((sum, score) => sum + score, 0) / bestScores.length;
    
    // Standard calculation
    const parBaseline = 72;
    const scoreDifferential = averageScore - parBaseline;
    
    // Check for unrealistic handicaps
    const roundsBelowPar = scores.filter(s => s < parBaseline).length;
    let calculatedHandicap = (averageScore - parBaseline) * 0.96;
    let calculationMethod = "Standard WHS calculation";
    
    // Apply the adjustments for unrealistic handicaps
    if (scoreDifferential < -10 && scores.filter(s => s <= parBaseline).length < 2) {
      const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
      const medianDifferential = (medianScore - parBaseline) * 0.5;
      const adjustedHandicap = medianDifferential > -5 ? medianDifferential : -5;
      calculatedHandicap = adjustedHandicap;
      calculationMethod = "Adjusted calculation (using median score)";
    }
    
    // Negative handicap check
    if (calculatedHandicap < 0 && roundsBelowPar < 2) {
      calculatedHandicap = 0;
      calculationMethod = "Capped at 0 (insufficient rounds below par)";
    }
    
    return {
      originalScores: rounds.map((r, i) => ({
        id: r.id,
        date: new Date(r.date).toLocaleDateString(),
        course: r.course.name,
        gross: r.gross_score,
        toPar: r.to_par_gross,
        holes: r.holes_played || 18,
        adjusted: adjustedScores[i]
      })),
      sortedScores,
      bestScores,
      averageScore,
      scoreDifferential,
      roundsBelowPar,
      calculatedHandicap: Math.min(54, calculatedHandicap),
      calculationMethod,
      scoresToUse,
      totalRounds: rounds.length
    };
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (!userProfile) {
    return (
      <div className="p-4 text-center">
        User not found or there was an error loading the user's profile.
      </div>
    );
  }

  const userFullName = userProfile.first_name && userProfile.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}` 
    : (userProfile.first_name || userProfile.last_name || 'N/A');

  const totalRounds = rounds.length;
  const bestScore = rounds.length > 0 
    ? Math.min(...rounds.map(r => r.gross_score))
    : 'N/A';
  const bestToPar = rounds.length > 0
    ? Math.min(...rounds.map(r => r.to_par_gross))
    : 'N/A';
  const averageScore = rounds.length > 0
    ? Math.round(rounds.reduce((sum, r) => sum + r.gross_score, 0) / rounds.length * 10) / 10
    : 'N/A';
    
  const handicapDetails = calculateHandicapDetails();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            {userProfile.username || 'User'}
          </CardTitle>
          <CardDescription>
            {userFullName}
            {userProfile.created_at && (
              <span className="ml-2 text-xs flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Joined {new Date(userProfile.created_at).toLocaleDateString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground">Handicap</p>
              <p className="text-xl font-semibold">{userProfile.handicap?.toFixed(1) || 'N/A'}</p>
              <button 
                onClick={() => setShowHandicapDetails(!showHandicapDetails)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {showHandicapDetails ? 'Hide details' : 'Show calculation details'}
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rounds</p>
              <p className="text-xl font-semibold">{totalRounds}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-xl font-semibold">{bestScore}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best To Par</p>
              <p className="text-xl font-semibold">
                {typeof bestToPar === 'number' ? (bestToPar > 0 ? '+' : '') + bestToPar : bestToPar}
              </p>
            </div>
          </div>
          
          {showHandicapDetails && handicapDetails && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="text-sm font-semibold mb-2">Handicap Calculation Details</h3>
              
              <div className="text-xs space-y-2">
                <p><span className="font-medium">Method:</span> {handicapDetails.calculationMethod}</p>
                <p><span className="font-medium">Using:</span> Best {handicapDetails.scoresToUse} of {handicapDetails.totalRounds} rounds</p>
                <p><span className="font-medium">Average of best scores:</span> {handicapDetails.averageScore.toFixed(1)}</p>
                <p><span className="font-medium">Raw differential:</span> {handicapDetails.scoreDifferential.toFixed(1)}</p>
                <p><span className="font-medium">Rounds below par:</span> {handicapDetails.roundsBelowPar}</p>
                <p><span className="font-medium">Final calculated handicap:</span> {handicapDetails.calculatedHandicap.toFixed(1)}</p>
                
                <div className="mt-3">
                  <p className="font-medium mb-1">Scores used in calculation:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 pr-3">Date</th>
                          <th className="text-left py-1 pr-3">Course</th>
                          <th className="text-right py-1 pr-3">Score</th>
                          <th className="text-right py-1 pr-3">To Par</th>
                          <th className="text-right py-1 pr-3">Holes</th>
                          <th className="text-right py-1">Adjusted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {handicapDetails.originalScores.map((score, i) => {
                          const isInBest = handicapDetails.bestScores.includes(score.adjusted);
                          return (
                            <tr key={score.id} className={`border-b ${isInBest ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                              <td className="py-1 pr-3">{score.date}</td>
                              <td className="py-1 pr-3 max-w-[150px] truncate">{score.course}</td>
                              <td className="text-right py-1 pr-3">{score.gross}</td>
                              <td className="text-right py-1 pr-3">{score.toPar > 0 ? '+' : ''}{score.toPar}</td>
                              <td className="text-right py-1 pr-3">{score.holes}</td>
                              <td className="text-right py-1">{isInBest && '✓ '}{score.adjusted}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs italic">✓ Indicates scores used in best {handicapDetails.scoresToUse} calculation</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Round History</h2>
        
        {rounds.length === 0 ? (
          <div className="text-center py-8 bg-background border rounded-lg">
            <p className="text-muted-foreground">This user hasn't logged any rounds yet.</p>
          </div>
        ) : (
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <span className="flex items-center">
                      Date {renderSortIndicator('date')}
                    </span>
                  </TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Holes</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('gross_score')}
                  >
                    <span className="flex items-center justify-end">
                      Score {renderSortIndicator('gross_score')}
                    </span>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('to_par_gross')}
                  >
                    <span className="flex items-center justify-end">
                      To Par {renderSortIndicator('to_par_gross')}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRounds.map(round => (
                  <TableRow key={round.id}>
                    <TableCell className="font-medium">
                      {new Date(round.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {round.course.name}
                      {round.course.city && round.course.state && (
                        <span className="text-xs text-muted-foreground block">
                          {round.course.city}, {round.course.state}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{round.holes_played || 18}</TableCell>
                    <TableCell className="text-right">{round.gross_score}</TableCell>
                    <TableCell className="text-right">
                      {round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div>
        <Skeleton className="h-7 w-36 mb-4" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
