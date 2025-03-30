import React from "react";
import { Input } from "@/components/ui/input";
import { HoleData } from "./types";

interface HoleInputsProps {
  holes: HoleData[];
  handleHoleChange: (holeIndex: number, field: keyof HoleData, value: string) => void;
}

export function HoleInputs({ 
  holes, 
  handleHoleChange 
}: HoleInputsProps) {
  const DesktopView = () => (
    <div className="border rounded-md overflow-x-auto mt-4 hidden md:block">
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <th className="text-xs sm:text-sm font-medium text-muted-foreground px-1 sm:px-2 py-1 sm:py-2 text-left">Hole</th>
            {holes.map(hole => (
              <th key={`header-${hole.number}`} className="text-xs sm:text-sm font-medium text-muted-foreground px-1 sm:px-2 py-1 sm:py-2 text-center">
                {hole.number}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="text-xs sm:text-sm font-medium text-muted-foreground px-1 sm:px-2 py-1 sm:py-2">Par</td>
            {holes.map((hole, idx) => (
              <td key={`par-${hole.number}`} className="text-center px-1 sm:px-2 py-1 sm:py-2">
                <Input
                  type="number"
                  min="2"
                  max="6"
                  value={hole.par === null || hole.par === undefined ? "" : hole.par}
                  onChange={(e) => handleHoleChange(idx, 'par', e.target.value)}
                  className="w-8 sm:w-12 h-7 sm:h-8 text-center text-xs sm:text-sm"
                  required
                  placeholder=""
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                />
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="text-xs sm:text-sm font-medium text-muted-foreground px-1 sm:px-2 py-1 sm:py-2">Yards</td>
            {holes.map((hole, idx) => (
              <td key={`yards-${hole.number}`} className="text-center px-1 sm:px-2 py-1 sm:py-2">
                <Input
                  type="number"
                  min="0"
                  max="999"
                  value={hole.yards === null || hole.yards === undefined ? "" : hole.yards}
                  onChange={(e) => handleHoleChange(idx, 'yards', e.target.value)}
                  className="w-8 sm:w-12 h-7 sm:h-8 text-center text-xs sm:text-sm"
                  required
                  placeholder=""
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="text-xs sm:text-sm font-medium text-muted-foreground px-1 sm:px-2 py-1 sm:py-2">Handicap</td>
            {holes.map((hole, idx) => (
              <td key={`handicap-${hole.number}`} className="text-center px-1 sm:px-2 py-1 sm:py-2">
                <Input
                  type="number"
                  min="1"
                  max="18"
                  value={hole.handicap === null || hole.handicap === undefined ? "" : hole.handicap}
                  onChange={(e) => handleHoleChange(idx, 'handicap', e.target.value)}
                  className="w-8 sm:w-12 h-7 sm:h-8 text-center text-xs sm:text-sm"
                  required
                  placeholder=""
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const MobileView = () => (
    <div className="mt-4 space-y-4 md:hidden">
      {holes.map((hole, idx) => (
        <div key={`hole-mobile-${hole.number}`} className="border rounded-md p-3 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Hole {hole.number}</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Par</label>
              <Input
                type="number"
                min="2"
                max="6"
                value={hole.par === null || hole.par === undefined ? "" : hole.par}
                onChange={(e) => handleHoleChange(idx, 'par', e.target.value)}
                className="h-9 text-center"
                required
                placeholder=""
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Yards</label>
              <Input
                type="number"
                min="0"
                max="999"
                value={hole.yards === null || hole.yards === undefined ? "" : hole.yards}
                onChange={(e) => handleHoleChange(idx, 'yards', e.target.value)}
                className="h-9 text-center"
                required
                placeholder=""
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Handicap</label>
              <Input
                type="number"
                min="1"
                max="18"
                value={hole.handicap === null || hole.handicap === undefined ? "" : hole.handicap}
                onChange={(e) => handleHoleChange(idx, 'handicap', e.target.value)}
                className="h-9 text-center"
                required
                placeholder=""
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <DesktopView />
      <MobileView />
    </>
  );
}
