
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/LoginDialog';
import { Logo } from '@/components/Logo';

interface NavBarProps {
  transparent?: boolean;
}

export const NavBar = ({ transparent = false }: NavBarProps) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <nav className={`w-full px-4 py-4 ${transparent ? 'absolute top-0 left-0 z-10' : 'bg-primary/90 shadow-md'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            className={`text-white hover:text-white/80 ${transparent ? 'hover:bg-white/10' : 'hover:bg-primary-foreground/10'}`}
            asChild
          >
            <Link to="/about">About</Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white hover:text-white/80 ${transparent ? 'hover:bg-white/10' : 'hover:bg-primary-foreground/10'}`}
            asChild
          >
            <Link to="/quiz">Quiz</Link>
          </Button>
          <Button 
            className="bg-accent hover:bg-accent/90 text-white"
            onClick={() => setShowLogin(true)}
          >
            Log in
          </Button>
        </div>
      </div>
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </nav>
  );
};
