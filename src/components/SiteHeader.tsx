import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export const SiteHeader = () => {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/pricing" className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/blog" className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link to="/guides" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Guides</Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/dashboard" className="text-primary hover:text-primary/80 transition-colors">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
};
