
import React from "react";

export const UserDebugPanel = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-md text-xs">
      <h4 className="font-bold mb-1">Debug Panel</h4>
      <div className="space-y-1">
        <p>User: Not logged in</p>
      </div>
    </div>
  );
};
