import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref([])
  const activeAccount = computed(() => accounts.value.find(a => a.is_active))

  async function loadAccounts() {
    const { data, error } = await supabase.from('accounts').select('*').order('created_at')
    if (error) throw error
    accounts.value = data || []
  }

  async function addAccount(name, douyinId) {
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ name, douyin_id: douyinId, is_active: accounts.value.length === 0 }])
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
    await supabase.from('accounts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    const { error } = await supabase.from('accounts').update({ is_active: true }).eq('id', id)
    if (error) throw error
    await loadAccounts()
  }

  return { accounts, activeAccount, loadAccounts, addAccount, deleteAccount, switchAccount }
})
