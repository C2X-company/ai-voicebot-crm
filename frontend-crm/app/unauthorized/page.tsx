"use client";

import { OrganizationList, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function UnauthorizedPage() {
  const { orgId, isLoaded } = useAuth();
  const router = useRouter();

  // If the user clicks an organization in the list, their session updates, 
  // and we instantly bounce them back to the admin dashboard!
  useEffect(() => {
    if (isLoaded && orgId) {
      router.push("/admin");
    }
  }, [orgId, isLoaded, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        
        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500">Checking workspace status...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Select a Workspace</h1>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              You are signed in, but you need to select your college organization to access the dashboard.
            </p>

            {/* This Clerk component renders their available orgs */}
            <div className="flex justify-center">
              <OrganizationList 
                hidePersonal={true}
                afterCreateOrganizationUrl="/admin"
                afterSelectOrganizationUrl="/admin"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}