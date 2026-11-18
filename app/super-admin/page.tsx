import { requireSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SuperAdminDashboard, SchoolItem, AuditItem } from '@/components/SuperAdminDashboard';

export default async function SuperAdminPage() {
  const session = await requireSuperAdmin();

  const [rawSchools, rawLogs] = await Promise.all([
    prisma.school.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        license: true,
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: { applicants: true },
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        school: { select: { name: true } },
        actorUser: { select: { name: true } },
      },
    }),
  ]);

  const schools: SchoolItem[] = rawSchools.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    level: s.level,
    npsn: s.npsn,
    whatsapp: s.whatsapp,
    address: s.address,
    registrationPrefix: s.registrationPrefix,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    applicantCount: s._count.applicants,
    license: s.license
      ? {
          id: s.license.id,
          licenseKey: s.license.licenseKey,
          planName: s.license.planName,
          status: s.license.status,
          activatedAt: s.license.activatedAt ? s.license.activatedAt.toISOString() : null,
          notes: s.license.notes,
        }
      : null,
    users: s.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    })),
  }));

  const recentLogs: AuditItem[] = rawLogs.map((l) => ({
    id: l.id,
    action: l.action,
    targetEntity: l.targetEntity,
    createdAt: l.createdAt.toISOString(),
    schoolName: l.school?.name ?? 'Platform ARA Digital',
    actorName: l.actorUser?.name ?? 'Sistem',
  }));

  return (
    <SuperAdminDashboard
      sessionName={session.name}
      sessionEmail={session.email}
      schools={schools}
      recentLogs={recentLogs}
    />
  );
}