
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface SearchInputProps {
  searchQuery: string;
  isSearching: boolean;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput = ({ 
  searchQuery, 
  isSearching, 
  handleSearchChange 
}: SearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4" />
      <Input
        type="text"
        placeholder="Search for a golf course..."
        className="pl-10 border-accent/20 focus:border-accent/40"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4 animate-spin" />
      )}
    </div>
  );
};
