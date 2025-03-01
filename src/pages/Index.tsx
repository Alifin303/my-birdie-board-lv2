
import { useState } from "react";
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')`,
          backgroundColor: "#2C4A3B", // Fallback color if image fails to load
        }}
      >
        {/* Dark overlay div */}
        <div className="absolute inset-0 bg-black opacity-15 z-0"></div>
        
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                  <img 
                    src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico" 
                    alt="BirdieBoard" 
                    className="w-8 h-8"
                  />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  BirdieBoard
                </h1>
              </div>
              <Button 
                onClick={() => setShowLoginDialog(true)}
                variant="ghost" 
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
              >
                <User className="mr-2 h-5 w-5" />
                Log In
              </Button>
            </nav>
          </div>
        </header>
        <div className="relative z-[1]">
          <MainContent />
        </div>
      </div>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
};

export default Index;
