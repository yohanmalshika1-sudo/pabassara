import type { User } from '@supabase/supabase-js';

const ADMIN_ROLES = ['super_admin', 'editor', 'dhamma_admin'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function getAdminRole(user: User | null | undefined): AdminRole | null {
  const role = user?.app_metadata?.admin_role;
  return ADMIN_ROLES.find(adminRole => adminRole === role) ?? null;
}
