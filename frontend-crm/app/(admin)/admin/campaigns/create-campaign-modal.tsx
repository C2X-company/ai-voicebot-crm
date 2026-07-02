"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { createNewCampaign } from "@/lib/actions/admin";

export function CreateCampaignModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // This function safely bridges the Client UI and the Server Action
  async function onSubmit(formData: FormData) {
    setIsPending(true);
    await createNewCampaign(formData);
    setIsPending(false);
    setIsOpen(false); // Automatically closes the modal!
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription className="text-slate-500">
            Give your campaign a clear name (e.g., "B.Tech CSE 2026 Batch"). You will upload leads in the next step.
          </DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">Campaign Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="JEE Mains Candidates..." 
              required 
              className="focus-visible:ring-violet-500" 
            />
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-violet-600 hover:bg-violet-700 w-full text-white"
            >
              {isPending ? "Initializing..." : "Initialize Campaign"}
            </Button>
          </DialogFooter>
        </form>
        
      </DialogContent>
    </Dialog>
  );
}