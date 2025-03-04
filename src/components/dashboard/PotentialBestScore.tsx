
import { calculatePotentialBestScore } from "./utils/bestScoreCalculator";
import { Round } from "./types";

interface PotentialBestScoreProps {
  rounds: Round[];
}

export const PotentialBestScore = ({ rounds }: PotentialBestScoreProps) => {
  const bestScoreData = calculatePotentialBestScore(rounds);
  
  if (!bestScoreData || bestScoreData.holeScores.length === 0) {
    return null;
  }
  
  const front9 = bestScoreData.holeScores.filter(h => h.hole <= 9);
  const back9 = bestScoreData.holeScores.filter(h => h.hole > 9);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Your Potential Best Score</h3>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white">
        <div className="mb-3">
          <p className="text-sm text-white/80">This shows your best possible score based on your best performance on each hole across all rounds.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase text-white/80">Hole</th>
                {front9.map((hole) => (
                  <th key={hole.hole} className="px-2 py-2 text-center text-xs font-medium text-white/80">{hole.hole}</th>
                ))}
                <th className="px-2 py-2 text-center text-xs font-medium uppercase text-white/80">Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/20">
                <td className="px-2 py-2 text-left text-xs font-medium uppercase text-white/80">Par</td>
                {front9.map((hole) => (
                  <td key={hole.hole} className="px-2 py-2 text-center text-xs text-white">{hole.par}</td>
                ))}
                <td className="px-2 py-2 text-center text-xs font-medium text-white">{bestScoreData.front9Par}</td>
              </tr>
              <tr className="border-t border-white/20">
                <td className="px-2 py-2 text-left text-xs font-medium uppercase text-white/80">Best</td>
                {front9.map((hole) => (
                  <td key={hole.hole} className="px-2 py-2 text-center text-xs text-white">
                    {hole.bestScore > 0 ? hole.bestScore : '-'}
                  </td>
                ))}
                <td className="px-2 py-2 text-center text-xs font-medium text-white">{bestScoreData.front9BestScore}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {back9.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-white/20">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium uppercase text-white/80">Hole</th>
                  {back9.map((hole) => (
                    <th key={hole.hole} className="px-2 py-2 text-center text-xs font-medium text-white/80">{hole.hole}</th>
                  ))}
                  <th className="px-2 py-2 text-center text-xs font-medium uppercase text-white/80">In</th>
                  <th className="px-2 py-2 text-center text-xs font-medium uppercase text-white/80">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/20">
                  <td className="px-2 py-2 text-left text-xs font-medium uppercase text-white/80">Par</td>
                  {back9.map((hole) => (
                    <td key={hole.hole} className="px-2 py-2 text-center text-xs text-white">{hole.par}</td>
                  ))}
                  <td className="px-2 py-2 text-center text-xs font-medium text-white">{bestScoreData.back9Par}</td>
                  <td className="px-2 py-2 text-center text-xs font-medium text-white">{bestScoreData.totalPar}</td>
                </tr>
                <tr className="border-t border-white/20">
                  <td className="px-2 py-2 text-left text-xs font-medium uppercase text-white/80">Best</td>
                  {back9.map((hole) => (
                    <td key={hole.hole} className="px-2 py-2 text-center text-xs text-white">
                      {hole.bestScore > 0 ? hole.bestScore : '-'}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center text-xs font-medium text-white">{bestScoreData.back9BestScore}</td>
                  <td className="px-2 py-2 text-center text-xs font-medium text-white">{bestScoreData.totalBestScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm font-medium">Potential Best Score: <span className="text-lg font-bold">{bestScoreData.totalBestScore}</span></p>
          <p className="text-sm font-medium">
            To Par: <span className="text-lg font-bold">
              {bestScoreData.totalBestScore - bestScoreData.totalPar > 0 ? '+' : ''}
              {bestScoreData.totalBestScore - bestScoreData.totalPar}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
