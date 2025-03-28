<script setup lang="ts">
import {ref, onMounted, onUnmounted, h} from 'vue'
import {useMessage, NDataTable, NButton, NSpace} from 'naive-ui'
import GlassMorphismInput from "@/components/GlassMorphismInput.vue"
import GlassMorphismPanel from "@/components/GlassMorphismPanel.vue"
import GlassMorphismDialog from "@/components/GlassMorphismDialog.vue"
import {S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand} from '@aws-sdk/client-s3'

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

const message = useMessage()

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
    return message.warning('文件正在上传中，无法移除')
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
    message.success('S3 客户端连接成功')
    return true
  } catch (error) {
    console.error('初始化 S3 客户端失败:', error)
    message.error('S3 客户端连接失败，请检查配置')
    return false
  }
}

// 验证配置
function validateConfig() {
  if (!s3Config.value.bucket) {
    message.error('存储桶名称不能为空')
    return false
  }

  if (!s3Config.value.accessKeyId) {
    message.error('Access Key ID 不能为空')
    return false
  }

  if (!s3Config.value.secretAccessKey) {
    message.error('Secret Access Key 不能为空')
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
    return message.warning('请先选择文件')
  }

  if (!s3Config.value.bucket) {
    return message.warning('请输入存储桶名称')
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

    message.success('所有文件上传完成')
  } catch (error) {
    console.error('上传文件过程中出错:', error)
    message.error('上传过程中发生错误')
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

    // 上传文件
    const response = await s3Client.send(command)

    // 更新状态为成功
    fileInfo.status = 'success'
    fileInfo.progress = 100
    fileInfo.url = `${s3Config.value.endpoint}/${s3Config.value.bucket}/${key}`

    message.success(`文件 ${fileInfo.file.name} 上传成功`)
  } catch (error: any) {
    console.error('上传文件失败:', error)
    fileInfo.status = 'error'
    fileInfo.error = error.message || '上传失败'
    message.error(`文件 ${fileInfo.file.name} 上传失败: ${fileInfo.error}`)
  }
}

// 复制文件 URL
function copyFileUrl(url: string) {
  navigator.clipboard.writeText(url)
      .then(() => message.success('URL 已复制到剪贴板'))
      .catch(() => message.error('复制 URL 失败'))
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
  message.success('配置已保存')
  initS3Client()
}

function loadConfig() {
  const savedConfig = localStorage.getItem('s3_upload_config')
  if (savedConfig) {
    try {
      s3Config.value = JSON.parse(savedConfig)
      message.success('配置已加载')
      initS3Client()
    } catch (e) {
      message.error('加载配置失败')
    }
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

    message.success(`已加载 ${bucketFiles.value.length} 个文件`)
  } catch (error) {
    console.error('加载文件列表失败:', error)
    message.error('加载文件列表失败')
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

    message.success('文件已删除')
  } catch (error) {
    console.error('删除文件失败:', error)
    message.error('删除文件失败')
  }
}

// 构建文件公共 URL
function getFileUrl(key: string) {
  if (s3Config.value.endpoint.includes('r2.cloudflarestorage.com')) {
    // Cloudflare R2 格式
    return `${s3Config.value.endpoint}/${key}`
  } else {
    // 一般 S3 兼容服务格式
    return `${s3Config.value.endpoint}/${s3Config.value.bucket}/${key}`
  }
}

// 表格列定义
const columns = [
  {
    title: '文件名',
    key: 'key',
    ellipsis: true
  },
  {
    title: '大小',
    key: 'size',
    render: (row) => formatFileSize(row.size)
  },
  {
    title: '修改时间',
    key: 'lastModified',
    render: (row) => row.lastModified.toLocaleString()
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(
          NSpace,
          {justify: 'center'},
          {
            default: () => [
              h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => copyFileUrl(getFileUrl(row.key))
                  },
                  {default: () => '复制链接'}
              ),
              h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    onClick: () => deleteFile(row.key)
                  },
                  {default: () => '删除'}
              )
            ]
          }
      )
    }
  }
]

