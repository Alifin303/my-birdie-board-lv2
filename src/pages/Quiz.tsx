
import { QuizContainer } from "@/components/quiz/QuizContainer";

export default function Quiz() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <img 
                src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico" 
                alt="BirdieBoard" 
                className="w-5 h-5"
              />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              BirdieBoard
            </h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center py-8">
        <QuizContainer />
      </main>
    </div>
  );
}
