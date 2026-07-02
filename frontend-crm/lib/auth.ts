// lib/auth.ts
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect }  from 'next/navigation';
import type { UserRole, AuthenticatedUser } from '@/types/auth';

export async function getServerAuth(): Promise<AuthenticatedUser> {
  const { userId, orgId, orgRole } = await auth();

  // 🚨 TERMINAL DEBUGGING: This will print in your VS Code terminal
  console.log(`[AUTH CHECK] User: ${userId}, Org: ${orgId}, Role: ${orgRole}`);

  // 1. Not logged in
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Not in an active organization session
  if (!orgId) {
    console.log("[AUTH CHECK] No active organization session. Redirecting to workspace selector.");
    redirect('/unauthorized');
  }

  // 3. Map Clerk's orgRole to your app's internal UserRole
  let mappedRole: UserRole = 'agent'; 
  
  if (orgRole === 'org:admin') {
    mappedRole = 'admin';
  }

  // 4. Fetch the actual College Name
  let collegeName = 'Workspace';
  try {
    const client = await clerkClient();
    const org = await client.organizations.getOrganization({ organizationId: orgId });
    if (org.name) {
      collegeName = org.name;
    }
  } catch (error) {
    console.error("[AUTH CHECK] Failed to fetch organization details:", error);
  }

  return {
    userId,
    role: mappedRole,
    collegeId: orgId, 
    collegeName: collegeName,
  };
}

export async function requireRole(
  allowedList: UserRole | UserRole[]
): Promise<AuthenticatedUser> {
  const user = await getServerAuth();
  const allowedArray = Array.isArray(allowedList) ? allowedList : [allowedList];

  // If the user's mapped role isn't in the allowed list, boot them
  if (!allowedArray.includes(user.role)) {
    console.log(`[AUTH CHECK] Access Denied. User role '${user.role}' not in allowed list.`);
    redirect('/unauthorized');
  }

  return user;
}

// ── Convenience wrappers ────────────────────────────────────────────────────
export const requireSuperadmin = () => requireRole('superadmin');
export const requireAdmin      = () => requireRole(['admin', 'superadmin']);
export const requireAgent      = () => requireRole(['agent', 'admin', 'superadmin']);

export function getTenantFilter(
  user: AuthenticatedUser,
  overrideCollegeId?: string
): { college?: string } {
  if (user.role === 'superadmin') {
    return overrideCollegeId ? { college: overrideCollegeId } : {};
  }
  return { college: user.collegeId };
}