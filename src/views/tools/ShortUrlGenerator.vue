<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Toggle from '@/components/ui/Toggle.vue'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

// 获取API基础URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') === '' ? '' :
    (import.meta.env.VITE_API_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_API_BASE_URL.slice(0, -1)
        : import.meta.env.VITE_API_BASE_URL)

// 获取或创建客户端ID
const getClientId = () => {
  let clientId = localStorage.getItem('shortUrlClientId')
  if (!clientId) {
    clientId = generateClientId()
    localStorage.setItem('shortUrlClientId', clientId)
  }
  return clientId
}

// 生成客户端唯一标识
const generateClientId = () => {
  const timestamp = new Date().getTime().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomStr}`
}

const activeTab = ref('create')
const usePassword = ref(false)
const useCustomSuffix = ref(false)
const loading = ref(false)
const tableLoading = ref(false)
const generatedUrl = ref('')
const shortUrls = ref<any[]>([])

// 添加确认对话框相关状态
const showDeleteDialog = ref(false)
const currentDeleteRow = ref<any>(null)

// 有效期选项
const expiryOptions = [
  {label: '永久有效', value: 'forever'},
  {label: '一天', value: 'day'},
  {label: '一周', value: 'week'},
  {label: '一个月', value: 'month'}
]

const formState = reactive({
  originalUrl: '',
  expiryType: 'forever',
  accessCode: '',
  customSuffix: ''
})

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 加载短链接列表
const loadShortUrls = async () => {
  tableLoading.value = true

  try {
    const clientId = getClientId()
    const response = await fetch(`${API_BASE_URL}/short-url/list?clientId=${encodeURIComponent(clientId)}`, {
      method: 'GET'
    })
    const data = await response.json()

    if (data.success) {
      // 添加完整的短链接URL和格式化日期
      shortUrls.value = data.urls.map((url: any) => ({
        ...url,
        shortUrl: url.shortUrl || `${window.location.origin}/s/${url.shortId}`,
        createdAt: formatDate(url.createdAt),
        showPassword: false // 添加密码显示控制属性
      }))
    } else {
      toast.error(data.message || '获取短链接列表失败')
    }
  } catch (error) {
    console.error('加载短链接列表失败:', error)
    toast.error('获取短链接列表失败，请确认服务器是否运行')
  } finally {
    tableLoading.value = false
  }
}

// 生成短链接
const generateShortUrl = async () => {
  if (!formState.originalUrl) {
    toast.error('请输入原始URL')
    return
  }

  // 添加协议前缀（如果未提供）
  if (!formState.originalUrl.startsWith('http')) {
    formState.originalUrl = 'https://' + formState.originalUrl
  }

  loading.value = true

  try {
    const clientId = getClientId()

    const response = await fetch(`${API_BASE_URL}/short-url/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalUrl: formState.originalUrl,
        expiryType: formState.expiryType === 'forever' ? null : formState.expiryType,
        accessCode: usePassword.value ? formState.accessCode : null,
        customSuffix: useCustomSuffix.value ? formState.customSuffix : null,
        clientId: clientId,
        frontendHost: window.location.origin
      })
    })

    const data = await response.json()

    if (data.success) {
      generatedUrl.value = data.shortUrl
      toast.success('短链接创建成功')
      loadShortUrls() // 刷新列表
    } else {
      toast.error(data.message || '创建失败')
    }
  } catch (error: any) {
    console.error('创建短链接失败:', error)
    toast.error('创建失败，请确认服务器是否正常运行')
  } finally {
    loading.value = false
  }
}

// 复制URL到剪贴板
const copyUrl = () => {
  navigator.clipboard.writeText(generatedUrl.value)
      .then(() => {
        toast.success('已复制到剪贴板')
      })
      .catch(() => {
        toast.error('复制失败')
      })
}

// 切换密码可见性
const togglePasswordVisibility = (row: any) => {
  row.showPassword = !row.showPassword
  // 关闭其他打开的密码弹窗
  shortUrls.value.forEach(item => {
    if (item !== row) {
      item.showPassword = false
    }
  })
}

// 复制访问密码
const copyAccessCode = (accessCode: string) => {
  if (!accessCode) return

  navigator.clipboard.writeText(accessCode)
    .then(() => {
      toast.success('密码已复制到剪贴板')
    })
    .catch(() => {
      toast.error('复制失败')
    })
}

