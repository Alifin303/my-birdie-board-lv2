
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-xl">BirdieBoard</Link>
        <nav className="flex items-center gap-4">
          <Link to="/about">About</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
};