// 生命周期钩子
onMounted(() => {
  loadConfig()

  // 添加全局拖放事件监听器
  window.addEventListener('dragenter', handleDragEnter)
  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('dragleave', handleDragLeave)
  window.addEventListener('drop', handleDrop)
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
  <div class="s3-upload-tool">
    <!-- S3 配置面板 -->
    <GlassMorphismPanel :blur="5" :opacity="0.2" :radius="12" class="config-panel">
      <h2>S3 兼容存储配置</h2>

      <div class="config-form">
        <div class="form-group">
          <label>终端节点 (Endpoint)</label>
          <GlassMorphismInput
              v-model="s3Config.endpoint"
              placeholder="例如: https://endpoint.example.com"
              :blur="5"
              :opacity="0.2"
          />
        </div>

        <div class="form-group">
          <label>区域 (Region)</label>
          <GlassMorphismInput
              v-model="s3Config.region"
              placeholder="例如: us-east-1"
              :blur="5"
              :opacity="0.2"
          />
        </div>

        <div class="form-group">
          <label>存储桶 (Bucket)</label>
          <GlassMorphismInput
              v-model="s3Config.bucket"
              placeholder="存储桶名称"
              :blur="5"
              :opacity="0.2"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>访问密钥 ID (Access Key ID)</label>
            <GlassMorphismInput
                v-model="s3Config.accessKeyId"
                placeholder="访问密钥 ID"
                :blur="5"
                :opacity="0.2"
            />
          </div>

          <div class="form-group">
            <label>秘密访问密钥 (Secret Access Key)</label>
            <GlassMorphismInput
                v-model="s3Config.secretAccessKey"
                placeholder="秘密访问密钥"
                type="password"
                :blur="5"
                :opacity="0.2"
            />
          </div>
        </div>

        <div class="form-group">
          <label>文件夹路径 (可选)</label>
          <GlassMorphismInput
              v-model="folderPath"
              placeholder="例如: images/2023/ (可选)"
              :blur="5"
              :opacity="0.2"
          />
        </div>

        <div class="form-actions">
          <button class="glass-button" @click="saveConfig">保存配置</button>
          <button class="glass-button" @click="initS3Client">测试连接</button>
          <button class="glass-button" @click="openFileList">查看文件列表</button>
        </div>
      </div>
    </GlassMorphismPanel>

    <!-- 文件上传区域 -->
    <GlassMorphismPanel :blur="5" :opacity="0.2" :radius="12" class="upload-panel">
      <h2>文件上传</h2>

      <div
          class="drop-zone"
          :class="{ 'active': dragActive }"
          @dragenter.prevent="dragActive = true"
          @dragover.prevent
          @dragleave.prevent="dragActive = false"
          @drop.prevent="handleDrop"
      >
        <div class="drop-content">
          <div class="drop-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p>拖放文件到此处，或</p>
          <label class="file-select-button">
            选择文件
            <input
                type="file"
                multiple
                @change="handleFileSelect"
                style="display: none"
            >
          </label>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="file-list" v-if="uploadingFiles.length > 0">
        <h3>上传文件列表</h3>

        <div class="file-item" v-for="(fileInfo, index) in uploadingFiles" :key="index">
          <div class="file-info">
            <div class="file-name">{{ fileInfo.file.name }}</div>
            <div class="file-size">{{ formatFileSize(fileInfo.file.size) }}</div>
          </div>

          <div class="file-status">
            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: `${fileInfo.progress}%` }"
                  :class="fileInfo.status"
              ></div>
            </div>

            <div class="status-text" :class="fileInfo.status">
              <span v-if="fileInfo.status === 'waiting'">等待上传</span>
              <span v-else-if="fileInfo.status === 'uploading'">上传中...</span>
              <span v-else-if="fileInfo.status === 'success'">上传成功</span>
              <span v-else-if="fileInfo.status === 'error'">
                上传失败: {{ fileInfo.error }}
              </span>
            </div>
          </div>

          <div class="file-actions">
            <button
                v-if="fileInfo.status === 'success' && fileInfo.url"
                class="action-button copy-button"
                @click="copyFileUrl(fileInfo.url)"
                title="复制文件 URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>

            <button
                v-if="fileInfo.status !== 'uploading'"
                class="action-button remove-button"
                @click="removeFile(index)"
                title="移除文件"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="upload-actions">
          <button
              class="glass-button upload-button"
              :disabled="isUploading"
              @click="uploadAllFiles"
          >
            {{ isUploading ? '上传中...' : '上传所有文件' }}
          </button>
        </div>
      </div>
    </GlassMorphismPanel>

    <!-- 文件列表弹窗使用新的GlassMorphismDialog组件 -->
    <GlassMorphismDialog
        v-model:show="showFileListModal"
        title="存储桶文件列表"
        :blur="5"
        :opacity="0.2"
        :radius="12"
        width="800px"
    >
      <div class="modal-content">
        <div class="modal-actions">
          <button class="glass-button" @click="listBucketFiles" :disabled="isLoadingFiles">
            {{ isLoadingFiles ? '加载中...' : '刷新文件列表' }}
          </button>
        </div>

        <n-data-table
            :loading="isLoadingFiles"
            :columns="columns"
            :data="bucketFiles"
            :pagination="{
            page: currentPage,
            pageSize: pageSize,
            itemCount: totalFiles,
            onChange: (page) => { currentPage = page }
          }"
        />
      </div>
    </GlassMorphismDialog>

    <!-- 在此处添加版权标识，放在最后 -->
    <div class="copyright-footer">
      <div class="copyright-content">
        <p>Copyright © 2024-{{ new Date().getFullYear() }} S3文件管理工具</p>
        <p class="copyright-notice">上传的文件仅保存在您指定的S3存储桶中，本工具不会保留任何副本。请妥善管理您的访问凭证。</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.s3-upload-tool {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--n-text-color);
  font-weight: 500;
}

