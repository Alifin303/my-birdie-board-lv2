
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";

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
        <X className="h-6 w-6 text-red-500 flex-shrink-0" aria-hidden="true" />
        <p className="font-medium text-gray-800">
          They aren't tracking their rounds, patterns, and progress.
        </p>
      </div>
      
      <p className="text-base sm:text-lg font-medium">
        But guess what? You don't have to stay stuck.
      </p>
      
      <section className="bg-green-50 p-5 rounded-lg border border-green-100">
        <h3 className="flex items-center gap-3 mb-3 font-bold text-gray-800">
          <Check className="h-6 w-6 text-green-500 flex-shrink-0" aria-hidden="true" />
          With MyBirdieBoard, you can:
        </h3>
        
        <ul className="space-y-3 pl-10 list-disc">
          <li>Track every round automatically — no more lost scorecards or forgotten holes.</li>
          <li>Compare your scores with other golfers at your favorite courses through Course Leaderboards.</li>
          <li>Spot patterns in your game so you know exactly what to fix.</li>
          <li>Set clear goals and actually see how close you are to breaking 100, 90, or 80.</li>
        </ul>
      </section>
      
      <div className="text-center space-y-4">
        <p className="text-lg font-medium">📊 Want to start improving faster?</p>
        
        <Button 
          onClick={onContinue} 
          size="lg" 
          className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label="Join MyBirdieBoard to start tracking your golf progress"
        >
          <span className="mr-2" aria-hidden="true">👉</span> Join MyBirdieBoard today
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Don't guess your way to better golf. Let MyBirdieBoard show you the way.
        </p>
      </div>
    </article>
  );
}
