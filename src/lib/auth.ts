import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRATION = "8h";

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "novaworks-infinity-hack-super-secure-secret-key-32-chars-minimum";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization: string;
  skills: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId === "string") {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }

    const payload = await verifySessionToken(sessionCookie.value);
    if (!payload?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        skills: true,
      },
    });

    if (!user) {
      return null;
    }

    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(user.skills);
    } catch {
      parsedSkills = [];
    }

    return {
      ...user,
      skills: parsedSkills,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
