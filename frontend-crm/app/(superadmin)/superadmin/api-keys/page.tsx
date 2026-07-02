// app/(superadmin)/superadmin/api-keys/page.tsx
import { KeyRound } from 'lucide-react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';
export const metadata = { title: 'API Keys' };
export default function ApiKeysPage() {
  return (
    <PlaceholderPage
      title="API Key Vault"
      description="Centrally manage and rotate API credentials for all integrated services across every tenant. Keys are stored encrypted at rest."
      icon={KeyRound}
      backHref="/superadmin"
      backLabel="Return to Platform Overview"
      eta="Q3 2025 Sprint"
      accent="amber"
      features={[
        'Encrypted storage for Vapi, Exotel, Sarvam, and OpenAI keys',
        'Per-tenant key scoping with rotation reminders',
        'Expiry tracking with automated alert emails',
        'Audit log of all key access and modifications',
      ]}
    />
  );
}