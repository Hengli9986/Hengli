import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  const isLoading = ref(false)
  const error = ref('')

  const authStore = useAuthStore()

  async function loadTasks() {
    if (!authStore.user) {
      tasks.value = []
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      const { data, error: supaError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      tasks.value = data || []
    } catch (err) {
      error.value = err.message || '加载任务失败'
      console.error('loadTasks error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addTask({ title, description = '', priority = 'medium', dueDate = null }) {
    if (!authStore.user) throw new Error('请先登录')
    if (!title?.trim()) throw new Error('任务标题不能为空')

    const insertData = {
      user_id: authStore.user.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
      status: 'todo'
    }

    const { error: supaError } = await supabase.from('tasks').insert([insertData])
    if (supaError) throw supaError

    await loadTasks()
  }

  async function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const newStatus = task.status === 'todo' ? 'done' : 'todo'
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null

    const { error: supaError } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', id)

    if (supaError) throw supaError

    await loadTasks()
  }

  async function deleteTask(id) {
    const { error: supaError } = await supabase.from('tasks').delete().eq('id', id)
    if (supaError) throw supaError

    await loadTasks()
  }

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask
  }
})
