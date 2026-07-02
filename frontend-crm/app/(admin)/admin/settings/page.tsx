"use client";

import { Save, Key, Bot, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-2">Manage your AI configurations, API keys, and voice preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Navigation (Visual only) */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium cursor-pointer">
            <Key className="w-5 h-5" /> API Keys
          </div>
          <div className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium cursor-pointer transition-colors">
            <Bot className="w-5 h-5" /> AI Behavior
          </div>
          <div className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium cursor-pointer transition-colors">
            <ShieldCheck className="w-5 h-5" /> Security
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">API Credentials</h2>
              <p className="text-sm text-slate-500 mt-1">These keys connect your CRM to the external AI engines. Keep them secure.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pinecone API Key</label>
                <input 
                  type="password" 
                  defaultValue="pc-sk-************************"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Google Gemini API Key</label>
                <input 
                  type="password" 
                  defaultValue="AIzaSy************************"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sarvam AI Token</label>
                <input 
                  type="password" 
                  defaultValue="sk-sarvam-************************"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Voice Configuration</h2>
              <p className="text-sm text-slate-500 mt-1">Select how your AI sounds to the students over the phone.</p>
            </div>
            
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="voice" className="peer sr-only" defaultChecked />
                <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center font-medium text-slate-700 peer-checked:text-indigo-700 transition-all">
                  🎙️ Sarvam Female (Default)
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="voice" className="peer sr-only" />
                <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center font-medium text-slate-700 peer-checked:text-indigo-700 transition-all">
                  🎙️ Sarvam Male
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}