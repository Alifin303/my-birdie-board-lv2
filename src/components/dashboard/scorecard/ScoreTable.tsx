
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScoreTableProps } from "./types";
import { calculateHoleStableford, calculateNetHoleStableford } from "@/utils/stablefordCalculator";

export const ScoreTable = ({ 
  scores, 
  isEditing, 
  handleScoreChange,
  handleGIRChange,
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
  
  // Calculate Stableford points per hole
  const stablefordPoints = scores.map(score => {
    if (!score.strokes || score.strokes === 0) return 0;
    return calculateHoleStableford(score.strokes, score.par);
  });
  const totalStableford = stablefordPoints.reduce((sum, points) => sum + points, 0);

  const scoreChunks = [];
  for (let i = 0; i < scores.length; i += 3) {
    scoreChunks.push(scores.slice(i, i + 3));
  }

  return (
    <div>
      <h4 className="font-medium mb-2 text-primary">{title}</h4>
      
      <div className="hidden sm:block border rounded-md overflow-x-auto shadow-sm">
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
                        className="w-9 h-7 text-center mx-auto px-1 score-input"
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
            
            <tr className="border-b bg-accent/10">
              <td className="px-2 py-2 text-sm font-medium text-primary">Points</td>
              {scores.map((score, index) => {
                const points = stablefordPoints[index];
                return (
                  <td key={`stableford-${score.hole}`} className="px-1 py-2 text-center">
                    <div className="w-7 h-7 flex items-center justify-center mx-auto text-sm font-medium text-primary">
                      {score.strokes ? points : '-'}
                    </div>
                  </td>
                );
              })}
              <td className="px-2 py-2 text-center font-medium text-primary">{totalStableford}</td>
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
                            className="w-9 h-7 text-center mx-auto px-1 score-input"
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
                            className="w-9 h-7 text-center mx-auto px-1 score-input"
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
      
      <div className="sm:hidden space-y-4">
        {scoreChunks.map((chunk, chunkIndex) => (
          <div key={`chunk-${chunkIndex}`} className="border rounded-md overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-secondary/20 border-b">
              {chunk.map(score => (
                <div key={`mobile-header-${score.hole}`} className="px-2 py-2 text-center">
                  <span className="text-sm font-medium text-primary">Hole {score.hole}</span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 border-b">
              {chunk.map(score => (
                <div key={`mobile-par-${score.hole}`} className="p-2 text-center border-r last:border-r-0">
                  <span className="text-xs text-muted-foreground block mb-1">Par</span>
                  <div className="bg-secondary/40 border border-secondary/60 rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto text-primary">
                    {score.par}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 border-b">
              {chunk.map((score, index) => {
                const chunkStartIndex = chunkIndex * 3;
                const actualIndex = chunkStartIndex + index + startIndex;
                const isOverPar = (score.strokes || 0) > score.par;
                const isUnderPar = (score.strokes || 0) < score.par && (score.strokes || 0) > 0;
                
                return (
                  <div key={`mobile-score-${score.hole}`} className="p-2 text-center border-r last:border-r-0">
                    <span className="text-xs text-muted-foreground block mb-1">Score</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={score.strokes || ''}
                        onChange={(e) => handleScoreChange(actualIndex, 'strokes', e.target.value)}
                        className="w-full h-7 text-center mx-auto px-1 score-input"
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
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-3 border-b bg-accent/10">
              {chunk.map((score, index) => {
                const chunkStartIndex = chunkIndex * 3;
                const globalIndex = chunkStartIndex + index + startIndex;
                const points = stablefordPoints[globalIndex];
                
                return (
                  <div key={`mobile-stableford-${score.hole}`} className="p-2 text-center border-r last:border-r-0">
                    <span className="text-xs text-muted-foreground block mb-1">Points</span>
                    <span className="text-sm font-medium">{score.strokes ? points : '-'}</span>
                  </div>
                );
              })}
            </div>
            
            {showDetailedStats && (
              <>
                <div className="grid grid-cols-3 border-b">
                  {chunk.map((score, index) => {
                    const chunkStartIndex = chunkIndex * 3;
                    const actualIndex = chunkStartIndex + index + startIndex;
                    
                    return (
                      <div key={`mobile-putts-${score.hole}`} className="p-2 text-center border-r last:border-r-0">
                        <span className="text-xs text-muted-foreground block mb-1">Putts</span>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={score.putts || ''}
                            onChange={(e) => handleScoreChange(actualIndex, 'putts', e.target.value)}
                            className="w-full h-7 text-center mx-auto px-1 score-input"
                            inputMode="numeric"
                          />
                        ) : (
                          <span className="text-sm">{score.putts || '-'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-3 border-b">
                  {chunk.map((score, index) => {
                    const chunkStartIndex = chunkIndex * 3;
                    const actualIndex = chunkStartIndex + index + startIndex;
                    
                    return (
                      <div key={`mobile-gir-${score.hole}`} className="p-2 text-center border-r last:border-r-0">
                        <span className="text-xs text-muted-foreground block mb-1">GIR</span>
                        {isEditing && handleGIRChange ? (
                          <div className="flex justify-center">
                            <Checkbox
                              checked={score.gir || false}
                              onCheckedChange={(checked) => 
                                handleGIRChange(actualIndex, checked === true)
                              }
                            />
                          </div>
                        ) : (
                          <span>{score.gir ? '✓' : '-'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-3">
                  {chunk.map((score, index) => {
                    const chunkStartIndex = chunkIndex * 3;
                    const actualIndex = chunkStartIndex + index + startIndex;
                    
                    return (
                      <div key={`mobile-penalties-${score.hole}`} className="p-2 text-center border-r last:border-r-0">
                        <span className="text-xs text-muted-foreground block mb-1">Penalties</span>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={score.penalties || ''}
                            onChange={(e) => handleScoreChange(actualIndex, 'penalties', e.target.value)}
                            className="w-full h-7 text-center mx-auto px-1 score-input"
                            inputMode="numeric"
                          />
                        ) : (
                          <span className="text-sm">{score.penalties || '-'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
        
        <div className="mt-2 border rounded-md p-3 grid grid-cols-2 gap-y-1">
          <div className="text-sm font-medium">Total Par:</div>
          <div className="text-sm text-right">{totalPar}</div>
          
          <div className="text-sm font-medium">Total Score:</div>
          <div className="text-sm text-right">{totalStrokes}</div>
          
          <div className="text-sm font-medium bg-accent/10 -mx-3 px-3 py-1">Stableford Points:</div>
          <div className="text-sm text-right bg-accent/10 -mx-3 px-3 py-1 font-semibold">{totalStableford}</div>
          
          {showDetailedStats && (
            <>
              <div className="text-sm font-medium">Total Putts:</div>
              <div className="text-sm text-right">{totalPutts || '-'}</div>
              
              <div className="text-sm font-medium">GIR %:</div>
              <div className="text-sm text-right">{girPercentage}%</div>
              
              <div className="text-sm font-medium">Penalties:</div>
              <div className="text-sm text-right">{totalPenalties || '-'}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
