import { hashPassword, verifyPassword, createSessionToken } from "../src/lib/auth";
import { prisma } from "../src/lib/db";

async function verifyAuth() {
  console.log("Verifying demo accounts in database...");
  const admin = await prisma.user.findUnique({ where: { email: "admin@novaworks.example" } });
  console.log("Admin account found:", !!admin);
  if (admin) {
    const isPass = await verifyPassword("Demo123!", admin.passwordHash);
    console.log("Password check for Demo123!:", isPass);
    const token = await createSessionToken(admin.id);
    console.log("Generated session token length:", token.length);
  }
}

verifyAuth().finally(() => prisma.$disconnect());
