// app/(agent)/agent/inbox/page.tsx
import { PhoneIncoming } from 'lucide-react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';
export const metadata = { title: 'Live Queue' };
export default function InboxPage() {
  return (
    <PlaceholderPage
      title="Live Lead Queue"
      description="Real-time queue of AI-qualified hot and warm leads. Accept warm transfers, review student context briefs, and handle live call handoffs."
      icon={PhoneIncoming}
      backHref="/agent"
      backLabel="Return to Workspace"
      eta="Q3 2025 Sprint"
      accent="blue"
      features={[
        'Priority-sorted queue with intent score and branch interest',
        'Push + in-app alert for incoming hot lead transfers',
        'Pre-call brief: AI summary, concerns, and JEE rank context',
        'One-click warm transfer acceptance from AI call',
        'Full transcript visible before picking up the call',
      ]}
    />
  );
}