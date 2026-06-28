# Supabase Database Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all localStorage-based data persistence with Supabase PostgreSQL, add data export (PDF/Excel), and research TikTok API feasibility.

**Architecture:** Supabase Auth + PostgreSQL with RLS. Client-side PDF/Excel export. Vue 3 + Pinia stores rewritten to use Supabase instead of localStorage.

**Tech Stack:** Supabase, Vue 3, Pinia, jspdf, jspdf-autotable, xlsx

## Global Constraints

- All database tables must have RLS enabled with `user_id = auth.uid()` policy
- `npm run build` must pass after every task
- No breaking URL changes
- localStorage data can be discarded (no migration)
- Supabase project credentials from `.env.local`

---

## Task 1: Supabase Project Setup & Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Modify: `.env.local` (add real credentials)
- Test: `src/lib/supabase.js` connection

**Interfaces:**
- Produces: Database tables `profiles`, `accounts`, `live_sessions`, `videos`, `import_logs` with RLS
- Produces: Auto-profile trigger on auth signup

- [ ] **Step 1: Create Supabase SQL migration file**

```sql
-- 001_initial_schema.sql
-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role text default 'member' check (role in ('member', 'admin')),
  created_at timestamptz default now()
);

-- Accounts table
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  douyin_id text,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Live sessions table
create table if not exists live_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete set null,
  live_date date,
  duration_minutes integer,
  avg_watch integer,
  gmv numeric(12,2),
  orders integer,
  new_fans integer,
  interactions integer,
  raw_data jsonb,
  created_at timestamptz default now()
);

-- Videos table
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete set null,
  title text,
  publish_time timestamptz,
  play_count integer,
  like_count integer,
  comment_count integer,
  share_count integer,
  collect_count integer,
  completion_rate numeric(5,2),
  raw_data jsonb,
  created_at timestamptz default now()
);

-- Import logs table
create table if not exists import_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  import_type text not null check (import_type in ('live', 'video')),
  record_count integer not null,
  file_name text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table live_sessions enable row level security;
alter table videos enable row level security;
alter table import_logs enable row level security;

-- RLS Policies
create policy "Users can only access their own profiles"
  on profiles for all using (id = auth.uid());

create policy "Users can only access their own accounts"
  on accounts for all using (user_id = auth.uid());

create policy "Users can only access their own live sessions"
  on live_sessions for all using (user_id = auth.uid());

create policy "Users can only access their own videos"
  on videos for all using (user_id = auth.uid());

create policy "Users can only access their own import logs"
  on import_logs for all using (user_id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

Open Supabase project → SQL Editor → New query → Paste migration → Run

Expected: All tables created, RLS enabled, trigger active.

- [ ] **Step 3: Update `.env.local` with real credentials**

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 4: Test connection**

Run: `npm run dev`
Open app, verify no console errors about Supabase connection.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/001_initial_schema.sql .env.local
git commit -m "feat: add Supabase database schema with RLS"
```

---

## Task 2: Auth Migration (localStorage → Supabase Auth)

**Files:**
- Modify: `src/stores/auth.js` — replace localStorage with Supabase Auth
- Modify: `src/views/Login.vue` — use Supabase signIn
- Modify: `src/router/index.js` — check Supabase session
- Modify: `src/App.vue` — handle auth state changes

**Interfaces:**
- Consumes: `supabase` client from `src/lib/supabase.js`
- Produces: `auth.user` (Supabase user object), `auth.isAuthenticated` (boolean)
- Produces: `auth.login(email, password)`, `auth.register(email, password, name)`, `auth.logout()`

- [ ] **Step 1: Rewrite auth store with Supabase Auth**

```javascript
// src/stores/auth.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Initialize auth state
  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user ?? null
    loading.value = false
  })

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
  })

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  async function register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, isAuthenticated, isAdmin, login, register, logout }
})
```

- [ ] **Step 2: Update router to use Supabase session check**

