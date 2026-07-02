// components/csv-upload-modal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button }  from '@/components/ui/button';
import { Label }   from '@/components/ui/label';
import { Input }   from '@/components/ui/input';
import { leadsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CSVUploadModalProps {
  open:      boolean;
  onClose:   () => void;
  campaigns: { _id: string; name: string }[];
  collegeId: string;
  onSuccess: () => void;
}

export function CSVUploadModal({
  open, onClose, campaigns, collegeId, onSuccess
}: CSVUploadModalProps) {
  const { getToken } = useAuth();
  const [file,       setFile]       = useState<File | null>(null);
  const [campaignId, setCampaignId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [state,      setState]      = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error,      setError]      = useState('');
  const [result,     setResult]     = useState<any>(null);

  const reset = () => {
    setFile(null); setCampaignId('');
    setState('idle'); setError(''); setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'text/csv' || dropped?.name.endsWith('.csv')) {
      setFile(dropped);
    } else {
      setError('Please upload a .csv file');
    }
  };

  const handleUpload = async () => {
    if (!file)       return setError('Please select a CSV file');
    if (!campaignId) return setError('Please select a campaign');

    setState('loading');
    setError('');

    try {
      const res = await leadsApi.uploadCSV(getToken, file, campaignId, collegeId);
      setResult(res);
      setState('success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setState('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-stone-200 p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-slate-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-forest-600" />
            Upload Student Leads
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Upload a CSV file of students. Required columns: name, phone, city, jee_rank
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">

          {/* File drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csv-input')?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
              'transition-all duration-200',
              isDragging
                ? 'border-forest-400 bg-forest-50'
                : file
                ? 'border-forest-300 bg-forest-50/50'
                : 'border-stone-200 hover:border-forest-300 hover:bg-stone-50'
            )}
          >
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-forest-100 rounded-xl mx-auto
                                flex items-center justify-center">
                  <FileText className="w-6 h-6 text-forest-600" />
                </div>
                <p className="font-medium text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-stone-100 rounded-xl mx-auto
                                flex items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-xs text-slate-400">
                  Supports .csv files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Campaign selector */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Assign to Campaign
            </Label>
            <select
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5
                         text-sm text-slate-700 focus:outline-none focus:ring-2
                         focus:ring-forest-500 focus:border-transparent"
            >
              <option value="">Select a campaign...</option>
              {campaigns.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* CSV format guide */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Expected CSV format:</p>
            <code className="text-xs text-slate-600 font-mono">
              name, phone, city, jee_rank<br/>
              Rahul Sharma, +919876543210, Lucknow, 12000
            </code>
          </div>

          {/* Error */}
          {(error || state === 'error') && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700
                            rounded-xl px-4 py-3 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error || 'Upload failed'}</span>
            </div>
          )}

          {/* Success */}
          {state === 'success' && result && (
            <div className="flex items-start gap-2 bg-forest-50 text-forest-700
                            rounded-xl px-4 py-3 text-sm border border-forest-100">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {result.imported || 0} leads imported.
                {result.skipped ? ` ${result.skipped} duplicates skipped.` : ''}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl border-stone-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !campaignId || state === 'loading' || state === 'success'}
              className="flex-1 rounded-xl bg-forest-700 hover:bg-forest-800 text-white"
            >
              {state === 'loading' ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : state === 'success' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Done
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Leads
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}