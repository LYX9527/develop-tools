<script setup lang="ts">
import {ref} from 'vue'
import {NInput, NButton, NTabs, NTabPane, useMessage, NSlider, NInputNumber, NSelect} from 'naive-ui'

const message = useMessage()
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

// 文件输入引用
const base64FileInput = ref<HTMLInputElement | null>(null)
const compressFileInput = ref<HTMLInputElement | null>(null)

// 处理图片选择（统一处理所有标签页的图片选择）
function handleImageSelect(event: Event, type: 'base64' | 'compress' | 'crop') {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    message.error('请选择图片文件')
    return
  }

  processImageFile(file, type)
}

// 处理拖放（统一处理所有标签页的拖放）
function handleDrop(event: DragEvent, type: 'base64' | 'compress' | 'crop') {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file, type)
  } else {
    message.error('请选择图片文件')
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false
}

// 处理图片文件
function processImageFile(file: File, type: 'base64' | 'compress' | 'crop') {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string

    switch (type) {
      case 'base64':
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
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(base64Output.value)
      .then(() => message.success('Base64已复制到剪贴板'))
      .catch(() => message.error('复制失败'))
}

// Base64转图片
function convertBase64ToImage() {
  if (!base64Input.value) {
    message.warning('请输入Base64编码')
    return
  }

  try {
    convertedPreviewUrl.value = base64Input.value
  } catch (error) {
    message.error('无效的Base64编码')
  }
}

// 下载转换后的图片
function downloadImage() {
  if (!convertedPreviewUrl.value) {
    message.warning('请先转换图片')
    return
  }

  const link = document.createElement('a')
  link.download = 'converted-image.png'
  link.href = convertedPreviewUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
    message.warning('请先选择图片')
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
    let {width, height} = img
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

    message.success('压缩成功')
  } catch (error) {
    message.error('压缩失败')
  }
}

// 触发文件选择
function triggerFileInput(type: 'base64' | 'compress') {
  switch (type) {
    case 'base64':
      base64FileInput.value?.click()
      break
    case 'compress':
      compressFileInput.value?.click()
      break
  }
}
</script>

