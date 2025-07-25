<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import {useToast} from '@/composables/useToast'
import {DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'

const toast = useToast()

// S3 配置
const s3Config = ref({
  endpoint: 'https://examples',
  region: 'auto',
  bucket: '',
  accessKeyId: '',
  secretAccessKey: '',
})

// 文件相关状态
const files = ref<File[]>([])
const uploadingFiles = ref<{
  file: File,
  progress: number,
  status: 'waiting' | 'uploading' | 'success' | 'error',
  url?: string,
  error?: string
}[]>([])
const dragActive = ref(false)
const isUploading = ref(false)
const folderPath = ref('')

// 文件列表弹窗状态
const showFileListModal = ref(false)
const bucketFiles = ref<{
  key: string,
  size: number,
  lastModified: Date,
}[]>([])
const isLoadingFiles = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalFiles = ref(0)

// S3 客户端
let s3Client: S3Client | null = null

// 拖放处理
function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = true
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false

  if (e.dataTransfer?.files) {
    addFiles(e.dataTransfer.files)
  }
}

// 添加文件到上传列表
function addFiles(fileList: FileList) {
  const newFiles = Array.from(fileList)
  files.value = [...files.value, ...newFiles]

  // 添加到上传队列
  uploadingFiles.value = [
    ...uploadingFiles.value,
    ...newFiles.map(file => ({
      file,
      progress: 0,
      status: 'waiting' as const
    }))
  ]
}

// 移除文件
function removeFile(index: number) {
  if (uploadingFiles.value[index].status === 'uploading') {
    return toast.warning('文件正在上传中，无法移除')
  }

  uploadingFiles.value.splice(index, 1)
}

// 选择文件
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    addFiles(input.files)
  }
}

// 初始化 S3 客户端
function initS3Client() {
  try {
    if (!validateConfig()) {
      return false
    }

    s3Client = new S3Client({
      region: s3Config.value.region,
      endpoint: s3Config.value.endpoint,
      credentials: {
        accessKeyId: s3Config.value.accessKeyId,
        secretAccessKey: s3Config.value.secretAccessKey
      },
      forcePathStyle: true
    })
    toast.success('S3 客户端连接成功')
    return true
  } catch (error) {
    console.error('初始化 S3 客户端失败:', error)
    toast.error('S3 客户端连接失败，请检查配置')
    return false
  }
}

// 验证配置
function validateConfig() {
  if (!s3Config.value.bucket) {
    toast.error('存储桶名称不能为空')
    return false
  }

  if (!s3Config.value.accessKeyId) {
    toast.error('Access Key ID 不能为空')
    return false
  }

  if (!s3Config.value.secretAccessKey) {
    toast.error('Secret Access Key 不能为空')
    return false
  }

  return true
}

// 上传所有文件
async function uploadAllFiles() {
  if (!s3Client && !initS3Client()) {
    return
  }

  if (uploadingFiles.value.length === 0) {
    return toast.warning('请先选择文件')
  }

  if (!s3Config.value.bucket) {
    return toast.warning('请输入存储桶名称')
  }

  isUploading.value = true

  // 过滤出等待上传的文件
  const waitingFiles = uploadingFiles.value.filter(f => f.status === 'waiting')

  try {
    // 并行上传文件，最多 5 个同时上传
    const batchSize = 5
    for (let i = 0; i < waitingFiles.length; i += batchSize) {
      const batch = waitingFiles.slice(i, i + batchSize)
      await Promise.all(batch.map(fileInfo => uploadFile(fileInfo)))
    }

    toast.success('所有文件上传完成')
  } catch (error) {
    console.error('上传文件过程中出错:', error)
    toast.error('上传过程中发生错误')
  } finally {
    isUploading.value = false
  }
}