```javascript
// src/router/index.js
import { supabase } from '../lib/supabase'

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession()
  const isAuthenticated = !!data.session
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

- [ ] **Step 3: Update Login.vue to remove localStorage references**

Remove `localStorage.getItem('users')` pattern. Use `authStore.login()` and `authStore.register()` directly.

- [ ] **Step 4: Update App.vue to handle loading state**

```vue
<template>
  <div v-if="auth.loading" class="min-h-screen flex items-center justify-center">
    <div class="text-gray-500">加载中...</div>
  </div>
  <div v-else class="min-h-screen bg-gray-50">
    <!-- existing content -->
  </div>
</template>
```

- [ ] **Step 5: Test auth flow**

1. Register new account → should create user in Supabase Auth + profile in `profiles` table
2. Login → should get session
3. Refresh page → should auto-login via session
4. Logout → should clear session

- [ ] **Step 6: Commit**

```bash
git add src/stores/auth.js src/router/index.js src/views/Login.vue src/App.vue
git commit -m "feat: migrate auth from localStorage to Supabase Auth"
```

---

## Task 3: Data Store Migration (localStorage → Supabase)

**Files:**
- Modify: `src/stores/data.js` — replace localStorage with Supabase queries
- Modify: `src/views/DataImport.vue` — save to Supabase after import
- Modify: `src/views/LiveAnalysis.vue` — load from Supabase
- Modify: `src/views/VideoAnalysis.vue` — load from Supabase
- Modify: `src/views/LiveDetail.vue` — load from Supabase
- Modify: `src/views/Dashboard.vue` — load from Supabase

**Interfaces:**
- Consumes: `supabase` client, `auth.user` (for user_id)
- Produces: Same store API (`liveSessions`, `videos`, `liveStats`, `videoStats`, `importHistory`)
- Produces: `setImportedData(data, type)` now saves to Supabase + logs import

- [ ] **Step 1: Rewrite data store with Supabase**

```javascript
// src/stores/data.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useDataStore = defineStore('data', () => {
  const importedData = ref([])
  const importHistory = ref([])
  const currentImportType = ref('')
  const isLoading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  // Computed stats (same as before, but source is Supabase)
  const liveSessions = computed(() => importedData.value.filter(d => d.type === 'live'))
  const videos = computed(() => importedData.value.filter(d => d.type === 'video'))
  
  // ... liveStats and videoStats computed properties (same logic)

  async function loadData() {
    if (!authStore.user) return
    isLoading.value = true
    
    // Load live sessions
    const { data: liveData, error: liveError } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
    
    if (liveError) {
      error.value = liveError.message
      isLoading.value = false
      return
    }
    
    // Load videos
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
    
    if (videoError) {
      error.value = videoError.message
      isLoading.value = false
      return
    }
    
    // Load import logs
    const { data: logData } = await supabase
      .from('import_logs')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    
    // Normalize data format
    importedData.value = [
      ...(liveData || []).map(d => ({ ...d, type: 'live', _id: d.id })),
      ...(videoData || []).map(d => ({ ...d, type: 'video', _id: d.id }))
    ]
    
    importHistory.value = (logData || []).map(log => ({
      id: log.id,
      type: log.import_type,
      count: log.record_count,
      timestamp: new Date(log.created_at).toLocaleString('zh-CN'),
      fileName: log.file_name
    }))
    
    isLoading.value = false
  }

  async function setImportedData(data, type) {
    if (!authStore.user) throw new Error('请先登录')
    
    isLoading.value = true
    
    // Transform data to match schema
    const records = data.map(row => ({
      user_id: authStore.user.id,
      // Map fields based on type
      ...(type === 'live' ? {
        live_date: row.直播日期 || row.date,
        duration_minutes: parseInt(row.直播时长 || row.duration) || null,
        avg_watch: parseInt(row.场均观看 || row.watchCount) || null,
        gmv: parseFloat(row.直播GMV || row.gmv) || null,
        orders: parseInt(row.成交订单数 || row.orders) || null,
        new_fans: parseInt(row.新增粉丝 || row.newFans) || null,
        interactions: parseInt(row.互动人数 || row.interactions) || null,
        raw_data: row
      } : {
        title: row.视频标题 || row.title,
        publish_time: row.发布时间 || row.publishTime,
        play_count: parseInt(row.播放量 || row.playCount) || null,
        like_count: parseInt(row.点赞数 || row.likeCount) || null,
        comment_count: parseInt(row.评论数 || row.commentCount) || null,
        share_count: parseInt(row.分享数 || row.shareCount) || null,
        collect_count: parseInt(row.收藏数 || row.collectCount) || null,
        completion_rate: parseFloat(row.完播率 || row.completionRate) || null,
        raw_data: row
      })
    }))
    
    // Insert to Supabase
    const table = type === 'live' ? 'live_sessions' : 'videos'
    const { error: insertError } = await supabase.from(table).insert(records)
    
    if (insertError) {
      error.value = insertError.message
      isLoading.value = false
      throw insertError
    }
    
    // Log import
    await supabase.from('import_logs').insert({
      user_id: authStore.user.id,
      import_type: type,
      record_count: data.length
    })
    
    // Reload data
    await loadData()
    isLoading.value = false
  }

  async function clearData() {
    if (!authStore.user) return
    await supabase.from('live_sessions').delete().eq('user_id', authStore.user.id)
    await supabase.from('videos').delete().eq('user_id', authStore.user.id)
    await supabase.from('import_logs').delete().eq('user_id', authStore.user.id)
    await loadData()
  }

  // Initialize on store creation
  if (authStore.user) {
    loadData()
  }

  return {
    importedData, importHistory, currentImportType, isLoading, error,
    liveSessions, liveStats, videos, videoStats,
    loadData, setImportedData, clearData
  }
})
```

- [ ] **Step 2: Update DataImport.vue to call setImportedData**

The `confirmImport()` function already calls `dataStore.setImportedData()` — no change needed in the component, but verify the store method works.

- [ ] **Step 3: Update LiveAnalysis.vue to add loading state**

Add `isLoading` display and call `dataStore.loadData()` on mount.

- [ ] **Step 4: Update VideoAnalysis.vue similarly**

- [ ] **Step 5: Update LiveDetail.vue to query by UUID**

The route param `:id` is now a Supabase UUID, not a localStorage-generated `_id`.

- [ ] **Step 6: Update Dashboard.vue to load data on mount**

- [ ] **Step 7: Test full data flow**

1. Import live data → verify rows in `live_sessions` table
2. Import video data → verify rows in `videos` table
3. View Live Analysis → verify data loads from Supabase
4. View Video Analysis → verify data loads from Supabase
5. Check RLS: user A's data not visible to user B

- [ ] **Step 8: Commit**

```bash
git add src/stores/data.js src/views/DataImport.vue src/views/LiveAnalysis.vue src/views/VideoAnalysis.vue src/views/LiveDetail.vue src/views/Dashboard.vue
git commit -m "feat: migrate data storage from localStorage to Supabase"
```

---

## Task 4: Account Store Migration

**Files:**
- Modify: `src/stores/account.js` — add user_id filter, use Supabase

**Interfaces:**
- Consumes: `auth.user.id` (for user_id)
- Produces: Same API (`accounts`, `activeAccount`, `loadAccounts`, `addAccount`, `deleteAccount`, `switchAccount`)

- [ ] **Step 1: Update account store to include user_id**

```javascript
// src/stores/account.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref([])
  const activeAccount = computed(() => accounts.value.find(a => a.is_active))
  const authStore = useAuthStore()

  async function loadAccounts() {
    if (!authStore.user) return
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at')
    if (error) throw error
    accounts.value = data || []
  }

  async function addAccount(name, douyinId) {
    if (!authStore.user) throw new Error('请先登录')
    const { data, error } = await supabase
      .from('accounts')
      .insert([{
        user_id: authStore.user.id,
        name,
        douyin_id: douyinId,
        is_active: accounts.value.length === 0
      }])
      .select()
      .single()
    if (error) throw error
    accounts.value.push(data)
    return data
  }

  async function deleteAccount(id) {
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) throw error
    accounts.value = accounts.value.filter(a => a.id !== id)
  }

  async function switchAccount(id) {
    await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('user_id', authStore.user.id)
    const { error } = await supabase.from('accounts').update({ is_active: true }).eq('id', id)
    if (error) throw error
    await loadAccounts()
  }

  return { accounts, activeAccount, loadAccounts, addAccount, deleteAccount, switchAccount }
})
```

- [ ] **Step 2: Test account CRUD**

1. Add account → verify in Supabase with correct user_id
2. Switch active → verify is_active flag
3. Delete account → verify cascade to live_sessions/videos (set null)

- [ ] **Step 3: Commit**

```bash
git add src/stores/account.js
git commit -m "feat: migrate account store to Supabase with user isolation"
```

---

## Task 5: Data Export (PDF + Excel)

**Files:**
- Create: `src/lib/export.js` — export utilities
- Modify: `src/views/LiveAnalysis.vue` — add PDF export button
- Modify: `src/views/VideoAnalysis.vue` — add PDF export button
- Modify: `src/views/DataImport.vue` — add "Export All Data" button
- Install: `jspdf`, `jspdf-autotable`

**Interfaces:**
- Produces: `exportLiveReport()` → PDF download
- Produces: `exportVideoReport()` → PDF download
- Produces: `exportAllData()` → Excel download

- [ ] **Step 1: Install dependencies**

```bash
npm install jspdf jspdf-autotable
```

- [ ] **Step 2: Create export utilities**

```javascript
// src/lib/export.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export function exportLiveReportPDF(liveSessions, stats) {
  const doc = new jsPDF()
  doc.setFont('helvetica')
  doc.text('直播数据分析报告', 14, 20)
  doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 14, 30)
  
  // Stats summary
  doc.text(`直播场次: ${stats.sessionCount}`, 14, 45)
  doc.text(`场均观看: ${stats.avgWatch}`, 14, 52)
  doc.text(`总GMV: ¥${stats.totalGmv}`, 14, 59)
  doc.text(`总订单: ${stats.totalOrders}`, 14, 66)
  
  // Data table
  autoTable(doc, {
    startY: 75,
    head: [['日期', '时长', '观看', 'GMV', '订单']],
    body: liveSessions.map(s => [
      s.live_date || '-',
      s.duration_minutes || '-',
      s.avg_watch || '-',
      s.gmv || '-',
      s.orders || '-'
    ])
  })
  
  doc.save('直播分析报告.pdf')
}

