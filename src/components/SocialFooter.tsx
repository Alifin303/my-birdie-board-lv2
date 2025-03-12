
import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SocialFooter = () => {
  const handleNavigate = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-primary/5 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MyBirdieBoard. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/faq" onClick={handleNavigate}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                FAQ
              </Button>
            </Link>
            
            <Link to="/privacy" onClick={handleNavigate}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Privacy Policy
              </Button>
            </Link>
            
            <a 
              href="https://instagram.com/mybirdieboard" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow MyBirdieBoard on Instagram"
            >
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
            </a>
            
            <a 
              href="https://facebook.com/mybirdieboard" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow MyBirdieBoard on Facebook"
            >
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
