import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions
export async function getAccounts() {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function getActiveAccount() {
  const { data, error } = await supabase.from('accounts').select('*').eq('is_active', true).single()
  if (error) throw error
  return data
}

export async function setActiveAccount(accountId) {
  await supabase.from('accounts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  const { error } = await supabase.from('accounts').update({ is_active: true }).eq('id', accountId)
  if (error) throw error
}
