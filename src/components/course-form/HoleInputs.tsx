
import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { HoleData } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface HoleInputsProps {
  holes: HoleData[];
  handleHoleChange: (holeIndex: number, field: keyof HoleData, value: string) => void;
}

export function HoleInputs({ 
  holes, 
  handleHoleChange 
}: HoleInputsProps) {
  const isMobile = useIsMobile();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set up smooth focus handling on mobile
  useEffect(() => {
    if (isMobile) {
      const handleFocus = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        // Add small delay to ensure smooth scroll
        setTimeout(() => {
          // Scroll the target element into view with smooth behavior
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      };

      // Add the focus event listener to all input elements
      const inputs = document.querySelectorAll('input[type="number"]');
      inputs.forEach(input => {
        input.addEventListener('focus', handleFocus);
      });

      // Clean up event listeners on unmount
      return () => {
        inputs.forEach(input => {
          input.removeEventListener('focus', handleFocus);
        });
      };
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="border rounded-md p-2 sm:p-3 mt-4 space-y-4 hole-inputs-container">
        {holes.map((hole, idx) => (
          <div key={`hole-${hole.number}`} className="border-b pb-3 last:border-b-0 last:pb-0">
            <div className="font-medium text-base mb-2">Hole {hole.number}</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Par</div>
                <Input
                  type="number"
                  min="2"
                  max="6"
                  value={hole.par === null || hole.par === undefined ? "" : hole.par}
                  onChange={(e) => handleHoleChange(idx, 'par', e.target.value)}
                  className="w-full h-9 text-center"
                  required
                  placeholder=""
                  ref={el => inputRefs.current[idx * 3] = el}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Yards</div>
                <Input
                  type="number"
                  min="0"
                  max="999"
                  value={hole.yards === null || hole.yards === undefined ? "" : hole.yards}
                  onChange={(e) => handleHoleChange(idx, 'yards', e.target.value)}
                  className="w-full h-9 text-center"
                  required
                  placeholder=""
                  ref={el => inputRefs.current[idx * 3 + 1] = el}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Handicap</div>
                <Input
                  type="number"
                  min="1"
                  max={holes.length}
                  value={hole.handicap === null || hole.handicap === undefined ? "" : hole.handicap}
                  onChange={(e) => handleHoleChange(idx, 'handicap', e.target.value)}
                  className="w-full h-9 text-center"
                  required
                  placeholder=""
                  ref={el => inputRefs.current[idx * 3 + 2] = el}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Original desktop version
  return (
    <div className="border rounded-md overflow-x-auto mt-4">
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
                  // Prevent form submission on enter
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
                  // Prevent form submission on enter
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
                   max={holes.length}
                  value={hole.handicap === null || hole.handicap === undefined ? "" : hole.handicap}
                  onChange={(e) => handleHoleChange(idx, 'handicap', e.target.value)}
                  className="w-8 sm:w-12 h-7 sm:h-8 text-center text-xs sm:text-sm"
                  required
                  placeholder=""
                  // Prevent form submission on enter
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
}