export function exportVideoReportPDF(videos, stats) {
  const doc = new jsPDF()
  doc.text('短视频数据分析报告', 14, 20)
  doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 14, 30)
  
  doc.text(`视频总数: ${stats.videoCount}`, 14, 45)
  doc.text(`总播放: ${stats.totalPlay}`, 14, 52)
  doc.text(`总点赞: ${stats.totalLike}`, 14, 59)
  doc.text(`互动率: ${stats.engagementRate}%`, 14, 66)
  
  autoTable(doc, {
    startY: 75,
    head: [['标题', '播放', '点赞', '评论', '分享']],
    body: videos.map(v => [
      v.title || '-',
      v.play_count || '-',
      v.like_count || '-',
      v.comment_count || '-',
      v.share_count || '-'
    ])
  })
  
  doc.save('短视频分析报告.pdf')
}

export function exportAllDataExcel(liveSessions, videos) {
  const wb = XLSX.utils.book_new()
  
  // Live sessions sheet
  const liveWs = XLSX.utils.json_to_sheet(liveSessions.map(s => ({
    '直播日期': s.live_date,
    '时长(分钟)': s.duration_minutes,
    '场均观看': s.avg_watch,
    'GMV': s.gmv,
    '订单数': s.orders,
    '新增粉丝': s.new_fans,
    '互动人数': s.interactions
  })))
  XLSX.utils.book_append_sheet(wb, liveWs, '直播数据')
  
  // Videos sheet
  const videoWs = XLSX.utils.json_to_sheet(videos.map(v => ({
    '视频标题': v.title,
    '发布时间': v.publish_time,
    '播放量': v.play_count,
    '点赞数': v.like_count,
    '评论数': v.comment_count,
    '分享数': v.share_count,
    '收藏数': v.collect_count
  })))
  XLSX.utils.book_append_sheet(wb, videoWs, '短视频数据')
  
  XLSX.writeFile(wb, '抖音数据备份.xlsx')
}
```

- [ ] **Step 3: Add export buttons to LiveAnalysis.vue**

Add button: `<button @click="exportPDF" class="btn-secondary text-sm">📄 导出 PDF</button>`

- [ ] **Step 4: Add export buttons to VideoAnalysis.vue**

- [ ] **Step 5: Add "Export All Data" button to DataImport.vue**

- [ ] **Step 6: Test exports**

1. Click PDF export on Live Analysis → verify PDF downloads with correct data
2. Click PDF export on Video Analysis → verify PDF downloads
3. Click Excel export → verify .xlsx file with both sheets

- [ ] **Step 7: Commit**

```bash
git add src/lib/export.js src/views/LiveAnalysis.vue src/views/VideoAnalysis.vue src/views/DataImport.vue package.json package-lock.json
git commit -m "feat: add PDF and Excel data export functionality"
```

---

## Task 6: Testing & Build Verification

**Files:**
- All modified files
- `npm run build`

- [ ] **Step 1: Full integration test**

Test flow:
1. Register new user → verify Supabase Auth + profile created
2. Login → verify session persists on refresh
3. Add account → verify in accounts table with user_id
4. Import live data → verify in live_sessions table
5. Import video data → verify in videos table
6. View Live Analysis → verify data loads, charts render
7. View Video Analysis → verify data loads, charts render
8. Export PDF → verify file downloads
9. Export Excel → verify file downloads
10. Logout → verify redirect to login
11. Register second user → verify can't see first user's data (RLS test)

- [ ] **Step 2: Build verification**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "Phase 3 complete: Supabase integration + data export"
```