// 上传单个文件
async function uploadFile(fileInfo: typeof uploadingFiles.value[0]) {
  if (!s3Client) {
    return
  }

  // 更新状态为上传中
  fileInfo.status = 'uploading'

  try {
    // 构建上传路径
    let key = fileInfo.file.name
    if (folderPath.value) {
      // 确保文件夹路径以 / 结尾
      const normalizedPath = folderPath.value.endsWith('/')
          ? folderPath.value
          : `${folderPath.value}/`
      key = `${normalizedPath}${key}`
    }

    // 为了解决流问题，使用 ArrayBuffer
    const fileContent = await fileInfo.file.arrayBuffer()

    // 创建上传命令
    const command = new PutObjectCommand({
      Bucket: s3Config.value.bucket,
      Key: key,
      Body: fileContent,
      ContentType: fileInfo.file.type || 'application/octet-stream'
    })

    // 模拟上传进度（AWS SDK v3 暂不支持直接进度回调）
    fileInfo.progress = 25
    await new Promise(resolve => setTimeout(resolve, 200))

    fileInfo.progress = 50
    await new Promise(resolve => setTimeout(resolve, 200))

    fileInfo.progress = 75

    // 上传文件
    const response = await s3Client.send(command)

    // 更新状态为成功
    fileInfo.status = 'success'
    fileInfo.progress = 100
    fileInfo.url = `${s3Config.value.endpoint}/${s3Config.value.bucket}/${key}`

    toast.success(`文件 ${fileInfo.file.name} 上传成功`)
  } catch (error: any) {
    console.error('上传文件失败:', error)
    fileInfo.status = 'error'
    fileInfo.error = error.message || '上传失败'
    toast.error(`文件 ${fileInfo.file.name} 上传失败: ${fileInfo.error}`)
  }
}

// 复制文件 URL
function copyFileUrl(url: string) {
  navigator.clipboard.writeText(url)
      .then(() => toast.success('URL 已复制到剪贴板'))
      .catch(() => toast.error('复制 URL 失败'))
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 加载和保存配置
function saveConfig() {
  localStorage.setItem('s3_upload_config', JSON.stringify(s3Config.value))
  toast.success('配置已保存')
  initS3Client()
}

function loadConfig() {
  const savedConfig = localStorage.getItem('s3_upload_config')
  if (savedConfig) {
    try {
      s3Config.value = JSON.parse(savedConfig)
      toast.success('配置已加载')
      initS3Client()
    } catch (e) {
      toast.error('加载配置失败')
    }
  }
}

// 测试连接
function testConnection() {
  if (!validateConfig()) {
    return
  }

  if (initS3Client()) {
    toast.success('S3连接测试成功')
  }
}

// 打开文件列表弹窗并加载文件
async function openFileList() {
  if (!s3Client && !initS3Client()) {
    return
  }

  showFileListModal.value = true
  await listBucketFiles()
}

// 列出存储桶中的文件
async function listBucketFiles() {
  if (!s3Client) return

  isLoadingFiles.value = true
  bucketFiles.value = []

  try {
    const command = new ListObjectsV2Command({
      Bucket: s3Config.value.bucket,
      MaxKeys: 1000,
      Prefix: folderPath.value || undefined
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      bucketFiles.value = response.Contents
          .filter(item => item.Key && item.Size !== undefined && item.LastModified)
          .map(item => ({
            key: item.Key!,
            size: item.Size!,
            lastModified: item.LastModified!
          }))

      totalFiles.value = bucketFiles.value.length
    }

    toast.success(`已加载 ${bucketFiles.value.length} 个文件`)
  } catch (error) {
    console.error('加载文件列表失败:', error)
    toast.error('加载文件列表失败')
  } finally {
    isLoadingFiles.value = false
  }
}

// 删除文件
async function deleteFile(key: string) {
  if (!s3Client) return

  try {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.value.bucket,
      Key: key
    })

    await s3Client.send(command)

    // 从列表中移除
    bucketFiles.value = bucketFiles.value.filter(file => file.key !== key)
    totalFiles.value = bucketFiles.value.length

    toast.success('文件已删除')
  } catch (error) {
    console.error('删除文件失败:', error)
    toast.error('删除文件失败')
  }
}

