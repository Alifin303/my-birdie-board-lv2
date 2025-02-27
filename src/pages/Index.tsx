
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
        className="relative h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2)), url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80')`,
        }}
      >
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
              <div className="flex items-center gap-3">
                <Link to="/api-test">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                  >
                    Test API
                  </Button>
                </Link>
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  variant="ghost" 
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                >
                  <User className="mr-2 h-5 w-5" />
                  Log In
                </Button>
              </div>
            </nav>
          </div>
        </header>
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <MainContent />
        </div>
      </div>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
};

export default Index;
