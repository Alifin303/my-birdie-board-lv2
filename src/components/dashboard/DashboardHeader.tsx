
import { Button } from "@/components/ui/button";
import { Plus, Crown, User, Calendar, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  profileData: any;
  onAddRound: () => void;
  subscription: any;
  isDemo?: boolean;
}

export const DashboardHeader = ({ 
  profileData, 
  onAddRound, 
  subscription,
  isDemo = false 
}: DashboardHeaderProps) => {
  const subscriptionStatus = subscription?.status || "none";
  const isSubscribed = subscriptionStatus === "active";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {isDemo ? 'Demo Dashboard' : 'Your Golf Dashboard'}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>
              {profileData?.first_name && profileData?.last_name 
                ? `${profileData.first_name} ${profileData.last_name}`
                : profileData?.email || 'Golfer'
              }
            </span>
          </div>
          {profileData?.created_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Member since {new Date(profileData.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          )}
          {profileData?.handicap !== null && profileData?.handicap !== undefined && (
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>
                Handicap: {typeof profileData.handicap === 'number' 
                  ? profileData.handicap.toFixed(1) 
                  : parseFloat(String(profileData.handicap)).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {!isDemo && (
          <>
            {!isSubscribed && (
              <Button 
                asChild
                className="bg-accent hover:bg-accent/90 text-white font-semibold"
              >
                <Link to="/checkout" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Subscribe Now
                </Link>
              </Button>
            )}
            <Button 
              onClick={onAddRound}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Round
            </Button>
          </>
        )}
        
        {isDemo && (
          <Button asChild className="bg-accent hover:bg-accent/90 text-white font-semibold">
            <Link to="/">
              <Crown className="h-4 w-4 mr-2" />
              Sign Up to Get Started
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