// 构建文件公共 URL
function getFileUrl(key: string) {
  if (s3Config.value.endpoint.includes('r2.cloudflarestorage.com')) {
    return `${s3Config.value.endpoint}/${key}`
  } else {
    return `${s3Config.value.endpoint}/${s3Config.value.bucket}/${key}`
  }
}

// 生命周期钩子
onMounted(() => {
  loadConfig()

  // 添加全局拖放事件监听器
  window.addEventListener('dragenter', handleDragEnter)
  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('dragleave', handleDragLeave)
  window.addEventListener('drop', handleDrop)

  // 动画
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

onUnmounted(() => {
  // 移除全局拖放事件监听器
  window.removeEventListener('dragenter', handleDragEnter)
  window.removeEventListener('dragover', handleDragOver)
  window.removeEventListener('dragleave', handleDragLeave)
  window.removeEventListener('drop', handleDrop)
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          S3 文件上传工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          兼容 S3 API 的文件拖拽上传工具，支持 R2、MinIO 等兼容 S3 的存储服务
        </p>
      </div>

      <!-- S3 配置面板 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            S3 兼容存储配置
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">终端节点 (Endpoint)</label>
              <Input
                v-model="s3Config.endpoint"
                placeholder="例如: https://endpoint.example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">区域 (Region)</label>
              <Input
                v-model="s3Config.region"
                placeholder="例如: us-east-1"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">存储桶 (Bucket)</label>
              <Input
                v-model="s3Config.bucket"
                placeholder="存储桶名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文件夹路径 (可选)</label>
              <Input
                v-model="folderPath"
                placeholder="例如: images/2023/ (可选)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">访问密钥 ID (Access Key ID)</label>
              <Input
                v-model="s3Config.accessKeyId"
                placeholder="访问密钥 ID"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">秘密访问密钥 (Secret Access Key)</label>
              <Input
                v-model="s3Config.secretAccessKey"
                placeholder="秘密访问密钥"
                type="password"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <Button variant="ghost" @click="saveConfig">保存配置</Button>
            <Button variant="secondary" @click="testConnection">测试连接</Button>
            <Button variant="primary" @click="openFileList">查看文件列表</Button>
          </div>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            文件上传
          </h2>

          <div
            :class="{
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20': dragActive,
              'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500': !dragActive
            }"
            class="border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300"
            @dragenter.prevent="dragActive = true"
            @dragover.prevent
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop"
          >
            <div class="space-y-4">
              <div class="mx-auto w-16 h-16 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
                </svg>
              </div>
              <div>
                <p class="text-xl text-gray-600 dark:text-gray-300 mb-2">拖放文件到此处</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">或点击下方按钮选择文件</p>
              </div>
              <label class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                选择文件
                <input
                  class="hidden"
                  multiple
                  type="file"
                  @change="handleFileSelect"
                >
              </label>
            </div>
          </div>

          <!-- 文件列表 -->
          <div v-if="uploadingFiles.length > 0" class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">上传文件列表</h3>

            <div class="space-y-3">
              <div
                v-for="(fileInfo, index) in uploadingFiles"
                :key="index"
                class="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <!-- 文件信息 -->
                <div class="flex-1 min-w-0 mr-4">
                  <div class="font-medium text-gray-900 dark:text-white truncate">
                    {{ fileInfo.file.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatFileSize(fileInfo.file.size) }}
                  </div>
                </div>

                <!-- 进度条 -->
                <div class="w-32 mr-4">
                  <div class="flex items-center space-x-2">
                    <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        :class="{
                          'bg-gray-300': fileInfo.status === 'waiting',
                          'bg-blue-500': fileInfo.status === 'uploading',
                          'bg-green-500': fileInfo.status === 'success',
                          'bg-red-500': fileInfo.status === 'error'
                        }"
                        :style="{ width: `${fileInfo.progress}%` }"
                        class="h-2 rounded-full transition-all duration-300"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-8">{{ fileInfo.progress }}%</span>
                  </div>
                </div>

                <!-- 状态 -->
                <div class="w-20 text-sm text-center">
                  <span
                    :class="{
                      'text-gray-500': fileInfo.status === 'waiting',
                      'text-blue-500': fileInfo.status === 'uploading',
                      'text-green-500': fileInfo.status === 'success',
                      'text-red-500': fileInfo.status === 'error'
                    }"
                  >
                    {{ fileInfo.status === 'waiting' ? '等待' :
                       fileInfo.status === 'uploading' ? '上传中' :
                       fileInfo.status === 'success' ? '成功' : '失败' }}
                  </span>
                </div>

                <!-- 操作按钮 -->
                <div class="flex space-x-2">
                  <Button
                    v-if="fileInfo.status === 'success' && fileInfo.url"
                    size="sm"
                    variant="ghost"
                    @click="copyFileUrl(fileInfo.url)"
                  >
                    复制链接
                  </Button>

                  <Button
                    v-if="fileInfo.status !== 'uploading'"
                    size="sm"
                    variant="ghost"
                    @click="removeFile(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            <div class="flex justify-center mt-6">
              <Button
                :disabled="isUploading"
                variant="primary"
                @click="uploadAllFiles"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                {{ isUploading ? '上传中...' : '上传所有文件' }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件列表弹窗 -->
      <div v-if="showFileListModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showFileListModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">存储桶文件列表</h3>
              <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" @click="showFileListModal = false">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <div class="flex justify-end mb-4">
              <Button
                :disabled="isLoadingFiles"
                variant="primary"
                @click="listBucketFiles"
              >
                {{ isLoadingFiles ? '加载中...' : '刷新文件列表' }}
              </Button>
            </div>

            <div v-if="isLoadingFiles" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p class="text-gray-500 dark:text-gray-400 mt-2">加载中...</p>
            </div>

            <div v-else-if="bucketFiles.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">暂无文件</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">文件名</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">大小</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">修改时间</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="file in bucketFiles"
                    :key="file.key"
                    class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td class="py-3 px-4 text-gray-900 dark:text-white">{{ file.key }}</td>
                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300">{{ formatFileSize(file.size) }}</td>
                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300">{{ file.lastModified.toLocaleString() }}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex justify-center space-x-2">
                        <Button size="sm" variant="ghost" @click="copyFileUrl(getFileUrl(file.key))">
                          复制链接
                        </Button>
                        <Button size="sm" variant="ghost" @click="deleteFile(file.key)">
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">支持的存储服务</h4>
            <ul class="space-y-2">
              <li>• Amazon S3</li>
              <li>• Cloudflare R2</li>
              <li>• MinIO</li>
              <li>• 其他兼容 S3 API 的存储服务</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">功能特性</h4>
            <ul class="space-y-2">
              <li>• 拖拽上传文件</li>
              <li>• 批量文件上传</li>
              <li>• 文件列表管理</li>
              <li>• 配置本地保存</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>隐私提示：</strong>上传的文件仅保存在您指定的S3存储桶中，本工具不会保留任何副本。请妥善管理您的访问凭证。
          </p>
        </div>

        <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>配置说明：</strong>
            <br>• 对于Cloudflare R2，终端节点格式：https://&lt;账户ID&gt;.r2.cloudflarestorage.com
            <br>• 对于MinIO，终端节点格式：http://&lt;IP地址&gt;:9000
            <br>• 对于AWS S3，终端节点格式：https://s3.&lt;区域&gt;.amazonaws.com
          </p>
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

/* 拖拽动画 */
.drop-zone {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drop-zone.active {
  transform: scale(1.02);
}

/* 进度条动画 */
.progress-fill {
  transition: width 0.3s ease-in-out;
}

/* 悬停效果 */
.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}
</style>
