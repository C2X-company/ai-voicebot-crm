"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCampaignCalls } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";


export function StartCallingButton({ campaignId, isDisabled }: { campaignId: string, isDisabled: boolean }) {
  const [isCalling, setIsCalling] = useState(false);
  const router = useRouter();

  const handleStartCalls = async () => {
    setIsCalling(true);
    const result = await startCampaignCalls(campaignId);
    
    if (result.success) {
      router.refresh(); // Force the page to fetch the latest active status
    } else {
      alert(result.error || "Failed to start calls. Check terminal logs.");
    }
    
    setIsCalling(false);
  };

  return (
    <Button 
      onClick={handleStartCalls}
      disabled={isDisabled || isCalling}
      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 transition-all"
    >
      {isCalling ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Play className="w-4 h-4 mr-2" />
      )}
      {isCalling ? "Dialing Leads..." : "Start Calling"}
    </Button>
  );
}