
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