<template>
  <div class="img-tool">
    <div class="tab-container">
      <div class="tab-header">
        <div class="tab" :class="{ active: activeTab === 'toBase64' }" @click="activeTab = 'toBase64'">
          图片转Base64
        </div>
        <div class="tab" :class="{ active: activeTab === 'toImage' }" @click="activeTab = 'toImage'">
          Base64转图片
        </div>
        <div class="tab" :class="{ active: activeTab === 'compress' }" @click="activeTab = 'compress'">
          图片压缩
        </div>
      </div>

      <div class="converter-section">
        <!-- 图片转Base64 -->
        <div v-if="activeTab === 'toBase64'" class="tab-content">
          <div class="drag-area"
               :class="{ 'dragover': isDragging }"
               @drop="e => handleDrop(e, 'base64')"
               @dragover="handleDragOver"
               @dragleave="handleDragLeave"
               @click="triggerFileInput('base64')">
            <input
                ref="base64FileInput"
                type="file"
                class="file-input"
                accept="image/*"
                @change="e => handleImageSelect(e, 'base64')">
            <div class="drag-area-text">拖放图片到这里，或点击选择图片</div>
          </div>

          <div class="preview-area" v-if="previewUrl">
            <img :src="previewUrl" class="preview-image">
          </div>

          <div class="button-group">
            <NButton class="action-button" @click="copyBase64">复制Base64</NButton>
          </div>

          <NInput
              v-model:value="base64Output"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 12 }"
              readonly
              placeholder="这里将显示图片的Base64编码"
          />
          <div class="info-text">图片大小: {{ imageSize }}</div>
        </div>

        <!-- Base64转图片 -->
        <div v-else-if="activeTab === 'toImage'" class="tab-content">
          <NInput
              v-model:value="base64Input"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 12 }"
              placeholder="在这里粘贴Base64编码"
          />
          <div class="button-group">
            <NButton class="action-button" @click="convertBase64ToImage">转换</NButton>
            <NButton class="action-button" @click="downloadImage" :disabled="!convertedPreviewUrl">
              下载图片
            </NButton>
          </div>

          <div class="preview-area" v-if="convertedPreviewUrl">
            <img :src="convertedPreviewUrl" class="preview-image">
          </div>
        </div>

        <!-- 图片压缩 -->
        <div v-else-if="activeTab === 'compress'" class="tab-content">
          <div class="drag-area"
               :class="{ 'dragover': isDragging }"
               @drop="e => handleDrop(e, 'compress')"
               @dragover="handleDragOver"
               @dragleave="handleDragLeave"
               @click="triggerFileInput('compress')">
            <input
                ref="compressFileInput"
                type="file"
                class="file-input"
                accept="image/*"
                @change="e => handleImageSelect(e, 'compress')">
            <div class="drag-area-text">拖放图片到这里，或点击选择图片</div>
          </div>

          <div class="settings-group" v-if="compressPreviewUrl">
            <div class="setting-item">
              <span class="setting-label">质量:</span>
              <NSlider v-model:value="compressSettings.quality" :min="1" :max="100" :step="1"/>
              <span class="setting-value">{{ compressSettings.quality }}%</span>
            </div>

            <div class="setting-item">
              <span class="setting-label">最大宽度:</span>
              <NInputNumber v-model:value="compressSettings.maxWidth" :min="100" :max="10000"/>
            </div>

            <div class="setting-item">
              <span class="setting-label">最大高度:</span>
              <NInputNumber v-model:value="compressSettings.maxHeight" :min="100" :max="10000"/>
            </div>

            <div class="setting-item">
              <span class="setting-label">输出格式:</span>
              <NSelect v-model:value="compressSettings.format" :options="[
                { label: 'JPEG', value: 'jpeg' },
                { label: 'PNG', value: 'png' },
                { label: 'WEBP', value: 'webp' }
              ]"/>
            </div>
          </div>

          <div class="preview-area" v-if="compressPreviewUrl">
            <img :src="compressPreviewUrl" class="preview-image">
            <div class="size-info">
              <div>原始大小: {{ compressFileSize }}</div>
              <div v-if="compressedFileSize !== '0 KB'">压缩后: {{ compressedFileSize }}</div>
            </div>
          </div>

          <div class="button-group center" v-if="compressPreviewUrl">
            <NButton class="action-button" @click="compressImage" :disabled="!compressFile">
              压缩并下载
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.img-tool {
  padding: 20px;

  .tab-container {
    max-width: 1200px;
    margin: 0 auto;
    background: var(--n-card-color);
    border-radius: 12px;
    border: 1px solid var(--n-border-color);
    box-shadow: var(--n-box-shadow);
    overflow: hidden;

    .tab-header {
      display: flex;
      border-bottom: 1px solid var(--n-divider-color);

      .tab {
        flex: 1;
        padding: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s var(--n-bezier);
        color: var(--n-text-color-2);
        background: var(--n-color);
        position: relative;
        border: var(--n-border-color);

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: transparent;
          transition: background-color 0.3s var(--n-bezier);
        }

        &.active {
          background: var(--n-card-color);
          color: var(--t-primary-color);
          font-weight: 500;

          &::after {
            background: var(--t-primary-color);
          }
        }

        &:hover:not(.active) {
          color: var(--n-primary-color-hover);
          background: var(--n-hover-color);
        }
      }
    }
  }

  .converter-section {
    padding: 30px;

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .button-group {
      display: flex;
      gap: 10px;
      justify-content: flex-end;

      .action-button {
        min-width: 100px;
        height: 36px;
        padding: 0 16px;
        background: var(--n-primary-color);
        color: var(--n-text-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s var(--n-bezier);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;

        &:hover {
          background: var(--n-primary-color-hover);
        }

        &:disabled {
          background: var(--n-text-color-3);
          cursor: not-allowed;
        }
      }
    }

    .file-input {
      display: none;
    }

    .drag-area {
      position: relative;
      border: 2px dashed var(--n-border-color);
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      background: var(--n-color);
      transition: all 0.3s var(--n-bezier);
      cursor: pointer;
      margin-bottom: 20px;

      .file-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: -1;
      }

      &.dragover {
        border-color: var(--n-primary-color);
        background: var(--n-hover-color);
      }

      .drag-area-text {
        color: var(--n-text-color-3);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        &::before {
          content: '';
          width: 40px;
          height: 40px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
          background-size: contain;
          opacity: 0.5;
          filter: var(--n-icon-filter);

          :deep([data-theme='dark'] &) {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
          }
        }
      }
    }

    .preview-area {
      text-align: center;

      .preview-image {
        max-width: 100%;
        max-height: 400px;
        border: 2px dashed var(--n-border-color);
        border-radius: 8px;
        padding: 10px;
        background: var(--n-color);
      }
    }

    .base64-output,
    .base64-input {
      :deep(.n-input) {
        .n-input__textarea-el {
          padding: 10px;
          border: 1px solid var(--n-border-color);
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          min-height: 120px;
          white-space: pre-wrap;
          word-break: break-all;
          background: var(--n-color);
          color: var(--n-text-color);
        }
      }
    }

    .info-text {
      color: var(--n-text-color-3);
      font-size: 14px;
    }

    .settings-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      background: var(--n-color);
      border-radius: 8px;
      border: 1px solid var(--n-border-color);

      .setting-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .setting-label {
          width: 80px;
          font-size: 14px;
          color: var(--n-text-color-2);
        }

        .setting-value {
          min-width: 48px;
          text-align: right;
          font-size: 14px;
          color: var(--n-text-color-3);
        }

        :deep(.n-slider) {
          flex: 1;
        }

        :deep(.n-input-number) {
          width: 120px;
        }

        :deep(.n-select) {
          width: 120px;
        }
      }
    }

    .size-info {
      margin-top: 8px;
      font-size: 14px;
      color: var(--n-text-color-3);
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .button-group.center {
      justify-content: center;
      margin-top: 20px;
    }

    .crop-container {
      aspect-ratio: 16/9;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      position: relative;

      .crop-preview {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
