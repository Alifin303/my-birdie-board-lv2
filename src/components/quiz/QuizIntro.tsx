
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface QuizIntroProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function QuizIntro({ isOpen, onClose, onStart }: QuizIntroProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-lg">
        <div className="space-y-4 py-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            What's Really Holding Your Golf Game Back? ⛳
          </h2>
          
          <p className="text-base sm:text-lg">
            Ever wonder why your scores aren't improving — even when you feel like you're playing better?
          </p>
          
          <p className="text-base sm:text-lg font-medium">
            The truth is… most golfers struggle because they don't track their progress or spot the patterns holding them back.
          </p>
          
          <p className="text-base sm:text-lg">
            But that's about to change.
          </p>
          
          <p className="text-base sm:text-lg">
            Take this quick quiz to discover what's stopping you from breaking 100, 90, or 80 — and how MyBirdieBoard can help you fix it.
          </p>
          
          <ul className="space-y-2 pl-2">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span>Track your rounds</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span>Spot your strengths and weaknesses</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span>Climb course leaderboards</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span>Drop your handicap</span>
            </li>
          </ul>
          
          <p className="text-base sm:text-lg font-medium text-center">
            🎯 Ready to unlock the secret to lower scores?
          </p>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={onStart}
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <span className="mr-2" aria-hidden="true">👉</span> Start the Quiz Now
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