// 处理删除短链接
const handleDelete = (row: any) => {
  currentDeleteRow.value = row
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentDeleteRow.value) return

  try {
    const clientId = getClientId()
    const row = currentDeleteRow.value

    const response = await fetch(`${API_BASE_URL}/short-url/delete/${row.shortId}?clientId=${encodeURIComponent(clientId)}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (data.success) {
      toast.success('短链接删除成功')
      loadShortUrls() // 重新加载列表
    } else {
      toast.error(data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除短链接失败:', error)
    toast.error('删除失败，请确认服务器是否正常运行')
  } finally {
    showDeleteDialog.value = false
  }
}

// 清空表单
const clearForm = () => {
  formState.originalUrl = ''
  formState.expiryType = 'forever'
  formState.accessCode = ''
  formState.customSuffix = ''
  usePassword.value = false
  useCustomSuffix.value = false
  generatedUrl.value = ''
}

// 动画
onMounted(() => {
  // 确保有客户端ID
  getClientId()
  // 加载短链接列表
  loadShortUrls()

  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          短链接生成工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          生成短链接，支持访问密码保护、自定义后缀和过期时间设置
        </p>
      </div>

      <!-- 标签页 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" animated variant="underline">
            <TabItem id="create" label="生成短链接">
              <!-- 生成短链接面板 -->
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原始网址</label>
                    <Input
                      v-model="formState.originalUrl"
                      class="w-full"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">有效期</label>
                    <Select
                      v-model:modelValue="formState.expiryType"
                      :options="expiryOptions"
                      class="w-full"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">访问密码</label>
                    <div class="space-y-2">
                      <Input
                        v-model="formState.accessCode"
                        :disabled="!usePassword"
                        class="w-full"
                        placeholder="可选，4-16位字母或数字"
                        type="password"
                      />
                      <Toggle
                        v-model="usePassword"
                        label="设置访问密码"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">自定义后缀</label>
                    <div class="space-y-2">
                      <Input
                        v-model="formState.customSuffix"
                        :disabled="!useCustomSuffix"
                        class="w-full"
                        placeholder="可选，字母数字组合"
                      />
                      <Toggle
                        v-model="useCustomSuffix"
                        label="使用自定义后缀"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex justify-center space-x-4">
                  <Button
                    :disabled="loading"
                    variant="primary"
                    @click="generateShortUrl"
                  >
                    <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    {{ loading ? '生成中...' : '生成短链接' }}
                  </Button>
                  <Button variant="ghost" @click="clearForm">
                    清空
                  </Button>
                </div>

                <!-- 生成结果 -->
                <div v-if="generatedUrl" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div class="flex items-center mb-4">
                    <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    <span class="text-green-800 dark:text-green-200 font-medium">生成成功!</span>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center">
                      <span class="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">原始网址:</span>
                      <div class="flex-1 ml-4 p-3 bg-white dark:bg-gray-700 rounded border">
                        <span class="text-sm break-all">{{ formState.originalUrl }}</span>
                      </div>
                    </div>

                    <div class="flex items-center">
                      <span class="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">短链接:</span>
                      <div class="flex-1 ml-4 p-3 bg-white dark:bg-gray-700 rounded border flex items-center justify-between">
                        <span class="text-sm break-all text-blue-600 dark:text-blue-400">{{ generatedUrl }}</span>
                        <Button size="sm" variant="ghost" @click="copyUrl">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                          </svg>
                          复制
                        </Button>
                      </div>
                    </div>

                    <div v-if="usePassword" class="flex items-center">
                      <span class="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">访问密码:</span>
                      <div class="flex-1 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <span class="text-sm font-mono text-blue-600 dark:text-blue-400">{{ formState.accessCode }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabItem>

            <TabItem id="list" label="短链接管理">
              <!-- 短链接管理面板 -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">我的短链接</h3>
                  <Button :disabled="tableLoading" variant="ghost" @click="loadShortUrls">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    {{ tableLoading ? '加载中...' : '刷新' }}
                  </Button>
                </div>

                <div v-if="shortUrls.length === 0 && !tableLoading" class="text-center py-12">
                  <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">暂无短链接，快去生成一个吧！</p>
                </div>

                <div v-else class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b border-gray-200 dark:border-gray-700">
                        <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">短链接</th>
                        <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">原始链接</th>
                        <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">创建时间</th>
                        <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">过期时间</th>
                        <th class="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">密码保护</th>
                        <th class="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="url in shortUrls"
                        :key="url.shortId"
                        class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td class="py-3 px-4">
                          <div class="url-cell">
                            <span :title="url.shortUrl" class="url-text">{{ url.shortUrl }}</span>
                          </div>
                        </td>
                        <td class="py-3 px-4">
                          <span class="text-sm text-gray-600 dark:text-gray-300 truncate block max-w-xs">{{ url.originalUrl }}</span>
                        </td>
                        <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{{ url.createdAt }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                          {{ url.expiryDate ? formatDate(url.expiryDate) : '永久有效' }}
                        </td>
                        <td class="py-3 px-4 text-center">
                          <div v-if="!url.hasPassword" class="status-tag tag-success">无密码</div>
                          <div v-else class="inline-flex-center">
                            <span v-if="url.showPassword" class="password-text-inline">{{ url.accessCode }}</span>
                            <span v-else class="status-tag tag-info">需要密码</span>
                            <span class="eye-button-inline" @click="togglePasswordVisibility(url)">
                              <svg fill="#2080f0" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                                <path :d="url.showPassword ? 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' : 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z'"/>
                              </svg>
                            </span>
                            <span v-if="url.hasPassword" class="copy-button-inline" @click="copyAccessCode(url.accessCode)">
                              <svg fill="#2080f0" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                              </svg>
                            </span>
                          </div>
                        </td>
                        <td class="py-3 px-4 text-center">
                          <div class="action-buttons">
                            <span class="delete-btn" @click="handleDelete(url)">
                              <svg fill="#ff4d4f" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                              删除
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabItem>
          </Tab>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">功能特性</h4>
            <ul class="space-y-2">
              <li>• 支持自定义后缀，提高可读性</li>
              <li>• 密码保护，增强链接安全性</li>
              <li>• 灵活的有效期设置</li>
              <li>• 一键复制短链接</li>
              <li>• 完整的链接管理功能</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">注意事项</h4>
            <ul class="space-y-2">
              <li>• 自定义后缀可能已被占用</li>
              <li>• 密码保护可增加安全性</li>
              <li>• 过期的链接将无法访问</li>
              <li>• 请勿传播违规内容</li>
              <li>• 建议定期清理过期链接</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showDeleteDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">确认删除</h3>
          <p class="text-gray-600 dark:text-gray-300">删除后此短链接将无法访问，是否确认删除？</p>
        </div>
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" @click="showDeleteDialog = false">取消</Button>
          <Button variant="danger" @click="confirmDelete">确认删除</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.tool-container {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表格相关样式 */
.url-cell {
  display: flex;
  align-items: center;
  width: 100%;
}

.url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 12px;
  font-size: 12px;
  text-align: center;
  height: 22px;
  line-height: 1;
}

.tag-info {
  background-color: rgba(32, 128, 240, 0.1);
  color: #2080f0;
  border: 1px solid rgba(32, 128, 240, 0.2);
}

.tag-success {
  background-color: rgba(24, 160, 88, 0.1);
  color: #18a058;
  border: 1px solid rgba(24, 160, 88, 0.2);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 8px;
  background-color: rgba(255, 77, 79, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 77, 79, 0.3);
  color: #ff4d4f;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  flex-shrink: 0;
}

.delete-btn:hover {
  background-color: rgba(255, 77, 79, 0.3);
  transform: translateY(-2px);
}

.password-text-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 13px;
  color: #2080f0;
  background-color: rgba(32, 128, 240, 0.1);
  border: 1px solid rgba(32, 128, 240, 0.2);
  border-radius: 12px;
  padding: 0 8px;
  height: 22px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 32px);
}

.inline-flex-center {
  display: inline-flex !important;
  align-items: center;
  width: 100%;
  gap: 4px;
  white-space: nowrap;
}

.eye-button-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  border-radius: 50%;
  background-color: rgba(32, 128, 240, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(32, 128, 240, 0.25);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  line-height: 1;
}

.eye-button-inline:hover {
  background-color: rgba(32, 128, 240, 0.2);
  transform: scale(1.05);
}

.copy-button-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  border-radius: 50%;
  background-color: rgba(32, 128, 240, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(32, 128, 240, 0.25);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  line-height: 1;
  margin-left: 4px;
}

.copy-button-inline:hover {
  background-color: rgba(32, 128, 240, 0.2);
  transform: scale(1.05);
}
</style>
