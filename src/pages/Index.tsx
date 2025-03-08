
import { useState } from "react";
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
          backgroundColor: "#2C4A3B", // Fallback color if image fails to load
        }}
      >
        {/* Dark overlay div */}
        <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
        
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <img 
                  src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
                  alt="MyBirdieBoard Logo" 
                  className="h-24 w-auto object-contain"
                />
              </Link>
              <Button 
                onClick={() => setShowLoginDialog(true)}
                variant="ghost" 
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-xs sm:text-sm py-1"
              >
                <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Log In
              </Button>
            </nav>
          </div>
        </header>
        <div className="relative z-[1]">
          <MainContent onStartQuiz={handleStartQuiz} />
        </div>
      </div>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
};

export default Index;
