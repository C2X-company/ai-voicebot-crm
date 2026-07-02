// app/(superadmin)/superadmin/billing/page.tsx
import { CreditCard } from 'lucide-react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';
export const metadata = { title: 'Billing' };
export default function BillingPage() {
  return (
    <PlaceholderPage
      title="Billing & Revenue"
      description="Platform-wide revenue tracking, per-tenant invoicing, margin analysis, and subscription lifecycle management."
      icon={CreditCard}
      backHref="/superadmin"
      backLabel="Return to Platform Overview"
      eta="Q3 2025 Sprint"
      accent="emerald"
      features={[
        'MRR and ARR tracking with month-over-month trends',
        'Per-tenant cost breakdown (telephony + LLM + voice)',
        'Automated invoice generation and email delivery',
        'Platform margin dashboard: revenue vs. API costs',
      ]}
    />
  );
}