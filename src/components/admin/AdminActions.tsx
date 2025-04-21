
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminActions } from "@/hooks/use-admin-actions";
import { RefreshCw } from "lucide-react";

export function AdminActions() {
  const { recalculateAllHandicaps, isRecalculatingHandicaps } = useAdminActions();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Administrative Actions</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Handicap Management</CardTitle>
            <CardDescription>
              Recalculate handicaps for all users based on their current round data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This action will parse through all user rounds and update handicaps according to
              the World Handicap System rules. Use this if handicaps seem out of sync.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={recalculateAllHandicaps} 
              disabled={isRecalculatingHandicaps}
              className="w-full"
            >
              {isRecalculatingHandicaps ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recalculate All Handicaps
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
