import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

const COOKIE_NAME = 'daftarku_session';

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET belum diatur dengan benar di file .env');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'VERIFIER';
  schoolId: string | null;
  schoolSlug: string | null;
  schoolName: string | null;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as SessionUser['role'],
      schoolId: payload.schoolId ? String(payload.schoolId) : null,
      schoolSlug: payload.schoolSlug ? String(payload.schoolSlug) : null,
      schoolName: payload.schoolName ? String(payload.schoolName) : null,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }
  return session;
}

export async function requireSchoolAdmin(): Promise<SessionUser & { schoolId: string }> {
  const session = await getSession();
  if (
    !session ||
    (session.role !== 'SCHOOL_ADMIN' && session.role !== 'VERIFIER') ||
    !session.schoolId
  ) {
    redirect('/login');
  }

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
    include: { license: true },
  });

  if (!school || !school.isActive || school.deletedAt || school.license?.status !== 'ACTIVE') {
    redirect('/login?reason=license_inactive');
  }

  return {
    ...session,
    schoolId: session.schoolId,
  };
}

export async function getValidatedSchoolApiSession() {
  const session = await getSession();
  if (
    !session ||
    (session.role !== 'SCHOOL_ADMIN' && session.role !== 'VERIFIER') ||
    !session.schoolId
  ) {
    return null;
  }

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
    include: { license: true },
  });

  if (!school || !school.isActive || school.deletedAt || school.license?.status !== 'ACTIVE') {
    return null;
  }

  return {
    session: { ...session, schoolId: session.schoolId },
    school,
  };
}