// components/header.tsx
'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Bell, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  collegeName?: string;
}

export function Header({ collegeName }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6
                       flex items-center justify-between sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-2">
        {collegeName && (
          <div className="flex items-center gap-2 bg-forest-50 text-forest-700
                          px-3 py-1.5 rounded-lg border border-forest-100">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{collegeName}</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">
          {user?.firstName ? `Hello, ${user.firstName}` : ''}
        </span>

        <Button variant="ghost" size="icon" className="relative text-slate-500">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5
                           rounded-full bg-forest-500" />
        </Button>

        <UserButton
          appearance={{
            elements: {
              avatarBox:     'w-8 h-8',
              userButtonPopoverCard: 'shadow-lg rounded-2xl',
            }
          }}
        />
      </div>
    </header>
  );
}