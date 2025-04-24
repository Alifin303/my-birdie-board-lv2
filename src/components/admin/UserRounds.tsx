import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RoundEditDialog } from "./RoundEditDialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, ArrowLeft } from "lucide-react";
import { Round } from "@/components/dashboard/types";

interface UserRoundsProps {
  userId: string;
  onBack: () => void;
}

export function UserRounds({ userId, onBack }: UserRoundsProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchUserRounds = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('rounds')
          .select(`
            id,
            gross_score,
            holes_played,
            to_par_gross,
            date,
            hole_scores,
            tee_name,
            tee_id,
            courses:course_id(
              id,
              name,
              clubName:name,
              courseName:name
            )
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (error) {
          console.error('Error fetching rounds:', error);
          return;
        }
        
        const transformedRounds: Round[] = (data || []).map(round => ({
          id: round.id,
          date: round.date,
          gross_score: round.gross_score,
          holes_played: round.holes_played || 18,
          to_par_gross: round.to_par_gross,
          hole_scores: typeof round.hole_scores === 'string' 
            ? round.hole_scores 
            : JSON.stringify(round.hole_scores),
          tee_name: round.tee_name || '',
          tee_id: round.tee_id,
          courses: {
            id: round.courses?.id || 0,
            name: round.courses?.name || 'Unknown Course',
            clubName: round.courses?.clubName,
            courseName: round.courses?.courseName
          }
        }));
        
        setRounds(transformedRounds);
      } catch (error) {
        console.error('Error fetching user rounds:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRounds();
  }, [userId]);
  
  const handleEditRound = (round: Round) => {
    setSelectedRound(round);
    setIsEditDialogOpen(true);
  };
  
  const handleEditSuccess = () => {
    setLoading(true);
    supabase
      .from('rounds')
      .select(`
        id,
        gross_score,
        holes_played,
        to_par_gross,
        date,
        hole_scores,
        tee_name,
        tee_id,
        courses:course_id(
          id,
          name,
          clubName:name,
          courseName:name
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          console.error('Error refreshing rounds:', error);
          return;
        }
        
        const transformedRounds: Round[] = (data || []).map(round => ({
          id: round.id,
          date: round.date,
          gross_score: round.gross_score,
          holes_played: round.holes_played || 18,
          to_par_gross: round.to_par_gross,
          hole_scores: typeof round.hole_scores === 'string' 
            ? round.hole_scores 
            : JSON.stringify(round.hole_scores),
          tee_name: round.tee_name || '',
          tee_id: round.tee_id,
          courses: {
            id: round.courses?.id || 0,
            name: round.courses?.name || 'Unknown Course',
            clubName: round.courses?.clubName,
            courseName: round.courses?.courseName
          }
        }));
        
        setRounds(transformedRounds);
      });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Details
        </Button>
        <h2 className="text-2xl font-bold">User Rounds</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : rounds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          This user has no recorded rounds.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Gross Score</TableHead>
                <TableHead className="text-right">To Par</TableHead>
                <TableHead className="text-right">Holes Played</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map((round) => (
                <TableRow key={round.id}>
                  <TableCell>{new Date(round.date).toLocaleDateString()}</TableCell>
                  <TableCell>{round.courses?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-right">{round.gross_score}</TableCell>
                  <TableCell className="text-right">{round.to_par_gross}</TableCell>
                  <TableCell className="text-right">{round.holes_played || 18}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRound(round)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedRound && (
        <RoundEditDialog
          isOpen={isEditDialogOpen}
          roundId={selectedRound.id}
          roundData={{
            ...selectedRound,
            course_name: selectedRound.courses?.name
          }}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRound(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
