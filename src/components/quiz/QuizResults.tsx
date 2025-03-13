
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface QuizResultsProps {
  onContinue: () => void;
}

export function QuizResults({ onContinue }: QuizResultsProps) {
  return (
    <article className="animate-fade-in space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">Your Quiz Results: What's Holding Your Game Back?</h2>
      
      <p className="text-base sm:text-lg">
        No matter where you are in your golf journey, the #1 reason most golfers struggle to improve is simple:
      </p>
      
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
        <p className="font-medium text-gray-800">
          They don't track their game properly.
        </p>
      </div>
      
      <p className="text-base sm:text-lg font-medium">
        But here's the good news — that changes today.
      </p>
      
      <section className="bg-green-50 p-5 rounded-lg border border-green-100">
        <h3 className="flex items-center gap-3 mb-3 font-bold text-gray-800">
          <Check className="h-6 w-6 text-green-500 flex-shrink-0" aria-hidden="true" />
          With MyBirdieBoard, you can:
        </h3>
        
        <ul className="space-y-3 pl-10">
          <li>✅ Track every round — no more lost scorecards or forgotten scores. Your full golf history, all in one place.</li>
          <li>✅ See your handicap progress — calculated using official methods, so you always know where you stand.</li>
          <li>✅ Compare scores at every course — climb the Course Leaderboards and see how you rank against other golfers, gross or net.</li>
          <li>✅ Spot your strengths and weaknesses — identify scoring patterns and trends so you know exactly what's holding you back — and how to fix it.</li>
        </ul>
      </section>
      
      <div className="text-center space-y-4">
        <p className="text-lg font-medium">📈 Stop guessing. Start improving.</p>
        
        <p className="text-base">Ready to take control of your golf game?</p>
        
        <p className="text-base font-medium">Try MyBirdieBoard FREE for 7 days and start tracking your way to lower scores today.</p>
        
        <Button 
          onClick={onContinue} 
          size="lg" 
          className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label="Join MyBirdieBoard to start tracking your golf progress"
        >
          <span className="mr-2" aria-hidden="true">👉</span> Sign up now and let's drop that handicap together
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
