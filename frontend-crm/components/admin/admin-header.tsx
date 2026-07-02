"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Bell, PhoneCall, CheckCircle, Flame, AlertTriangle } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  // Dynamic system/lead notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "High Intent Lead generated for B.Tech Admissions", type: "hot", time: "5m ago", read: false },
    { id: 2, text: "Campaign 'Delhi NCR Calling' completed successfully", type: "success", time: "1h ago", read: false },
    { id: 3, text: "Exotel integration API balance is low (under 20%)", type: "warn", time: "4h ago", read: true },
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/admin/leads`);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setHasNewNotifications(false);
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-14 px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      
      {/* Interactive Search Engine Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads by name or phone…"
          className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 border-0 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all font-medium"
        />
      </form>

      {/* Header Actions & Trigger Popovers */}
      <div className="flex items-center gap-2 relative">
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200">
          <PhoneCall className="w-3.5 h-3.5" />
          New Campaign
        </button>

        {/* Bell Button + Dropdown List Container */}
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {hasNewNotifications && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Recent Notifications</span>
                <button 
                  onClick={() => setNotifications(n => n.map(item => ({ ...item, read: true })))}
                  className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Mark all read
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${!notif.read ? 'bg-emerald-50/20' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {notif.type === 'hot' && <Flame className="w-4 h-4 text-orange-500" />}
                      {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {notif.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-medium leading-normal">{notif.text}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}