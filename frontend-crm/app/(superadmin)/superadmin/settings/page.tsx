import { requireSuperadmin } from "@/lib/auth";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/actions/superadmin";
import { Building2, Key, Shield, Webhook, Save, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export const metadata = { title: 'Global Settings | Superadmin' };

// In Next.js 15, searchParams must be awaited as a Promise
export default async function SuperadminSettingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireSuperadmin();
  
  // 1. Fetch live settings from MongoDB
  const settings = await getPlatformSettings();
  
  // 2. Resolve URL parameters to determine active tab
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "general";

  const navItems = [
    { id: "general", label: "Platform Identity", icon: Building2 },
    { id: "integrations", label: "Master API Keys", icon: Key },
    { id: "webhooks", label: "Global Webhooks", icon: Webhook },
    { id: "security", label: "Security Policies", icon: Shield },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-2">
          Manage global configurations, API integrations, and security policies across all tenants.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation (URL-Based) */}
        <nav className="flex flex-row md:flex-col gap-2 w-full md:w-64 shrink-0 overflow-x-auto pb-4 md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={`?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? "bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-slate-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form action={updatePlatformSettings}>
                <input type="hidden" name="formType" value="general" />
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100">Platform Identity</CardTitle>
                    <CardDescription className="text-slate-400">Configure how the CRM presents itself to your college administrators.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="platformName" className="text-slate-300">Platform Name</Label>
                        <Input id="platformName" name="platformName" defaultValue={settings?.platformName} required className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-violet-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail" className="text-slate-300">Global Support Email</Label>
                        <Input id="supportEmail" name="supportEmail" defaultValue={settings?.supportEmail} required className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-violet-500" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-800 bg-slate-900/50 px-6 py-4">
                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white ml-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === "integrations" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form action={updatePlatformSettings}>
                <input type="hidden" name="formType" value="integrations" />
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100">Master API Keys</CardTitle>
                    <CardDescription className="text-slate-400">
                      These keys are used for platform-wide metering. Individual tenants can override these in their own settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-500" />
                        <Label className="font-semibold text-slate-200">OpenAI Configuration</Label>
                      </div>
                      <Input type="password" name="openaiKey" placeholder="sk-proj-..." defaultValue={settings?.masterApiKeys?.openai} className="font-mono text-sm bg-slate-950 border-slate-800 text-slate-400 focus-visible:ring-violet-500" />
                    </div>
                    
                    <div className="space-y-3 pt-5 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-500" />
                        <Label className="font-semibold text-slate-200">Vapi / Telephony Provider</Label>
                      </div>
                      <Input type="password" name="vapiKey" placeholder="vapi-..." defaultValue={settings?.masterApiKeys?.vapi} className="font-mono text-sm bg-slate-950 border-slate-800 text-slate-400 focus-visible:ring-violet-500" />
                    </div>

                    <div className="space-y-3 pt-5 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-rose-500" />
                        <Label className="font-semibold text-slate-200">Exotel API Key</Label>
                      </div>
                      <Input type="password" name="exotelKey" placeholder="exotel_..." defaultValue={settings?.masterApiKeys?.exotel} className="font-mono text-sm bg-slate-950 border-slate-800 text-slate-400 focus-visible:ring-violet-500" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Keys are encrypted at rest using AES-256.</p>
                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Update Keys
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form action={updatePlatformSettings}>
                <input type="hidden" name="formType" value="security" />
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100">Global Security Policies</CardTitle>
                    <CardDescription className="text-slate-400">Enforce strict security requirements across all connected colleges.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base text-slate-200">Enforce Multi-Factor Authentication (MFA)</Label>
                        <p className="text-sm text-slate-500">Require all Admin and Agent accounts to use 2FA via Clerk.</p>
                      </div>
                      <Switch name="enforceMFA" value="true" defaultChecked={settings?.enforceMFA} className="data-[state=checked]:bg-violet-600" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-800 bg-slate-900/50 px-6 py-4">
                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white ml-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Save Policies
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          )}
          
          {/* WEBHOOKS TAB */}
          {activeTab === "webhooks" && (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Webhook className="h-10 w-10 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No Webhooks Configured</h3>
              <p className="mt-2 text-sm text-slate-500 text-center max-w-sm">
                Global webhooks for billing events and tenant provisioning will appear here.
              </p>
              <Button variant="outline" className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                Add First Endpoint
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}