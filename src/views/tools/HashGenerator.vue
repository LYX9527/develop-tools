<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {gsap} from 'gsap'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import TextArea from '@/components/ui/TextArea.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import Select from '@/components/ui/Select.vue'
import Toggle from '@/components/ui/Toggle.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()
const activeTab = ref(0)

// UUID 相关
const uuidResult = ref('')
const uuidCount = ref(1)
const uuidOptions = ref({
  uppercase: false,
  hyphens: true
})

// 哈希相关
const hashInput = ref('')
const hashType = ref('MD5')
const hashResult = ref('')

// 哈希校验相关
const hashVerifyFile = ref<File | null>(null)
const hashVerifyInput = ref('')
const hashVerifyResult = ref('')
const hashVerifyStatus = ref<'success' | 'error' | ''>('')
const hashFileInput = ref<HTMLInputElement | null>(null)
const isHashDragging = ref(false)

// 哈希算法选项
const hashOptions = [
  { label: 'MD5', value: 'MD5' },
  { label: 'SHA-1', value: 'SHA-1' },
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-384', value: 'SHA-384' },
  { label: 'SHA-512', value: 'SHA-512' }
]

// 添加文件大小格式化函数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 生成 UUID
function generateUUID() {
  const results = []
  for (let i = 0; i < uuidCount.value; i++) {
    let uuid = crypto.randomUUID() as string
    if (uuidOptions.value.uppercase) {
      uuid = uuid.toUpperCase()
    }
    if (!uuidOptions.value.hyphens) {
      uuid = uuid.replace(/-/g, '')
    }
    results.push(uuid)
  }
  uuidResult.value = results.join('\n')
  toast.success(`成功生成 ${uuidCount.value} 个UUID`)
}

// 计算哈希
async function calculateHash() {
  if (!hashInput.value.trim()) {
    toast.warning('请输入需要计算哈希的内容')
    return
  }

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(hashInput.value)

    // 根据选择的算法计算哈希
    let algorithm = hashType.value.toUpperCase()
    if (algorithm === 'MD5') {
      // 使用 MD5 算法
      const md5 = await import('crypto-js/md5')
      hashResult.value = md5.default(hashInput.value).toString()
    } else {
      // 使用 Web Crypto API
      const hashBuffer = await crypto.subtle.digest(algorithm, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      hashResult.value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    toast.success('哈希计算完成')
  } catch (error) {
    toast.error('哈希计算失败')
    console.error(error)
  }
}

// 复制结果
function copyResult(text: string) {
  if (!text) {
    toast.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(text)
    .then(() => toast.success('已复制到剪贴板'))
    .catch(() => toast.error('复制失败'))
}

// 清空UUID结果
function clearUUID() {
  uuidResult.value = ''
}

// 清空哈希结果
function clearHash() {
  hashInput.value = ''
  hashResult.value = ''
}

// 修改文件上传处理函数
async function handleHashFileUpload(file: File) {
  hashVerifyFile.value = file

  try {
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)

    let calculatedHash = ''
    if (hashType.value === 'MD5') {
      const md5 = await import('crypto-js/md5')
      const wordArray = await import('crypto-js/lib-typedarrays')
      calculatedHash = md5.default(wordArray.default.create(data)).toString()
    } else {
      const hashBuffer = await crypto.subtle.digest(hashType.value, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    hashVerifyResult.value = calculatedHash

    // 如果用户已输入校验值，则进行比对
    if (hashVerifyInput.value) {
      hashVerifyStatus.value = calculatedHash.toLowerCase() === hashVerifyInput.value.toLowerCase() ? 'success' : 'error'
      const status = hashVerifyStatus.value === 'success' ? '匹配' : '不匹配'
      toast[hashVerifyStatus.value](`文件哈希值${status}`)
    } else {
      toast.success('文件哈希计算完成')
    }
  } catch (error) {
    toast.error('哈希计算失败')
    console.error(error)
  }
}

// 监听校验输入值变化
watch(hashVerifyInput, (newValue) => {
  if (newValue && hashVerifyResult.value) {
    hashVerifyStatus.value = hashVerifyResult.value.toLowerCase() === newValue.toLowerCase() ? 'success' : 'error'
  } else {
    hashVerifyStatus.value = ''
  }
})

// 监听哈希算法变化
watch(hashType, () => {
  if (hashVerifyFile.value) {
    handleHashFileUpload(hashVerifyFile.value)
  }
})

// 哈希文件拖放处理
function handleHashDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isHashDragging.value = true
}

function handleHashDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isHashDragging.value = false
}

function handleHashDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isHashDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    handleHashFileUpload(file)
  }
}

// 触发哈希文件选择
function triggerHashFileInput() {
  hashFileInput.value?.click()
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    handleHashFileUpload(file)
  }
}

// 清空校验结果
function clearVerify() {
  hashVerifyFile.value = null
  hashVerifyInput.value = ''
  hashVerifyResult.value = ''
  hashVerifyStatus.value = ''
  if (hashFileInput.value) {
    hashFileInput.value.value = ''
  }
}

