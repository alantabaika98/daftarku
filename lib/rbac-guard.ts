// Sistem Pengamanan & Isolasi Tenant (RBAC Guard) untuk DaftarKu SaaS

export interface TenantSession {
  userId: string;
  role: 'SUPERADMIN' | 'SCHOOL_ADMIN' | 'APPLICANT';
  schoolId?: string;
  email: string;
}

/**
 * Memeriksa apakah sesi pengguna berhak mengakses data tenant sekolah tertentu.
 * Superadmin dapat mengakses semua tenant, sedangkan Admin Sekolah hanya tenant miliknya.
 */
export function assertTenantAccess(session: TenantSession, targetSchoolId: string): boolean {
  if (!session) return false;
  if (session.role === 'SUPERADMIN') return true;
  if (session.role === 'SCHOOL_ADMIN' && session.schoolId === targetSchoolId) return true;
  return false;
}

/**
 * Helper untuk menyusun query Prisma yang aman terhadap kebocoran data antar sekolah.
 */
export function getTenantQueryFilter(session: TenantSession) {
  if (session.role === 'SUPERADMIN') {
    return {}; // Superadmin melihat semua data
  }
  return {
    schoolId: session.schoolId || 'unauthorized-tenant',
  };
}