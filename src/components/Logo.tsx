
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <img 
        src="/logo.png" 
        alt="MyBirdieBoard Logo" 
        className="h-16 w-auto object-contain"
      />
    </Link>
  );
};
