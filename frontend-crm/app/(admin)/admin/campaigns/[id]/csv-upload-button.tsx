"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadCampaignLeads } from "@/lib/actions/admin";

export function CsvUploadButton({ campaignId }: { campaignId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      
      // 1. Split the CSV by lines and remove empty ones
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      // 2. Check if the first row is a header (e.g. "Name,Phone") and skip it if true
      const hasHeader = rows[0].toLowerCase().includes('name');
      const dataRows = hasHeader ? rows.slice(1) : rows;

      // 3. Parse the commas
      const parsedLeads = dataRows.map(row => {
        const [name, phone] = row.split(',');
        return { 
          name: name?.trim() || "Unknown Student", 
          phone: phone?.trim() || "" 
        };
      }).filter(lead => lead.phone !== ""); // Only keep rows that actually have a phone number

      // 4. Send to MongoDB
      if (parsedLeads.length > 0) {
        await uploadCampaignLeads(campaignId, parsedLeads);
      }
      
      setIsUploading(false);
      
      // Reset the file input so you can upload again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    };
    
    reader.readAsText(file);
  };

  return (
    <>
      {/* Hidden file input triggered by the button */}
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <Button 
        variant="outline" 
        className="border-slate-200 text-slate-700 hover:bg-slate-50"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
        ) : (
          <UploadCloud className="w-4 h-4 mr-2 text-blue-500" />
        )}
        {isUploading ? "Processing CSV..." : "Upload CSV Leads"}
      </Button>
    </>
  );
}