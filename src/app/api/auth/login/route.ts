import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSessionToken, hashPassword, SESSION_COOKIE_NAME } from "@/lib/auth";

const FALLBACK_DEMO_USERS: Record<
  string,
  {
    id: string;
    name: string;
    role: string;
    specialization: string;
    skills: string[];
  }
> = {
  "admin@novaworks.example": {
    id: "ADMIN",
    name: "Admin",
    role: "ADMIN",
    specialization: "Administrator",
    skills: ["Company overview", "transcript creation"],
  },
  "ayesha@novaworks.example": {
    id: "PM01",
    name: "Ayesha Khan",
    role: "MANAGER",
    specialization: "Manager / Web PM",
    skills: ["Web projects", "client coordination"],
  },
  "bilal@novaworks.example": {
    id: "PM02",
    name: "Bilal Ahmed",
    role: "MANAGER",
    specialization: "Manager / Mobile PM",
    skills: ["Mobile projects", "delivery planning"],
  },
  "hina@novaworks.example": {
    id: "PM03",
    name: "Hina Malik",
    role: "MANAGER",
    specialization: "Manager / AI PM",
    skills: ["AI projects", "requirement review"],
  },
  "ali@novaworks.example": {
    id: "DEV01",
    name: "Ali Raza",
    role: "AGENT",
    specialization: "Agent / Full-Stack",
    skills: ["React", "frontend integration"],
  },
  "hamza@novaworks.example": {
    id: "DEV02",
    name: "Hamza Shah",
    role: "AGENT",
    specialization: "Agent / Full-Stack",
    skills: ["Node.js", "databases", "APIs"],
  },
  "sara@novaworks.example": {
    id: "DEV03",
    name: "Sara Noor",
    role: "AGENT",
    specialization: "Agent / App Developer",
    skills: ["Flutter", "mobile UI"],
  },
  "usman@novaworks.example": {
    id: "DEV04",
    name: "Usman Tariq",
    role: "AGENT",
    specialization: "Agent / App Developer",
    skills: ["Flutter", "integration", "testing"],
  },
  "zain@novaworks.example": {
    id: "DEV05",
    name: "Zain Abbas",
    role: "AGENT",
    specialization: "Agent / AI Developer",
    skills: ["LLMs", "extraction", "prompts"],
  },
  "maryam@novaworks.example": {
    id: "DEV06",
    name: "Maryam Asif",
    role: "AGENT",
    specialization: "Agent / AI Developer",
    skills: ["Retrieval", "document processing"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Auto-heal / on-demand seeder if database was not seeded yet
    if (!user && FALLBACK_DEMO_USERS[normalizedEmail] && password === "Demo123!") {
      const demoData = FALLBACK_DEMO_USERS[normalizedEmail];
      const defaultHash = await hashPassword("Demo123!");

      user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          id: demoData.id,
          name: demoData.name,
          role: demoData.role,
          specialization: demoData.specialization,
          skills: JSON.stringify(demoData.skills),
          passwordHash: defaultHash,
        },
        create: {
          id: demoData.id,
          name: demoData.name,
          email: normalizedEmail,
          role: demoData.role,
          specialization: demoData.specialization,
          skills: JSON.stringify(demoData.skills),
          passwordHash: defaultHash,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password, with instant match for Demo123! on demo accounts
    let isValid = false;
    if (password === "Demo123!" && FALLBACK_DEMO_USERS[normalizedEmail]) {
      isValid = true;
    } else {
      isValid = await verifyPassword(password, user.passwordHash);
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSessionToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        specialization: user.specialization,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
