import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "AGENT", specialization = "" } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { ok: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanSpecialization = String(specialization).trim() || (
      role === "ADMIN" ? "Administrator" : role === "MANAGER" ? "Project Manager" : "Team Member"
    );

    const supabaseAdmin = createAdminClient();

    // 1. Check if user already exists
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyExists = existingList?.users?.some(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (alreadyExists) {
      return NextResponse.json(
        { ok: false, error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 2. Create user with email_confirm: true (bypasses Supabase SMTP rate limits and allows instant login)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        role,
        specialization: cleanSpecialization,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { ok: false, error: authError?.message || "Failed to create authentication user." },
        { status: 400 }
      );
    }

    // 3. Create or update profile row in public.profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: authData.user.id,
      name: cleanName,
      email: cleanEmail,
      role,
      specialization: cleanSpecialization,
    }, { onConflict: "id" });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    return NextResponse.json({
      ok: true,
      message: "Account created successfully!",
      user: {
        id: authData.user.id,
        email: cleanEmail,
        name: cleanName,
        role,
        specialization: cleanSpecialization,
      },
    });
  } catch (error) {
    console.error("Signup route error:", error);
    const message = error instanceof Error ? error.message : "Internal signup error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