h3 {
  margin-top: 10px;
  margin-bottom: 15px;
  color: var(--n-text-color);
  font-weight: 500;
}

.config-panel, .upload-panel {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    color: var(--n-text-color-3);
    font-size: 14px;
  }
}

.form-row {
  display: flex;
  gap: 15px;

  .form-group {
    flex: 1;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.glass-button {
  background: rgba(0, 123, 255, 0.2);
  color: var(--n-text-color);
  border: 1px solid rgba(0, 123, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(0, 123, 255, 0.3);
    border-color: rgba(0, 123, 255, 0.5);
  }

  &:active {
    background: rgba(0, 123, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);

  &.active {
    border-color: rgba(0, 123, 255, 0.6);
    background: rgba(0, 123, 255, 0.1);
  }

  .drop-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .drop-icon {
      color: var(--n-text-color-3);
      margin-bottom: 15px;

      svg {
        stroke: currentColor;
      }
    }

    p {
      margin: 0 0 15px;
      color: var(--n-text-color-2);
    }
  }
}

.file-select-button {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  background: rgba(0, 123, 255, 0.2);
  color: var(--n-text-color);
  border: 1px solid rgba(0, 123, 255, 0.3);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 123, 255, 0.3);
    border-color: rgba(0, 123, 255, 0.5);
  }
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 10px;

  .file-info {
    flex: 1;
    overflow: hidden;
    margin-right: 10px;

    .file-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      color: var(--n-text-color);
    }

    .file-size {
      font-size: 12px;
      color: var(--n-text-color-3);
    }
  }

  .file-status {
    width: 200px;
    margin-right: 10px;

    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 4px;

      .progress-fill {
        height: 100%;
        width: 0;
        border-radius: 3px;
        transition: width 0.3s ease;

        &.waiting {
          background-color: rgba(255, 255, 255, 0.3);
        }

        &.uploading {
          background-color: rgba(0, 123, 255, 0.5);
        }

        &.success {
          background-color: rgba(40, 167, 69, 0.5);
        }

        &.error {
          background-color: rgba(220, 53, 69, 0.5);
        }
      }
    }

    .status-text {
      font-size: 12px;

      &.waiting {
        color: var(--n-text-color-3);
      }

      &.uploading {
        color: #007bff;
      }

      &.success {
        color: #28a745;
      }

      &.error {
        color: #dc3545;
      }
    }
  }

  .file-actions {
    display: flex;
    gap: 5px;

    .action-button {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;

      &.copy-button {
        background: rgba(40, 167, 69, 0.2);
        color: var(--n-text-color);

        &:hover {
          background: rgba(40, 167, 69, 0.3);
        }
      }

      &.remove-button {
        background: rgba(220, 53, 69, 0.2);
        color: var(--n-text-color);

        &:hover {
          background: rgba(220, 53, 69, 0.3);
        }
      }
    }
  }
}

.upload-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;

  .upload-button {
    min-width: 200px;
  }
}

// 文件列表弹窗样式
.file-list-modal {
  .modal-content {
    .modal-actions {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

/* 添加版权样式 */
.copyright-footer {
  margin-top: 30px;
  padding: 15px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .copyright-content {
    p {
      margin: 5px 0;
      color: var(--n-text-color-3);
      font-size: 14px;

      &.copyright-notice {
        font-size: 12px;
        opacity: 0.8;
        max-width: 600px;
        margin: 8px auto 0;
        line-height: 1.5;
      }
    }
  }
}
</style>
