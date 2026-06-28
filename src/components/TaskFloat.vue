<template>
  <div class="fixed bottom-6 right-6 z-50" ref="panelRef">
    <!-- Task panel -->
    <div
      v-if="isOpen"
      class="absolute bottom-16 right-0 w-80 card shadow-xl border border-gray-200 rounded-xl overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-lg">任务</h3>
        <button
          @click="isOpen = false"
          class="text-gray-400 hover:text-gray-600 p-1"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      <!-- Loading -->
      <div v-if="taskStore.isLoading" class="py-8 text-center text-gray-500 text-sm">
        加载中...
      </div>

      <!-- Empty state -->
      <div v-else-if="incompleteTasks.length === 0" class="py-6 text-center text-gray-400 text-sm">
        暂无待办任务
      </div>

      <!-- Task list -->
      <ul v-else class="space-y-2 max-h-64 overflow-y-auto mb-3">
        <li
          v-for="task in incompleteTasks"
          :key="task.id"
          class="flex items-center justify-between p-2 bg-gray-50 rounded-lg group"
        >
          <div class="flex items-center space-x-2 min-w-0">
            <input
              type="checkbox"
              :checked="task.status === 'done'"
              @change="taskStore.toggleTask(task.id)"
              class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary shrink-0"
            />
            <span class="text-sm truncate" :class="{ 'line-through text-gray-400': task.status === 'done' }">
              {{ task.title }}
            </span>
          </div>
          <button
            @click="taskStore.deleteTask(task.id)"
            class="text-gray-400 hover:text-red-500 text-sm px-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            aria-label="删除"
          >
            🗑
          </button>
        </li>
      </ul>

      <!-- Quick add -->
      <form @submit.prevent="handleQuickAdd" class="flex space-x-2">
        <input
          v-model="quickTitle"
          type="text"
          placeholder="快速添加任务..."
          class="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          class="btn-primary text-sm px-3"
          :disabled="!quickTitle.trim()"
        >
          添加
        </button>
      </form>

      <!-- Link to full page -->
      <router-link
        to="/tasks"
        @click="isOpen = false"
        class="block mt-3 text-center text-sm text-primary hover:underline"
      >
        查看全部 →
      </router-link>
    </div>

    <!-- Floating button -->
    <button
      @click="isOpen = !isOpen"
      class="bg-primary text-white rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
    >
      <span>📋</span>
      <span>任务</span>
      <span
        v-if="incompleteTasks.length > 0"
        class="bg-white text-primary text-xs font-bold rounded-full px-2 py-0.5"
      >
        {{ incompleteTasks.length }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '../stores/task'

const taskStore = useTaskStore()
const isOpen = ref(false)
const quickTitle = ref('')
const panelRef = ref(null)

const incompleteTasks = computed(() =>
  taskStore.tasks
    .filter(t => t.status === 'todo')
    .slice(0, 5)
)

function handleQuickAdd() {
  const title = quickTitle.value.trim()
  if (!title) return

  taskStore.addTask({ title }).then(() => {
    quickTitle.value = ''
  })
}

function handleClickOutside(event) {
  if (panelRef.value && !panelRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  taskStore.loadTasks()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
