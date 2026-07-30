"use server"; 

import mongoose from "mongoose";
import { PlatformConfig } from "@/lib/models"; 
import { connectToDatabase } from "@/lib/db";
import { Tenant, Campaign, Lead } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

// 1. Core function to securely get the logged-in user's College (Tenant)
export async function getCurrentAdminTenant() {
  try {
    const { userId, orgId } = await auth();
    
    // 🚨 Guard Clause 1: Not logged in at all
    if (!userId) {
      console.log("No userId found in session.");
      return null;
    }

    await connectToDatabase();

    // 🚨 SCENARIO A: Clerk passed the orgId perfectly
    if (orgId && orgId.startsWith('org_')) {
      let tenant = await Tenant.findOne({ orgId }).lean();

      if (!tenant) {
        console.log(`✨ New Organization detected! Auto-provisioning MongoDB for ${orgId}`);
        try {
          const client = await clerkClient();
          const clerkOrg = await client.organizations.getOrganization({ organizationId: orgId });

          const newTenant = await Tenant.create({
            orgId: orgId,
            name: clerkOrg.name || "New College Workspace", 
            slug: clerkOrg.slug || `org-${Date.now()}`,
            pineconeNamespace: orgId, 
            clerkAdminId: userId,
            plan: 'Starter'
          });
          tenant = newTenant.toObject();
        } catch (clerkErr) {
          console.error("❌ Failed to fetch from Clerk or create tenant:", clerkErr);
          return null; 
        }
      }
      return JSON.parse(JSON.stringify(tenant));
    }

    // 🚨 SCENARIO B: No orgId in session. Let's try the safe fallback.
    console.log(`⚠️ No active orgId in session. Checking Clerk for user's organizations...`);
    try {
        const client = await clerkClient();
        const userOrgs = await client.users.getOrganizationMembershipList({ userId });
        
        if (userOrgs && userOrgs.data && userOrgs.data.length > 0 && userOrgs.data[0].organization) {
          
          const fallbackOrgId = userOrgs.data[0].organization.id;
          const fallbackOrgName = userOrgs.data[0].organization.name;
          
          if (!fallbackOrgId || !fallbackOrgId.startsWith('org_')) {
              console.log("❌ Invalid fallback Org ID found.");
              return null;
          }

          console.log(`Found fallback org: ${fallbackOrgName} (${fallbackOrgId})`);
          
          let tenant = await Tenant.findOne({ orgId: fallbackOrgId }).lean();
          
          if (!tenant) {
             console.log(`✨ Auto-provisioning fallback MongoDB for ${fallbackOrgId}`);
             const newTenant = await Tenant.create({
                orgId: fallbackOrgId,
                name: fallbackOrgName || "New College Workspace", 
                slug: userOrgs.data[0].organization.slug || `org-${Date.now()}`,
                pineconeNamespace: fallbackOrgId, 
                clerkAdminId: userId,
                plan: 'Starter'
              });
              tenant = newTenant.toObject();
          }
          return JSON.parse(JSON.stringify(tenant));
        }
    } catch (fallbackErr) {
        console.error("❌ Fallback Clerk check failed. User likely has no orgs yet:", fallbackErr);
        return null;
    }

    console.log("❌ User does not belong to any organizations.");
    return null;

  } catch (error) {
    console.error("🚨 Critical Auth error in getCurrentAdminTenant:", error);
    return null;
  }
}

// 2. Fetch the dynamic stats for the Admin Overview Dashboard
export async function getAdminDashboardStats(tenantId: string) {
  try {
    await connectToDatabase();
    
    // 🚨 FIXED: Querying by tenantId instead of college
    const [totalLeads, activeCampaigns, completedCalls] = await Promise.all([
      Lead.countDocuments({ tenantId: tenantId }),
      Campaign.countDocuments({ tenantId: tenantId, status: 'Active' }),
      Lead.countDocuments({ tenantId: tenantId, status: { $in: ['Called', 'Converted', 'not_interested', 'qualified', 'transferred', 'enrolled'] } })
    ]);

    const convertedCount = await Lead.countDocuments({ tenantId: tenantId, status: { $in: ['Converted', 'qualified', 'enrolled'] } });
    const conversionRate = completedCalls > 0 ? ((convertedCount / completedCalls) * 100).toFixed(1) : "0.0";

    return {
      totalLeads,
      activeCampaigns,
      completedCalls,
      conversionRate: `${conversionRate}%`,
      success: true
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { success: false };
  }
}

// 3. Fetch Campaigns for the Table
export async function getAdminCampaigns() {
  try {
    const tenant = await getCurrentAdminTenant();
    if (!tenant) return [];

    await connectToDatabase();
    
    // 🚨 FIXED: Searching by tenantId
    const campaigns = await Campaign.find({ tenantId: tenant.orgId })
      .sort({ createdAt: -1 })
      .lean();
      
    return JSON.parse(JSON.stringify(campaigns));
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return [];
  }
}

// 4. Create a New Campaign
export async function createNewCampaign(formData: FormData) {
  try {
    const tenant = await getCurrentAdminTenant();
    if (!tenant) throw new Error("Unauthorized");

    await connectToDatabase();

    const name = formData.get("name") as string;

    // 🚨 FIXED: Saving exact tenantId expected by the Schema
    await Campaign.create({
      tenantId: tenant.orgId, 
      name,
      status: 'Draft',
      totalLeads: 0,
      completedCalls: 0,
      conversionRate: 0
    });

    revalidatePath("/admin/campaigns");
    revalidatePath("/admin");

  } catch (error) {
    console.error("Failed to create campaign:", error);
  }
}

// 5. Fetch a Single Campaign by ID
export async function getCampaignById(campaignId: string) {
  try {
    await connectToDatabase();
    const cleanId = campaignId.trim();

    const allCampaigns = await Campaign.find().lean();
    const campaign = allCampaigns.find((c: any) => c._id.toString() === cleanId);
    
    if (!campaign) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(campaign));
  } catch (error) {
    console.error("🚨 Error fetching campaign:", error);
    return null;
  }
}