// 动画
onMounted(() => {
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
        <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
          生成工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          UUID生成、哈希计算和文件校验工具集合
        </p>
      </div>
      
      <!-- 标签页内容 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" :animated="true" variant="underline">
            <!-- UUID生成 -->
            <TabItem label="UUID生成">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 配置区域 -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">生成数量</label>
                    <NumberInput
                      v-model="uuidCount"
                      :max="100"
                      :min="1"
                      placeholder="输入生成数量"
                    />
                  </div>

                  <!-- 选项配置 -->
                  <div class="space-y-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">格式选项</label>
                    <div class="space-y-3">
                      <Toggle
                        v-model="uuidOptions.uppercase"
                        label="大写字母"
                      />
                      <Toggle
                        v-model="uuidOptions.hyphens"
                        label="包含连字符"
                      />
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex space-x-3">
                    <Button class="flex-1" variant="primary" @click="generateUUID">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      生成UUID
                    </Button>
                    <Button variant="ghost" @click="clearUUID">
                      清空
                    </Button>
                  </div>
                </div>

                <!-- 结果区域 -->
                <div class="space-y-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">生成结果</label>
                  <TextArea
                    v-model="uuidResult"
                    class="font-mono text-sm resize-none"
                    placeholder="生成的UUID将显示在这里"
                    readonly
                    rows="12"
                  />
                  <Button :disabled="!uuidResult" class="w-full" variant="ghost" @click="copyResult(uuidResult)">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    复制结果
                  </Button>
                </div>
              </div>
            </TabItem>

            <!-- 哈希计算 -->
            <TabItem label="哈希计算">
              <div class="space-y-8">
                <!-- 文本哈希计算 -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">文本哈希计算</h3>
                  <div class="grid lg:grid-cols-2 gap-8">
                    <!-- 输入区域 -->
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">算法</label>
                        <Select
                          v-model:modelValue="hashType"
                          :options="hashOptions"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入内容</label>
                        <TextArea
                          v-model="hashInput"
                          class="resize-none"
                          placeholder="输入需要计算哈希的内容"
                          rows="8"
                        />
                      </div>
                      <div class="flex space-x-3">
                        <Button class="flex-1" variant="primary" @click="calculateHash">
                          计算哈希
                        </Button>
                        <Button variant="ghost" @click="clearHash">
                          清空
                        </Button>
                      </div>
                    </div>

                    <!-- 结果区域 -->
                    <div class="space-y-4">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">哈希结果</label>
                      <TextArea
                        v-model="hashResult"
                        class="font-mono text-sm resize-none"
                        placeholder="哈希结果将显示在这里"
                        readonly
                        rows="8"
                      />
                      <Button :disabled="!hashResult" class="w-full" variant="ghost" @click="copyResult(hashResult)">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制结果
                      </Button>
                    </div>
                  </div>
                </div>

                <!-- 文件哈希校验 -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">文件哈希校验</h3>
                  <div class="grid lg:grid-cols-2 gap-8">
                    <!-- 校验输入 -->
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">期望哈希值（可选）</label>
                        <Input
                          v-model="hashVerifyInput"
                          class="font-mono"
                          placeholder="输入哈希值进行校验"
                        />
                      </div>

                      <!-- 文件上传区域 -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择文件</label>
                        <div
                          :class="{
                            'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isHashDragging,
                            'border-green-500 bg-green-50 dark:bg-green-900/20': hashVerifyStatus === 'success',
                            'border-red-500 bg-red-50 dark:bg-red-900/20': hashVerifyStatus === 'error',
                            'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500': !isHashDragging && !hashVerifyStatus
                          }"
                          class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                          @click="triggerHashFileInput"
                          @dragleave="handleHashDragLeave"
                          @dragover="handleHashDragOver"
                          @drop="handleHashDrop"
                        >
                          <input
                            ref="hashFileInput"
                            class="hidden"
                            type="file"
                            @change="handleFileSelect"
                          />
                          <div v-if="hashVerifyFile" class="space-y-2">
                            <svg class="w-12 h-12 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ hashVerifyFile.name }}</p>
                            <p class="text-xs text-gray-500">{{ formatFileSize(hashVerifyFile.size) }}</p>
                          </div>
                          <div v-else class="space-y-2">
                            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              点击上传或拖拽文件到此处
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button class="w-full" variant="ghost" @click="clearVerify">
                        清空校验
                      </Button>
                    </div>

                    <!-- 校验结果 -->
                    <div class="space-y-4">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">计算结果</label>
                      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-64">
                        <div v-if="hashVerifyResult" class="space-y-4">
                          <div class="flex items-center space-x-2">
                            <svg v-if="hashVerifyStatus === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            <svg v-else-if="hashVerifyStatus === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            <span :class="{
                              'text-green-600 dark:text-green-400': hashVerifyStatus === 'success',
                              'text-red-600 dark:text-red-400': hashVerifyStatus === 'error',
                              'text-blue-600 dark:text-blue-400': !hashVerifyStatus
                            }" class="text-sm font-medium">
                              {{ hashVerifyStatus === 'success' ? '哈希值匹配' : hashVerifyStatus === 'error' ? '哈希值不匹配' : '哈希计算完成' }}
                            </span>
                          </div>
                          <div class="bg-white dark:bg-gray-800 rounded p-3 border">
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">文件哈希值:</p>
                            <p class="font-mono text-sm break-all dark:text-amber-50">{{ hashVerifyResult }}</p>
                          </div>
                          <Button class="w-full" variant="ghost" @click="copyResult(hashVerifyResult)">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                            </svg>
                            复制哈希值
                          </Button>
                        </div>
                        <div v-else class="text-center text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
                          <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
                          </svg>
                          <p>上传文件后，哈希值将显示在这里</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">UUID生成</h4>
            <ul class="space-y-2">
              <li>• 支持生成标准UUID v4</li>
              <li>• 可选择大写/小写格式</li>
              <li>• 可选择是否包含连字符</li>
              <li>• 支持批量生成（最多100个）</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">哈希计算</h4>
            <ul class="space-y-2">
              <li>• 支持MD5、SHA-1、SHA-256等算法</li>
              <li>• 文本和文件哈希计算</li>
              <li>• 文件完整性校验</li>
              <li>• 支持拖拽上传文件</li>
            </ul>
          </div>
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
</style>
