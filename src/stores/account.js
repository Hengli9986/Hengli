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
    if (!authStore.user) return
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
