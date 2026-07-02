import { requireSuperadmin } from "@/lib/auth";
import { getAllTenants, createTenant, updateTenantApiKeys } from "@/lib/actions/superadmin";
import { Building2, Plus, Server, Activity, Key, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

export const metadata = { title: "Tenants | Superadmin" };

// SMART UI LOGIC: If it's a real key (not missing/pending), turn it green!
function KeyStatus({ status }: { status?: string }) {
  if (!status || status === 'missing') {
    return (
      <div className="flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[11px] text-red-400 font-medium">Missing</span>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span className="text-[11px] text-amber-400 font-medium">Pending</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span className="text-[11px] text-emerald-400 font-medium">Active</span>
    </div>
  );
}

export default async function SuperadminTenantsPage() {
  await requireSuperadmin();
  const tenants = await getAllTenants() || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Page Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Tenant Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Provision new colleges, assign subscription tiers, and monitor access.
          </p>
        </div>

        {/* Create Tenant Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Provision New College
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Provision New Tenant</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new isolated database environment and dashboard for a college.
              </DialogDescription>
            </DialogHeader>
            <form action={createTenant} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">College Name</Label>
                <Input id="name" name="name" placeholder="e.g. BITS Pilani" required className="bg-slate-950 border-slate-800 focus-visible:ring-violet-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clerkAdminId" className="text-slate-300">Admin Clerk ID</Label>
                <Input id="clerkAdminId" name="clerkAdminId" placeholder="user_2X9..." required className="bg-slate-950 border-slate-800 focus-visible:ring-violet-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan" className="text-slate-300">Subscription Tier</Label>
                <Select name="plan" defaultValue="Starter">
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="Starter">Starter (5,000 mins)</SelectItem>
                    <SelectItem value="Growth">Growth (20,000 mins)</SelectItem>
                    <SelectItem value="Enterprise">Enterprise (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full text-white">Initialize Infrastructure</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* The Dynamic Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <Server className="w-4 h-4 text-violet-400 mr-2" />
          <h2 className="text-sm font-semibold text-slate-200">Deployed Environments</h2>
          <Badge variant="outline" className="ml-3 bg-slate-800 border-slate-700 text-slate-300 text-[10px]">
            {tenants.length} Total
          </Badge>
        </div>

        {tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No colleges provisioned yet</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">College ID / Name</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Vapi</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Exotel</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">OpenAI</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant: any) => (
                  <tr key={tenant.orgId} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{tenant.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tenant.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={
                        tenant.plan?.toLowerCase() === 'enterprise' ? 'border-violet-500/30 text-violet-400 bg-violet-500/10' :
                        tenant.plan?.toLowerCase() === 'growth' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                        'border-slate-600 text-slate-300 bg-slate-800'
                      }>
                        {tenant.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4"><KeyStatus status={tenant.apiKeys?.vapi} /></td>
                    <td className="px-6 py-4"><KeyStatus status={tenant.apiKeys?.exotel} /></td>
                    <td className="px-6 py-4"><KeyStatus status={tenant.apiKeys?.openai} /></td>
                    
                    <td className="px-6 py-4 text-right">
                      {/* NEW EDIT KEYS MODAL */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300">
                            <Key className="w-3.5 h-3.5 mr-2 text-violet-400" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Configure Integrations</DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Set specific API keys for <strong className="text-slate-200">{tenant.name}</strong>. If left as 'pending', global master keys will be used.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <form action={updateTenantApiKeys} className="space-y-4 py-4">
                            {/* Hidden input to pass the DB ID to the server */}
                            <input type="hidden" name="tenantId" value={tenant.orgId} />
                            
                            <div className="space-y-2">
                              <Label className="text-slate-300">OpenAI API Key</Label>
                              <Input name="openaiKey" defaultValue={tenant.apiKeys?.openai === 'pending' || tenant.apiKeys?.openai === 'missing' ? '' : tenant.apiKeys?.openai} placeholder="sk-proj-..." className="bg-slate-950 border-slate-800 font-mono text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-300">Vapi Key</Label>
                              <Input name="vapiKey" defaultValue={tenant.apiKeys?.vapi === 'pending' || tenant.apiKeys?.vapi === 'missing' ? '' : tenant.apiKeys?.vapi} placeholder="vapi-..." className="bg-slate-950 border-slate-800 font-mono text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-300">Exotel Credentials</Label>
                              <Input name="exotelKey" defaultValue={tenant.apiKeys?.exotel === 'pending' || tenant.apiKeys?.exotel === 'missing' ? '' : tenant.apiKeys?.exotel} placeholder="exotel_..." className="bg-slate-950 border-slate-800 font-mono text-sm" />
                            </div>
                            <DialogFooter className="pt-4">
                              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 w-full text-white">Save Configuration</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}