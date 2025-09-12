import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserHandicap } from "@/integrations/supabase";
import { useState } from "react";

export function TestHandicapUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<string>("");
  
  const testHandicapUpdate = async () => {
    setIsUpdating(true);
    try {
      // Test user ID for alastair_finlayson@hotmail.com
      const userId = "fea01b6d-388d-4070-8863-5cbf57c56bc1";
      console.log("Starting handicap update for test user...");
      
      const newHandicap = await updateUserHandicap(userId);
      setResult(`Handicap updated to: ${newHandicap}`);
      console.log("Handicap update completed:", newHandicap);
    } catch (error) {
      console.error("Error updating handicap:", error);
      setResult(`Error: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Test Handicap Update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testHandicapUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Test Handicap Update (Alastair)"}
        </Button>
        {result && (
          <div className="p-3 bg-muted rounded-md text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}