---

## Task 7: TikTok API Research (Optional)

**Files:**
- Create: `docs/tiktok-api-research.md`

- [ ] **Step 1: Research Douyin Open Platform**

Search web for:
- "抖音开放平台 API 申请条件"
- "抖音开放平台 企业资质"
- "抖音开放平台 个人开发者"
- "抖音开放平台 数据接口 直播数据"

- [ ] **Step 2: Document findings**

Write `docs/tiktok-api-research.md` with:
- Application requirements (enterprise vs personal)
- Available APIs and their data
- Rate limits and pricing
- Approval timeline
- Feasibility verdict

- [ ] **Step 3: Decision**

If API is feasible: plan Phase 4 integration.
If not feasible: document Playwright scraper as alternative.

- [ ] **Step 4: Commit**

```bash
git add docs/tiktok-api-research.md
git commit -m "docs: TikTok API feasibility research"
```

---

## Summary

| Task | Description | Estimated Time |
|------|-------------|---------------|
| 1 | Supabase schema setup | 30 min |
| 2 | Auth migration | 45 min |
| 3 | Data store migration | 60 min |
| 4 | Account store migration | 20 min |
| 5 | Export functionality | 45 min |
| 6 | Testing & build | 30 min |
| 7 | API research | 30 min |
| **Total** | | **~4.5 hours** |
