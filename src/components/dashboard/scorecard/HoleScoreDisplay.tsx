
import { Input } from "@/components/ui/input";

interface HoleScoreDisplayProps {
  title: string;
  startHole: number;
  holeScores: number[];
  isEditing: boolean;
  onScoreChange: (index: number, value: string) => void;
}

export const HoleScoreDisplay = ({
  title,
  startHole,
  holeScores,
  isEditing,
  onScoreChange,
}: HoleScoreDisplayProps) => {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="grid grid-cols-10 gap-2 text-center text-sm">
        <div className="font-medium">Hole</div>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={`hole-${i + startHole}`}>{i + startHole}</div>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-2 text-center text-sm mt-1">
        <div className="font-medium">Score</div>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={`score-${i + startHole}`}>
            {isEditing ? (
              <Input 
                type="number" 
                value={holeScores[i + startHole - 1] || ''}
                onChange={(e) => onScoreChange(i + startHole - 1, e.target.value)}
                min="1"
                max="20"
                className="h-8 w-full text-center p-1"
              />
            ) : (
              holeScores[i + startHole - 1] || '-'
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
