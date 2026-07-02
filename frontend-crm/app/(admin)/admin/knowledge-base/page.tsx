"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Calendar, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackedDocument {
  _id: string;
  fileName: string;
  fileSize: string;
  chunkCount: number;
  uploadedAt: string;
  createdAt?: string;
}

export default function KnowledgeBasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<TrackedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // Fetch file list history from MongoDB on mount
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/admin/upload-knowledge");
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents history:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload-knowledge", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: `Success! Extracted and stored ${data.chunks} data points in the AI Brain.` 
        });
        setFile(null); 
        
        // Dynamic UI append: Insert the newly indexed file snapshot directly into table state
        if (data.document) {
          setDocuments((prev) => [data.document, ...prev]);
        } else {
          fetchDocuments(); // Fallback reload
        }
      } else {
        setStatus({ type: 'error', message: data.error || "Failed to upload file." });
      }
    } catch (error) {
      setStatus({ type: 'error', message: "A network error occurred." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Knowledge Base</h1>
        <p className="text-slate-500 mt-2">Upload brochures, fee structures, or placement stats as a PDF. The AI will read it, memorize it, and use it to answer student questions on phone calls.</p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 relative">
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-amber-500 mb-3" />
              <p className="text-slate-900 font-semibold">{file.name}</p>
              <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center pointer-events-none">
              <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-900 font-semibold">Click or drag a PDF here</p>
              <p className="text-slate-500 text-sm">Maximum file size 10MB</p>
            </div>
          )}
        </div>

        {status.type === 'success' && (
          <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-5 h-5" /> {status.message}
          </div>
        )}

        {status.type === 'error' && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5" /> {status.message}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading} 
            className="bg-amber-500 hover:bg-amber-600 text-white min-w-[150px]"
          >
            {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Training AI...</> : "Train AI Bot"}
          </Button>
        </div>
      </div>

      {/* Persistent Knowledge Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" /> Currently Memorized Files
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
            {documents.length} Total Documents
          </span>
        </div>

        {isLoadingDocs ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-sm font-medium">Loading server storage...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No files currently tracked on the dashboard. Upload a document above to begin training.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <th className="p-4 pl-6">Document Name</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Brain Footprint</th>
                  <th className="p-4 pr-6">Upload Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-900 flex items-center gap-2.5 max-w-[280px] truncate">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate" title={doc.fileName}>{doc.fileName}</span>
                    </td>
                    <td className="p-4 text-slate-500">{doc.fileSize}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-100">
                        {doc.chunkCount} vectors
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {(() => {
                        const dateVal = doc.createdAt || doc.uploadedAt;
                        if (!dateVal) return "Unknown Date";
                        const dateObj = new Date(dateVal);
                        return isNaN(dateObj.getTime()) 
                          ? "Unknown Date" 
                          : dateObj.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}