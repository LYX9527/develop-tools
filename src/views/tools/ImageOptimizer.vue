<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import Select from '@/components/ui/Select.vue'
import Upload from '@/components/ui/Upload.vue'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()
const activeTab = ref('toBase64')

// 图片转Base64相关
const previewUrl = ref('')
const base64Output = ref('')
const imageSize = ref('0 KB')

// Base64转图片相关
const base64Input = ref('')
const convertedPreviewUrl = ref('')

// 拖放状态
const isDragging = ref(false)

// 压缩转换相关
const compressFile = ref<File | null>(null)
const compressPreviewUrl = ref('')
const compressSettings = ref({
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'jpeg'
})
const compressFileSize = ref('0 KB')
const compressedFileSize = ref('0 KB')

// 文件上传
const uploadedFiles = ref<File[]>([])

// 格式选项
const formatOptions = [
  { label: 'JPEG', value: 'jpeg' },
  { label: 'PNG', value: 'png' },
  { label: 'WEBP', value: 'webp' }
]

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

// 处理图片上传
async function handleFileUpload(files: File[]) {
  const file = files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }

  processImageFile(file, activeTab.value as 'toBase64' | 'compress')
}

// 处理上传错误
function handleUploadError(message: string) {
  toast.error(message)
}

// 处理图片文件
function processImageFile(file: File, type: 'toBase64' | 'compress') {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string

    switch (type) {
      case 'toBase64':
        base64Output.value = base64
        previewUrl.value = base64
        imageSize.value = formatFileSize(file.size)
        break
      case 'compress':
        compressFile.value = file
        compressPreviewUrl.value = base64
        compressFileSize.value = formatFileSize(file.size)
        compressedFileSize.value = '0 KB'
        break
    }
  }
  reader.readAsDataURL(file)
}

// 复制Base64
function copyBase64() {
  if (!base64Output.value) {
    toast.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(base64Output.value)
    .then(() => toast.success('Base64已复制到剪贴板'))
    .catch(() => toast.error('复制失败'))
}

// Base64转图片
function convertBase64ToImage() {
  if (!base64Input.value) {
    toast.warning('请输入Base64编码')
    return
  }

  try {
    // 验证Base64格式
    if (!base64Input.value.startsWith('data:image/')) {
      throw new Error('无效的图片Base64编码')
    }
    convertedPreviewUrl.value = base64Input.value
    toast.success('转换成功')
  } catch (error) {
    toast.error('无效的Base64编码')
  }
}

// 下载转换后的图片
function downloadImage() {
  if (!convertedPreviewUrl.value) {
    toast.warning('请先转换图片')
    return
  }

  const link = document.createElement('a')
  link.download = 'converted-image.png'
  link.href = convertedPreviewUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('图片已下载')
}

// 格式化文件大小
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 压缩图片
async function compressImage() {
  if (!compressFile.value) {
    toast.warning('请先选择图片')
    return
  }

  try {
    const img = new Image()
    img.src = compressPreviewUrl.value

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')

    // 计算缩放比例
    let { width, height } = img
    const ratio = Math.min(
      compressSettings.value.maxWidth / width,
      compressSettings.value.maxHeight / height
    )
    if (ratio < 1) {
      width *= ratio
      height *= ratio
    }

    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)

    // 转换为指定格式
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('压缩失败'))),
        `image/${compressSettings.value.format}`,
        compressSettings.value.quality / 100
      )
    })

    compressedFileSize.value = formatFileSize(blob.size)

    // 下载文件
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed.${compressSettings.value.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('压缩成功')
  } catch (error) {
    toast.error('压缩失败')
  }
}

// 清空当前标签页的数据
function clearCurrentTab() {
  switch (activeTab.value) {
    case 'toBase64':
      previewUrl.value = ''
      base64Output.value = ''
      imageSize.value = '0 KB'
      uploadedFiles.value = []
      break
    case 'toImage':
      base64Input.value = ''
      convertedPreviewUrl.value = ''
      break
    case 'compress':
      compressFile.value = null
      compressPreviewUrl.value = ''
      compressFileSize.value = '0 KB'
      compressedFileSize.value = '0 KB'
      uploadedFiles.value = []
      break
  }
}

