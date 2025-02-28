
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
  return (
    <div className="border rounded-md overflow-x-auto mt-4">
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-left">Hole</th>
            {holes.map(hole => (
              <th key={`header-${hole.number}`} className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                {hole.number}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="text-sm font-medium text-muted-foreground px-2 py-2">Par</td>
            {holes.map((hole) => (
              <td key={`par-${hole.number}`} className="text-center px-2 py-2">
                <Input
                  type="number"
                  min="2"
                  max="6"
                  value={hole.par}
                  onChange={(e) => handleHoleChange(hole.number - 1, 'par', e.target.value)}
                  className="w-12 h-8 text-center"
                  required
                />
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="text-sm font-medium text-muted-foreground px-2 py-2">Yards</td>
            {holes.map((hole) => (
              <td key={`yards-${hole.number}`} className="text-center px-2 py-2">
                <Input
                  type="number"
                  min="0"
                  max="999"
                  value={hole.yards}
                  onChange={(e) => handleHoleChange(hole.number - 1, 'yards', e.target.value)}
                  className="w-12 h-8 text-center"
                  required
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="text-sm font-medium text-muted-foreground px-2 py-2">Handicap</td>
            {holes.map((hole) => (
              <td key={`handicap-${hole.number}`} className="text-center px-2 py-2">
                <Input
                  type="number"
                  min="1"
                  max="18"
                  value={hole.handicap}
                  onChange={(e) => handleHoleChange(hole.number - 1, 'handicap', e.target.value)}
                  className="w-12 h-8 text-center"
                  required
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
