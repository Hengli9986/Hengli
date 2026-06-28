# Phase 3: Supabase Database Integration & Data Export

> **Date:** 2026-06-28
> **Status:** Approved by user (inline spec)
> **Scope:** Replace localStorage with Supabase PostgreSQL for persistent cloud storage, add data export features

---

## Goal

Replace all localStorage-based data persistence with Supabase PostgreSQL database, enabling multi-device sync, team collaboration, and data durability. Add PDF/Excel export capabilities for reporting.

## Architecture

**Current state:** All data (auth, accounts, imported data) stored in browser localStorage. No server, no sync, data lost on browser switch.

**Target state:**
- **Auth:** Supabase Auth (email/password) with JWT sessions
- **Data:** Supabase PostgreSQL tables with Row Level Security (RLS) — each user only sees their own data
- **Accounts:** Linked to `auth.users` via `user_id` foreign key
- **Import history:** Stored in `import_logs` table with metadata
- **Export:** Client-side PDF generation (jsPDF) + Excel export (xlsx library already installed)

**Tech Stack:**
- Supabase (PostgreSQL + Auth + RLS)
- Vue 3 + Pinia (existing)
- @supabase/supabase-js (already installed)
- jspdf + jspdf-autotable (new dependency for PDF)
- xlsx (already installed)

## Global Constraints

- **Supabase project:** Must use existing project or create new one (user has `.env.example` with placeholders)
- **RLS required:** All tables must have Row Level Security enabled — `user_id = auth.uid()`
- **Migration path:** localStorage data can be discarded (MVP, no migration needed)
- **Backward compatibility:** Login page must work immediately after switch (no user action needed beyond re-registering)
- **Build must pass:** `npm run build` must succeed after all changes
- **No breaking URL changes:** All routes remain the same

---

## Database Schema

### Table: `profiles` (extends auth.users)
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role text default 'member' check (role in ('member', 'admin')),
  created_at timestamptz default now()
);
```

### Table: `accounts`
```sql
create table accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  douyin_id text,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- RLS: users can only CRUD their own accounts
alter table accounts enable row level security;
create policy "Users can only access their own accounts"
  on accounts for all
  using (user_id = auth.uid());
```

### Table: `live_sessions`
```sql
create table live_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete cascade,
  
  -- Data fields (match Excel import columns)
  live_date date,
  duration_minutes integer,
  avg_watch integer,
  gmv numeric(12,2),
  orders integer,
  new_fans integer,
  interactions integer,
  
  -- Raw JSON for flexible schema
  raw_data jsonb,
  
  created_at timestamptz default now()
);

alter table live_sessions enable row level security;
create policy "Users can only access their own live sessions"
  on live_sessions for all
  using (user_id = auth.uid());
```

### Table: `videos`
```sql
create table videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete cascade,
  
  -- Data fields
  title text,
  publish_time timestamptz,
  play_count integer,
  like_count integer,
  comment_count integer,
  share_count integer,
  collect_count integer,
  completion_rate numeric(5,2),
  
  -- Raw JSON for flexible schema
  raw_data jsonb,
  
  created_at timestamptz default now()
);

alter table videos enable row level security;
create policy "Users can only access their own videos"
  on videos for all
  using (user_id = auth.uid());
```

### Table: `import_logs`
```sql
create table import_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  import_type text not null check (import_type in ('live', 'video')),
  record_count integer not null,
  file_name text,
  created_at timestamptz default now()
);

alter table import_logs enable row level security;
create policy "Users can only access their own import logs"
  on import_logs for all
  using (user_id = auth.uid());
```

### Trigger: Auto-create profile on signup
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## API Layer (`src/lib/supabase.js` extensions)

```javascript
// Auth
export async function signUp(email, password, name) { ... }
export async function signIn(email, password) { ... }
export async function signOut() { ... }
export function onAuthStateChange(callback) { ... }

// Live Sessions
export async function insertLiveSessions(sessions) { ... }
export async function getLiveSessions(accountId?) { ... }
export async function deleteLiveSession(id) { ... }

// Videos
export async function insertVideos(videos) { ... }
export async function getVideos(accountId?) { ... }
export async function deleteVideo(id) { ... }

// Import Logs
export async function logImport(type, count, fileName) { ... }
export async function getImportLogs() { ... }
```

---

## Export Features

### PDF Report Export
- **Library:** jspdf + jspdf-autotable
- **Pages:** Live Analysis Report, Video Analysis Report
- **Content:** Summary stats + charts (as images) + data tables
- **Trigger:** Button on LiveAnalysis.vue and VideoAnalysis.vue

### Excel Backup Export
- **Library:** xlsx (already installed)
- **Content:** Raw data from Supabase tables
- **Trigger:** Button on DataImport.vue (export all my data)

---

## Task Breakdown

### Task 1: Supabase Project Setup & Schema
- Create/verify Supabase project
- Run SQL migrations (tables + RLS + trigger)
- Update `.env` with real credentials
- Test connection from app

### Task 2: Auth Migration (localStorage → Supabase Auth)
- Replace `src/stores/auth.js` with Supabase Auth
- Update Login.vue / Register.vue to use Supabase
- Update router guards to check Supabase session
- Handle auth state changes (auto-login on refresh)

### Task 3: Data Store Migration (localStorage → Supabase)
- Rewrite `src/stores/data.js` to use Supabase
- Update DataImport.vue to save to Supabase
- Update LiveAnalysis.vue to read from Supabase
- Update VideoAnalysis.vue to read from Supabase
- Update LiveDetail.vue to read from Supabase
- Update Dashboard.vue to read from Supabase

### Task 4: Account Store Migration
- Update `src/stores/account.js` to link accounts to `user_id`
- Add `user_id` filter to all account queries

### Task 5: Data Export (PDF + Excel)
- Install jspdf + jspdf-autotable
- Create `src/lib/export.js` with PDF/Excel generation
- Add export buttons to LiveAnalysis and VideoAnalysis
- Add "Export All Data" button to DataImport

### Task 6: Testing & Build Verification
- Test full flow: register → login → import data → view analysis → export
- Verify `npm run build` passes
- Verify RLS works (user A can't see user B data)
- Commit all changes

---

## TikTok API Research (Task 3, Optional)

**Goal:** Evaluate feasibility of connecting to Douyin Open Platform API

**Research tasks:**
1. Check Douyin Open Platform (抖音开放平台) API requirements
2. Document: enterprise qualification needed? Personal developer possible?
3. Document: which APIs are available (video data, live data, analytics)?
4. Document: rate limits, pricing, approval timeline
5. Decision: proceed with API integration OR document as "future work" and use Playwright scraper alternative

**If API is not feasible:**
- Create `docs/tiktok-api-research.md` with findings
- Plan Phase 4: Playwright-based browser automation for data collection
