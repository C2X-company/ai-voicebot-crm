// app/(agent)/agent/post-call/page.tsx
import { PhoneCall } from 'lucide-react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';
export const metadata = { title: 'Post-Call' };
export default function PostCallPage() {
  return (
    <PlaceholderPage
      title="Post-Call Workspace"
      description="Review completed calls, tag dispositions, schedule follow-ups, and track your personal conversion pipeline."
      icon={PhoneCall}
      backHref="/agent"
      backLabel="Return to Workspace"
      eta="Q3 2025 Sprint"
      accent="emerald"
      features={[
        'Recording playback with searchable transcript scrubber',
        'One-click disposition tagging: Enrolled / Callback / No Interest',
        'Follow-up date scheduler with calendar sync',
        'Personal conversion funnel and daily performance stats',
        'Internal note-taking with @mention for team collaboration',
      ]}
    />
  );
}