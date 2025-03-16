import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScoreTableProps } from "./types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, X } from "lucide-react";

export const ScoreTable = ({ 
  scores, 
  isEditing, 
  handleScoreChange,
  handleGIRChange,
  handleFairwayChange,
  title,
  startIndex = 0,
  showDetailedStats = false
}: ScoreTableProps) => {
  if (!scores || scores.length === 0) return null;
  
  const totalStrokes = scores.reduce((sum, score) => sum + (score.strokes || 0), 0);
  const totalPar = scores.reduce((sum, score) => sum + score.par, 0);
  const totalPutts = scores.reduce((sum, score) => sum + (score.putts || 0), 0);
  const totalPenalties = scores.reduce((sum, score) => sum + (score.penalties || 0), 0);
  const girCount = scores.filter(score => score.gir).length;
  const girPercentage = scores.length > 0 ? Math.round((girCount / scores.length) * 100) : 0;
  
  const fairwayHoles = scores.filter(score => score.par >= 4); // Only par 4 and 5 have fairways
  const fairwayHits = fairwayHoles.filter(score => score.fairwayHit).length;
  const fairwayPercentage = fairwayHoles.length > 0 ? Math.round((fairwayHits / fairwayHoles.length) * 100) : 0;

  return (
    <div>
      <h4 className="font-medium mb-2 text-primary">{title}</h4>
      <div className="border rounded-md overflow-x-auto shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-secondary/20">
              <th className="px-2 py-2 text-left text-sm font-medium text-primary">Hole</th>
              {scores.map((score) => (
                <th key={`hole-${score.hole}`} className="px-1 py-2 text-center text-sm font-medium text-primary">{score.hole}</th>
              ))}
              <th className="px-2 py-2 text-center text-sm font-medium text-primary">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-2 text-sm font-medium text-primary">Par</td>
              {scores.map((score) => (
                <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                  <div className="bg-secondary/40 border border-secondary/60 rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto text-primary">
                    {score.par}
                  </div>
                </td>
              ))}
              <td className="px-2 py-2 text-center font-medium text-primary">{totalPar}</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-2 text-sm font-medium text-primary">Score</td>
              {scores.map((score, index) => {
                const actualIndex = index + startIndex;
                const isOverPar = (score.strokes || 0) > score.par;
                const isUnderPar = (score.strokes || 0) < score.par && (score.strokes || 0) > 0;
                
                return (
                  <td key={`score-${score.hole}`} className="px-1 py-2 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={score.strokes || ''}
                        onChange={(e) => handleScoreChange(actualIndex, 'strokes', e.target.value)}
                        className="w-9 h-7 text-center mx-auto px-1"
                        inputMode="numeric"
                      />
                    ) : (
                      <div className={`w-7 h-7 flex items-center justify-center mx-auto rounded-full ${
                        isOverPar ? 'bg-destructive/10 text-destructive' : 
                        isUnderPar ? 'bg-success/20 text-success' : ''
                      }`}>
                        {score.strokes || '-'}
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-2 text-center font-medium text-primary">{totalStrokes}</td>
            </tr>
            
            {showDetailedStats && (
              <>
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium text-primary">Putts</td>
                  {scores.map((score, index) => {
                    const actualIndex = index + startIndex;
                    return (
                      <td key={`putts-${score.hole}`} className="px-1 py-2 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={score.putts || ''}
                            onChange={(e) => handleScoreChange(actualIndex, 'putts', e.target.value)}
                            className="w-9 h-7 text-center mx-auto px-1"
                            inputMode="numeric"
                          />
                        ) : (
                          <span className="text-sm">{score.putts || '-'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-medium text-primary">{totalPutts || '-'}</td>
                </tr>
                
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium text-primary">GIR</td>
                  {scores.map((score, index) => {
                    const actualIndex = index + startIndex;
                    return (
                      <td key={`gir-${score.hole}`} className="px-1 py-2 text-center">
                        {isEditing && handleGIRChange ? (
                          <Checkbox
                            checked={score.gir || false}
                            onCheckedChange={(checked) => 
                              handleGIRChange(actualIndex, checked === true)
                            }
                            className="mx-auto"
                          />
                        ) : (
                          <span>{score.gir ? '✓' : '-'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-medium text-primary">{girPercentage}%</td>
                </tr>

                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium text-primary">Fairway</td>
                  {scores.map((score, index) => {
                    const actualIndex = index + startIndex;
                    const isPar4or5 = score.par >= 4;
                    
                    const getStatusDisplay = () => {
                      if (score.fairwayHit) return "Hit";
                      if (score.fairwayMissDirection) {
                        return `Miss ${score.fairwayMissDirection.charAt(0).toUpperCase() + score.fairwayMissDirection.slice(1)}`;
                      }
                      return "-";
                    };
                    
                    return (
                      <td key={`fairway-${score.hole}`} className="px-1 py-2 text-center">
                        {isEditing && handleFairwayChange && isPar4or5 ? (
                          <div className="relative inline-block text-left">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 w-20 p-0 text-xs ${
                                score.fairwayHit 
                                  ? 'bg-success/20 hover:bg-success/30 text-success border-success/30' 
                                  : score.fairwayMissDirection 
                                  ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30'
                                  : ''
                              }`}
                              onClick={(e) => {
                                const buttonElement = e.currentTarget;
                                
                                const dropdown = document.getElementById(`fairway-dropdown-${score.hole}`);
                                if (dropdown) {
                                  dropdown.classList.toggle('hidden');
                                  const buttonRect = buttonElement.getBoundingClientRect();
                                  dropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
                                  dropdown.style.left = `${buttonRect.left + window.scrollX - 30}px`;
                                }
                                
                                document.querySelectorAll('[id^="fairway-dropdown-"]').forEach((el) => {
                                  if (el.id !== `fairway-dropdown-${score.hole}`) {
                                    el.classList.add('hidden');
                                  }
                                });
                                
                                const handleClickOutside = (event: MouseEvent) => {
                                  if (dropdown && !dropdown.contains(event.target as Node) && 
                                      !buttonElement.contains(event.target as Node)) {
                                    dropdown.classList.add('hidden');
                                    document.removeEventListener('click', handleClickOutside);
                                  }
                                };
                                
                                document.addEventListener('click', handleClickOutside);
                              }}
                            >
                              {getStatusDisplay()}
                            </Button>
                            
                            <div 
                              id={`fairway-dropdown-${score.hole}`}
                              className="absolute z-50 w-32 mt-1 bg-white rounded-md shadow-lg border border-gray-200 hidden"
                              style={{ minWidth: '120px' }}
                            >
                              <div className="py-1">
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-100 w-full text-left"
                                  onClick={() => {
                                    handleFairwayChange(actualIndex, true);
                                    document.getElementById(`fairway-dropdown-${score.hole}`)?.classList.add('hidden');
                                  }}
                                >
                                  <Check className="h-4 w-4 mr-2" /> Hit
                                </button>
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
                                  onClick={() => {
                                    handleFairwayChange(actualIndex, false, 'left');
                                    document.getElementById(`fairway-dropdown-${score.hole}`)?.classList.add('hidden');
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" /> Miss Left
                                </button>
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
                                  onClick={() => {
                                    handleFairwayChange(actualIndex, false, 'right');
                                    document.getElementById(`fairway-dropdown-${score.hole}`)?.classList.add('hidden');
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" /> Miss Right
                                </button>
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
                                  onClick={() => {
                                    handleFairwayChange(actualIndex, false, 'long');
                                    document.getElementById(`fairway-dropdown-${score.hole}`)?.classList.add('hidden');
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" /> Miss Long
                                </button>
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
                                  onClick={() => {
                                    handleFairwayChange(actualIndex, false, 'short');
                                    document.getElementById(`fairway-dropdown-${score.hole}`)?.classList.add('hidden');
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" /> Miss Short
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          isPar4or5 ? (
                            <div className="flex flex-col items-center">
                              <span>
                                {score.fairwayHit ? '✓' : score.fairwayMissDirection ? '✗' : '-'}
                              </span>
                              {score.fairwayMissDirection && (
                                <span className="text-xs text-muted-foreground">
                                  {score.fairwayMissDirection.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-medium text-primary">{fairwayPercentage}%</td>
                </tr>
                
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium text-primary">Penalties</td>
                  {scores.map((score, index) => {
                    const actualIndex = index + startIndex;
                    return (
                      <td key={`penalties-${score.hole}`} className="px-1 py-2 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={score.penalties || ''}
                            onChange={(e) => handleScoreChange(actualIndex, 'penalties', e.target.value)}
                            className="w-9 h-7 text-center mx-auto px-1"
                            inputMode="numeric"
                          />
                        ) : (
                          <span className="text-sm">{score.penalties || '-'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-medium text-primary">{totalPenalties || '-'}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
