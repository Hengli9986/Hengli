<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">账号管理</h1>
    
    <!-- Add account button (admin only) -->
    <div v-if="auth.isAdmin" class="mb-6">
      <button @click="showAddModal = true" class="btn-primary">
        + 添加抖音账号
      </button>
    </div>
    
    <!-- Account cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="account in accountStore.accounts"
        :key="account.id"
        class="card relative"
        :class="{ 'ring-2 ring-primary': account.is_active }"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h3 class="font-medium">{{ account.name }}</h3>
              <p class="text-sm text-gray-500">粉丝: {{ formatNumber(account.fans_count) }}</p>
              <p class="text-xs text-gray-400">
                更新: {{ account.last_sync_at ? formatDate(account.last_sync_at) : '未同步' }}
              </p>
            </div>
          </div>
          <span v-if="account.is_active" class="text-xs bg-primary text-white px-2 py-1 rounded">
            当前
          </span>
        </div>
        
        <div class="mt-4 flex space-x-2">
          <button
            v-if="!account.is_active"
            @click="accountStore.switchAccount(account.id)"
            class="flex-1 btn-secondary text-sm"
          >
            设为当前
          </button>
          <button
            v-if="auth.isAdmin"
            @click="confirmDelete(account)"
            class="px-3 py-2 text-error hover:bg-red-50 rounded-lg text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">添加抖音账号</h2>
        <form @submit.prevent="handleAdd" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">账号昵称</label>
            <input v-model="newAccount.name" required class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">抖音ID (可选)</label>
            <input v-model="newAccount.douyinId" class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div class="flex space-x-3">
            <button type="submit" class="flex-1 btn-primary">添加</button>
            <button @click="showAddModal = false" class="flex-1 btn-secondary">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAccountStore } from '../stores/account'

const auth = useAuthStore()
const accountStore = useAccountStore()
const showAddModal = ref(false)
const newAccount = ref({ name: '', douyinId: '' })

onMounted(() => accountStore.loadAccounts())

async function handleAdd() {
  await accountStore.addAccount(newAccount.value.name, newAccount.value.douyinId)
  showAddModal.value = false
  newAccount.value = { name: '', douyinId: '' }
}

function confirmDelete(account) {
  if (confirm(`确定删除账号 "${account.name}"? 相关数据将被清除。`)) {
    accountStore.deleteAccount(account.id)
  }
}

function formatNumber(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n?.toLocaleString() || '0'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>
