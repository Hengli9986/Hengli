<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">任务管理</h1>
      <button @click="showAddModal = true" class="btn-primary">
        + 新建任务
      </button>
    </div>

    <!-- Filters -->
    <div class="flex space-x-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="filter = tab.value"
        class="px-4 py-2 rounded-lg text-sm transition-colors"
        :class="filter === tab.value ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="taskStore.isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredTasks.length === 0" class="card text-center py-12 text-gray-500">
      没有找到任务
    </div>

    <!-- Task list -->
    <div v-else class="space-y-3">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="card flex items-start justify-between"
      >
        <div class="flex items-start space-x-3 flex-1 min-w-0">
          <input
            type="checkbox"
            :checked="task.status === 'done'"
            @change="taskStore.toggleTask(task.id)"
            class="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary mt-0.5 shrink-0"
          />
          <div class="min-w-0">
            <div class="flex items-center space-x-2 flex-wrap">
              <h3
                class="font-medium"
                :class="{ 'line-through text-gray-400': task.status === 'done' }"
              >
                {{ task.title }}
              </h3>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="priorityClass(task.priority)"
              >
                {{ priorityLabel(task.priority) }}
              </span>
            </div>
            <p
              v-if="task.description"
              class="text-sm text-gray-500 mt-1"
              :class="{ 'line-through text-gray-300': task.status === 'done' }"
            >
              {{ task.description }}
            </p>
            <p v-if="task.due_date" class="text-xs text-gray-400 mt-1">
              截止日期: {{ formatDate(task.due_date) }}
            </p>
          </div>
        </div>
        <button
          @click="confirmDelete(task)"
          class="text-gray-400 hover:text-red-500 px-2 py-1 shrink-0"
          aria-label="删除"
        >
          🗑
        </button>
      </div>
    </div>

    <!-- Add task modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">新建任务</h2>
        <form @submit.prevent="handleAdd" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">标题 <span class="text-red-500">*</span></label>
            <input
              v-model="newTask.title"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入任务标题"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">描述</label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入任务描述（可选）"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">优先级</label>
              <select
                v-model="newTask.priority"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">截止日期</label>
              <input
                v-model="newTask.dueDate"
                type="date"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div class="flex space-x-3 pt-2">
            <button type="submit" class="flex-1 btn-primary" :disabled="!newTask.title.trim()">
              保存
            </button>
            <button @click="closeAddModal" type="button" class="flex-1 btn-secondary">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/task'

const taskStore = useTaskStore()
const showAddModal = ref(false)
const filter = ref('all')
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
})

const tabs = [
  { label: '全部', value: 'all' },
  { label: '未完成', value: 'todo' },
  { label: '已完成', value: 'done' }
]

const filteredTasks = computed(() => {
  if (filter.value === 'all') return taskStore.tasks
  return taskStore.tasks.filter(t => t.status === filter.value)
})

onMounted(() => taskStore.loadTasks())

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700'
    case 'medium': return 'bg-yellow-100 text-yellow-700'
    case 'low': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function priorityLabel(priority) {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '中'
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN')
}

async function handleAdd() {
  await taskStore.addTask({
    title: newTask.value.title,
    description: newTask.value.description,
    priority: newTask.value.priority,
    dueDate: newTask.value.dueDate || null
  })
  closeAddModal()
}

function closeAddModal() {
  showAddModal.value = false
  newTask.value = { title: '', description: '', priority: 'medium', dueDate: '' }
}

function confirmDelete(task) {
  if (confirm(`确定删除任务 "${task.title}"?`)) {
    taskStore.deleteTask(task.id)
  }
}
</script>
