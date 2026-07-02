// types/auth.ts
export type UserRole = 'superadmin' | 'admin' | 'agent';

export interface UserPublicMetadata {
  role:       UserRole;
  collegeId?: string;    // undefined for superadmin, required for admin + agent
  collegeName?: string;  // display name for header
}

export interface AuthenticatedUser {
  userId:      string;
  role:        UserRole;
  collegeId?:  string;
  collegeName?: string;
}

// Role hierarchy — higher index = more restricted
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 0,
  admin:      1,
  agent:      2,
};

// Which URL each role owns
export const ROLE_HOME: Record<UserRole, string> = {
  superadmin: '/superadmin',
  admin:      '/admin',
  agent:      '/agent',
};