// 处理标签页切换
function handleTabChange(value: string | number) {
  activeTab.value = value as string
  clearCurrentTab()
}
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
          图片优化工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          图片格式转换、压缩优化和Base64编码解码
        </p>
      </div>

      <!-- 标签页组件 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <Tab
          :animated="true"
          :model-value="activeTab"
          variant="underline"
          @change="handleTabChange"
        >
          <!-- 图片转Base64 -->
          <TabItem id="toBase64" label="图片转Base64">
            <div class="p-8 space-y-6">
              <!-- 上传区域 -->
              <div v-if="!previewUrl">
                <Upload
                  v-model="uploadedFiles"
                  :max-size="10 * 1024 * 1024"
                  accept="image/*"
                  label="上传图片文件"
                  @error="handleUploadError"
                  @update:modelValue="handleFileUpload"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  支持 PNG、JPG、GIF 等格式，最大 10MB
                </p>
              </div>

              <!-- 预览和操作 -->
              <div v-else class="space-y-4">
                <!-- 图片预览 -->
                <div class="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <img :src="previewUrl" alt="预览图片" class="w-full h-auto max-h-64 object-contain rounded" />
                </div>

                <!-- 操作按钮 -->
                <div class="flex space-x-2">
                  <Button class="flex-1" size="sm" variant="ghost" @click="clearCurrentTab">
                    清空
                  </Button>
                  <Button class="flex-1" size="sm" variant="primary" @click="copyBase64">
                    复制Base64
                  </Button>
                </div>

                <!-- Base64输出 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base64编码</label>
                  <textarea
                    v-model="base64Output"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-vertical"
                    placeholder="这里将显示图片的Base64编码"
                    readonly
                    rows="8"
                  ></textarea>
                </div>

                <div class="text-sm text-gray-500 dark:text-gray-400">
                  图片大小: {{ imageSize }}
                </div>
              </div>
            </div>
          </TabItem>

          <!-- Base64转图片 -->
          <TabItem id="toImage" label="Base64转图片">
            <div class="p-8 space-y-6">
              <!-- Base64输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base64编码</label>
                <textarea
                  v-model="base64Input"
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-vertical"
                  placeholder="在这里粘贴Base64编码"
                  rows="8"
                ></textarea>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-2">
                <Button variant="primary" @click="convertBase64ToImage">
                  转换为图片
                </Button>
                <Button
                  :disabled="!convertedPreviewUrl"
                  variant="ghost"
                  @click="downloadImage"
                >
                  下载图片
                </Button>
                <Button variant="ghost" @click="clearCurrentTab">
                  清空
                </Button>
              </div>

              <!-- 预览区域 -->
              <div v-if="convertedPreviewUrl" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <img :src="convertedPreviewUrl" alt="转换后的图片" class="w-full h-auto max-h-64 object-contain rounded" />
              </div>
            </div>
          </TabItem>

          <!-- 图片压缩 -->
          <TabItem id="compress" label="图片压缩">
            <div class="p-8 space-y-6">
              <!-- 上传区域 -->
              <div v-if="!compressPreviewUrl">
                <Upload
                  v-model="uploadedFiles"
                  :max-size="20 * 1024 * 1024"
                  accept="image/*"
                  label="上传要压缩的图片"
                  @error="handleUploadError"
                  @update:modelValue="handleFileUpload"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  支持 PNG、JPG、WEBP 等格式，最大 20MB
                </p>
              </div>

              <!-- 压缩设置和预览 -->
              <div v-else class="grid lg:grid-cols-2 gap-6">
                <!-- 左侧：设置 -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">压缩设置</h3>

                  <!-- 质量设置 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      质量: {{ compressSettings.quality }}%
                    </label>
                    <input
                      v-model="compressSettings.quality"
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      max="100"
                      min="1"
                      type="range"
                    />
                  </div>

                  <!-- 最大宽度 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">最大宽度</label>
                    <NumberInput
                      v-model="compressSettings.maxWidth"
                      :max="5000"
                      :min="100"
                    />
                  </div>

                  <!-- 最大高度 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">最大高度</label>
                    <NumberInput
                      v-model="compressSettings.maxHeight"
                      :max="5000"
                      :min="100"
                    />
                  </div>

                  <!-- 输出格式 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输出格式</label>
                    <Select
                      v-model="compressSettings.format"
                      :options="formatOptions"
                    />
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex space-x-2">
                    <Button :disabled="!compressFile" variant="primary" @click="compressImage">
                      压缩并下载
                    </Button>
                    <Button variant="ghost" @click="clearCurrentTab">
                      重新选择
                    </Button>
                  </div>
                </div>

                <!-- 右侧：预览 -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">图片预览</h3>

                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <img :src="compressPreviewUrl" alt="预览图片" class="w-full h-auto max-h-64 object-contain rounded" />
                  </div>

                  <!-- 文件大小信息 -->
                  <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>原始大小: {{ compressFileSize }}</div>
                    <div v-if="compressedFileSize !== '0 KB'">压缩后: {{ compressedFileSize }}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabItem>
        </Tab>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">图片转Base64</h4>
            <ul class="space-y-1">
              <li>• 支持多种图片格式</li>
              <li>• 一键复制Base64编码</li>
              <li>• 实时显示文件大小</li>
              <li>• 适用于网页嵌入</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">Base64转图片</h4>
            <ul class="space-y-1">
              <li>• 粘贴Base64编码</li>
              <li>• 实时预览转换结果</li>
              <li>• 支持直接下载</li>
              <li>• 自动格式识别</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">图片压缩</h4>
            <ul class="space-y-1">
              <li>• 调节压缩质量</li>
              <li>• 自定义输出尺寸</li>
              <li>• 多种格式支持</li>
              <li>• 实时大小对比</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* 自定义滑块样式 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 滚动条样式 */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 深色模式滚动条 */
.dark textarea::-webkit-scrollbar-track {
  background: #374151;
}

.dark textarea::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark textarea::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
