
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuizIntroProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  onSkipToSignup: () => void;
}

export function QuizIntro({ isOpen, onClose, onStart, onSkipToSignup }: QuizIntroProps) {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-lg p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800">
            What's Really Holding Your Golf Game Back? ⛳
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg">
            Ever wonder why your scores aren't improving — even when you feel like you're playing better?
          </p>
          
          <p className="text-sm sm:text-base md:text-lg font-medium">
            The truth is… most golfers struggle because they don't track their progress or spot the patterns holding them back.
          </p>
          
          <p className="text-sm sm:text-base md:text-lg">
            But that's about to change.
          </p>
          
          <p className="text-sm sm:text-base md:text-lg">
            Take this quick quiz to discover what's stopping you from breaking 100, 90, or 80 — and how MyBirdieBoard can help you fix it.
          </p>
          
          <ul className="space-y-2 pl-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base">Track your rounds</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base">Spot your strengths and weaknesses</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base">Climb course leaderboards</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base">Drop your handicap</span>
            </li>
          </ul>
          
          <p className="text-sm sm:text-base md:text-lg font-medium text-center">
            🎯 Ready to unlock the secret to lower scores?
          </p>
          
          <div className="flex justify-center mt-2 sm:mt-4">
            <Button 
              onClick={onStart}
              size={isMobile ? "default" : "lg"}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm sm:text-base"
            >
              <span className="mr-1 sm:mr-2" aria-hidden="true">👉</span> Start the Quiz Now
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-1 sm:mt-2 text-center">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Already know you want to level up your game?
            </p>
            <Button
              onClick={onSkipToSignup}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="text-primary hover:text-primary/90 hover:bg-primary/5 text-xs sm:text-sm w-full sm:w-auto"
            >
              <span className="mr-1" aria-hidden="true">👉</span> Skip the quiz — Sign up now!
              <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
