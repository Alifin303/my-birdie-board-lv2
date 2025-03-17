
import React from "react";

export type ScoreType = 'eagle' | 'birdie' | 'par' | 'bogey' | 'doubleBogey' | 'other';

interface StatsCardProps {
  type: ScoreType;
  count: number;
}

export const StatsCard = ({ type, count }: StatsCardProps) => {
  const getColorClass = () => {
    switch(type) {
      case 'eagle': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'birdie': return 'bg-green-50 border-green-200 text-green-700';
      case 'par': return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'bogey': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'doubleBogey': return 'bg-red-50 border-red-200 text-red-700';
      case 'other': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  
  const getLabel = () => {
    switch(type) {
      case 'doubleBogey': return 'Double Bogey';
      case 'other': return 'Other';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className={`text-center p-3 rounded-lg ${getColorClass()} border shadow-sm transition-all hover:shadow-md`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium">{getLabel()}</p>
    </div>
  );
};
