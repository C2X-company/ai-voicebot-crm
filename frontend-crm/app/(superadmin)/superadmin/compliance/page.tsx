// app/(superadmin)/superadmin/compliance/page.tsx
import { ShieldCheck } from 'lucide-react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';
export const metadata = { title: 'Compliance' };
export default function CompliancePage() {
  return (
    <PlaceholderPage
      title="Compliance Monitor"
      description="Cross-tenant TRAI/DND compliance dashboard. Detect dial loops, quota violations, and blacklisted number attempts in real time."
      icon={ShieldCheck}
      backHref="/superadmin"
      backLabel="Return to Platform Overview"
      eta="Q3 2025 Sprint"
      accent="rose"
      features={[
        'Cross-tenant DND registry sync and violation alerts',
        'Calling window enforcement audit per tenant',
        'Dial-loop detection with automatic campaign pause',
        'TRAI complaint response workflow management',
      ]}
    />
  );
}