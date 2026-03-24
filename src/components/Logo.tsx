
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <img 
        src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
        alt="MyBirdieBoard Logo" 
        className="h-16 w-auto object-contain"
      />
    </Link>
  );
};
