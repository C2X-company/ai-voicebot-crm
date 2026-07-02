"use server";

import { connectToDatabase } from "@/lib/db";
import { Tenant } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { PlatformConfig } from "@/lib/models"; // Add PlatformConfig to your imports at the top!


// 1. Fetch count for the Overview Dashboard
export async function getPlatformMetrics() {
  try {
    await connectToDatabase();
    const activeTenantsCount = await Tenant.countDocuments();
    return { activeTenants: activeTenantsCount, success: true };
  } catch (error) {
    console.error("Failed to fetch platform metrics:", error);
    return { activeTenants: 0, success: false };
  }
}

// 2. Fetch the actual list of all tenants (Colleges)
export async function getAllTenants() {
  try {
    await connectToDatabase();
    // Fetch all tenants, sorted by newest first
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
    
    // We stringify and parse to safely pass MongoDB Data to Next.js Client/Server components
    return JSON.parse(JSON.stringify(tenants));
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    return [];
  }
}

// 3. Create a new tenant from the UI form
export async function createTenant(formData: FormData) {
  try {
    await connectToDatabase();
    
    const name = formData.get("name") as string;
    const clerkAdminId = formData.get("clerkAdminId") as string;
    const plan = formData.get("plan") as string;

    // GENERATE UNIQUE SLUG & NAMESPACE
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const uniqueNamespace = `ns-${uniqueSlug}`; // e.g., ns-iit-bombay-a7x9

    await Tenant.create({
      name,
      slug: uniqueSlug,
      pineconeNamespace: uniqueNamespace, // <-- Pass the new namespace to MongoDB
      clerkAdminId, 
      plan,
      apiKeys: {
        vapi: 'pending',
        openai: 'pending',
        exotel: 'pending'
      }
    });

    // Instantly refresh the UI
    revalidatePath("/superadmin/tenants");
    revalidatePath("/superadmin");
    
  } catch (error) {
    console.error("❌ DATABASE CREATION ERROR:", error);
  }
}

// --- PLATFORM SETTINGS ACTIONS ---

export async function getPlatformSettings() {
  try {
    await connectToDatabase();
    // Find the master config. If it doesn't exist, create it.
    let config = await PlatformConfig.findOne().lean();
    if (!config) {
      const newConfig = await PlatformConfig.create({});
      config = newConfig.toObject();
    }
    return JSON.parse(JSON.stringify(config));
  } catch (error) {
    console.error("Failed to fetch platform settings:", error);
    return null;
  }
}

export async function updatePlatformSettings(formData: FormData) {
  try {
    await connectToDatabase();
    
    // We only ever have one global config document, so we update the first one we find
    const config = await PlatformConfig.findOne();
    if (!config) return;

    // Check which form was submitted (General vs Integrations vs Security)
    const formType = formData.get("formType");

    if (formType === "general") {
      config.platformName = formData.get("platformName") as string;
      config.supportEmail = formData.get("supportEmail") as string;
    } 
    else if (formType === "integrations") {
      config.masterApiKeys = {
        openai: formData.get("openaiKey") as string,
        vapi: formData.get("vapiKey") as string,
        exotel: formData.get("exotelKey") as string,
      };
    }
    else if (formType === "security") {
      config.enforceMFA = formData.get("enforceMFA") === "true";
    }

    await config.save();
    
    revalidatePath("/superadmin/setting"); // Refresh the UI
  } catch (error) {
    console.error("Failed to update settings:", error);
  }
}

// 4. Update specific tenant API keys
export async function updateTenantApiKeys(formData: FormData) {
  try {
    await connectToDatabase();
    
    const tenantId = formData.get("tenantId") as string;
    
    // Grab the values from the inputs
    const vapi = formData.get("vapiKey") as string;
    const exotel = formData.get("exotelKey") as string;
    const openai = formData.get("openaiKey") as string;

    // Update the specific college in the database
    await Tenant.findByIdAndUpdate(tenantId, {
      "apiKeys.vapi": vapi || 'pending',
      "apiKeys.exotel": exotel || 'pending',
      "apiKeys.openai": openai || 'pending'
    });

    // Instantly refresh the UI
    revalidatePath("/superadmin/tenants");
    revalidatePath("/superadmin");
    
  } catch (error) {
    console.error("❌ DATABASE UPDATE ERROR:", error);
  }
}