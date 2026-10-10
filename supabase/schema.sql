-- ==============================================================================
-- GENESIS CRM SUPABASE SCHEMA
-- Run this in your Supabase Project's SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  demo_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'AGENT')),
  specialization TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  industry TEXT DEFAULT '',
  representative_name TEXT DEFAULT '',
  representative_phone TEXT DEFAULT '',
  manager_id TEXT DEFAULT '',
  manager TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT DEFAULT '',
  manager_id TEXT NOT NULL,
  manager TEXT NOT NULL,
  deadline DATE NOT NULL,
  closed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee_id TEXT NOT NULL,
  assignee TEXT NOT NULL,
  deadline DATE NOT NULL,
  estimated_hours NUMERIC(5,2) DEFAULT 1 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all profiles & data for collaboration
CREATE POLICY "Allow read profiles for authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow read clients for authenticated users" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert/update clients for authenticated users" ON public.clients FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read projects for authenticated users" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all projects operations for authenticated users" ON public.projects FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read tasks for authenticated users" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all tasks operations for authenticated users" ON public.tasks FOR ALL TO authenticated USING (true);