// 6. Fetch Leads for a specific Campaign
export async function getCampaignLeads(campaignId: string) {
  try {
    await connectToDatabase();
    const cleanId = campaignId.trim();

    const allLeads = await Lead.find().sort({ createdAt: -1 }).lean();
    const leads = allLeads.filter((l: any) => l.campaignId?.toString() === cleanId);
      
    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("🚨 Error fetching leads:", error);
    return [];
  }
}

// 7. Upload CSV Leads to a Campaign
export async function uploadCampaignLeads(campaignId: string, leads: { name: string, phone: string }[]) {
  try {
    const tenant = await getCurrentAdminTenant();
    if (!tenant) throw new Error("Unauthorized");

    await connectToDatabase();

    // 🚨 FIXED: Mapping leads to 'New' to match your Mongoose enum
    const leadDocs = leads.map(lead => ({
      tenantId: tenant.orgId, 
      campaignId: campaignId,
      name: lead.name,
      phone: lead.phone,
      status: 'New' // Changed from 'pending' to 'New'
    }));

    try {
      await Lead.insertMany(leadDocs, { ordered: false });
    } catch (insertError: any) {
      if (insertError.code !== 11000) throw insertError; 
    }

    const actualLeadCount = await Lead.countDocuments({ campaignId, tenantId: tenant.orgId });
    
    await Campaign.findByIdAndUpdate(campaignId, {
      totalLeads: actualLeadCount
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin");

    return { success: true, count: actualLeadCount };
  } catch (error) {
    console.error("Failed to upload leads:", error);
    return { success: false, error: "Upload failed. Please check your CSV format." };
  }
}

// 8. Trigger Vapi AI Outbound Calls
export async function startCampaignCalls(campaignId: string) {
  try {
    const tenant = await getCurrentAdminTenant();
    if (!tenant) throw new Error("Unauthorized");

    await connectToDatabase();

    let vapiKey = tenant.apiKeys?.vapi;
    if (!vapiKey || vapiKey === 'pending' || vapiKey === 'missing') {
      const globalConfig = await PlatformConfig.findOne().lean();
      vapiKey = globalConfig?.masterApiKeys?.vapi;
    }

    if (!vapiKey) return { success: false, error: "No Vapi API key configured." };

    // 🚨 FIXED: Querying leads by 'New' status
    const pendingLeads = await Lead.find({ 
      campaignId, 
      tenantId: tenant.orgId, 
      status: 'New' // Changed from 'pending' to 'New'     
    }).sort({ createdAt: 1 }); 

    if (pendingLeads.length === 0) return { success: false, error: "No pending leads to call." };

    await Campaign.findByIdAndUpdate(campaignId, { status: 'active' });

    await Lead.updateMany(
      { _id: { $in: pendingLeads.map(l => l._id) } },
      { $set: { status: 'Queued' } } // Changed from 'pending' to 'Queued'
    );

    const firstLead = pendingLeads[0];

    try {
      await Lead.findByIdAndUpdate(firstLead._id, { status: 'Calling' }); // Changed to capital 'Calling'

      const ASSISTANT_ID = "b9e32915-6885-4814-819f-3f32d179ee67";
      const PHONE_NUMBER_ID = "5900a887-8044-4953-a946-f46d7d7cf74b";

      const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: ASSISTANT_ID, 
          phoneNumberId: PHONE_NUMBER_ID,
          customer: {
            number: firstLead.phone,
            name: firstLead.name,
          },
          assistantOverrides: {
            variableValues: {
              collegeName: tenant.name || "Our University",
              agentName: "Rahul" 
            }
          },
          metadata: {
            orgId: tenant.orgId.toString(),
            leadId: firstLead._id.toString(),
            campaignId: campaignId.toString()
          }
        })
      });

      if (!vapiResponse.ok) {
        const errorData = await vapiResponse.json();
        console.error(`Vapi failed to start campaign on first lead:`, errorData);
        await Lead.findByIdAndUpdate(firstLead._id, { status: 'New' });
        return { success: false, error: "Vapi rejected the first call." };
      }

    } catch (err) {
      console.error(`Network error starting campaign:`, err);
      await Lead.findByIdAndUpdate(firstLead._id, { status: 'New' });
      return { success: false, error: "Network error triggering Vapi." };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/admin/campaigns/${campaignId}`);
    revalidatePath("/admin");

    return { success: true };
    
  } catch (error) {
    console.error("Failed to start campaign:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

// 9. Fetch ALL leads for the Admin Leads Page
export async function getAllAdminLeads() {
  try {
    const tenant = await getCurrentAdminTenant();
    if (!tenant) return [];

    await connectToDatabase();
    
    // 🚨 FIXED: Querying leads by tenantId
    const leads = await Lead.find({ tenantId: tenant.orgId })
      .sort({ createdAt: -1 })
      .lean();
      
    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("Failed to fetch all leads:", error);
    return [];
  }
}
