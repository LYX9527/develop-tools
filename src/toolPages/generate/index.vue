<script setup lang="ts">
import {ref, watch} from 'vue'
import {NInput, NButton, NTabs, NTabPane, NSelect, useMessage} from 'naive-ui'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import GlassMorphismSelect from "@/components/GlassMorphismSelect.vue";
import GlassMorphismButton from "@/components/GlassMorphismButton.vue";
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

const message = useMessage()
const activeTab = ref('uuid')

// UUID 相关
const uuidResult = ref('')
const uuidCount = ref(1)
const uuidVersion = ref(4)
const uuidOptions = ref({
  uppercase: false,
  hyphens: true
})

// 哈希相关
const hashInput = ref('')
const hashType = ref('MD5')
const hashResult = ref('')

// 二维码相关
const qrInput = ref('')
const qrResult = ref('')
const qrOptions = ref({
  width: 256,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
})
// 选项Options
const fieldOptions = {
  methods: [
    {label: 'MD5', value: 'MD5'},
    {label: 'SHA-1', value: 'SHA-1'},
    {label: 'SHA-256', value: 'SHA-256'},
    {label: 'SHA-384', value: 'SHA-384'},
    {label: 'SHA-512', value: 'SHA-512'}
  ]
};

// 添加二维码识别相关
const qrFileInput = ref<HTMLInputElement | null>(null)
const qrDecodeResult = ref('')

// 拖放状态
const isDragging = ref(false)

// 哈希校验相关
const hashVerifyFile = ref<File | null>(null)
const hashVerifyInput = ref('')
const hashVerifyResult = ref('')
const hashVerifyStatus = ref<'success' | 'error' | ''>('')
const hashFileInput = ref<HTMLInputElement | null>(null)
const isHashDragging = ref(false)

// 二维码预览相关
const qrPreviewUrl = ref('')

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
}

// 计算哈希
async function calculateHash() {
  if (!hashInput.value) {
    message.warning('请输入需要计算哈希的内容')
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
  } catch (error) {
    message.error('哈希计算失败')
    console.error(error)
  }
}

// 生成二维码
async function generateQRCode() {
  if (!qrInput.value) {
    message.warning('请输入需要生成二维码的内容')
    return
  }

  try {
    qrResult.value = await QRCode.toDataURL(qrInput.value, {
      width: qrOptions.value.width,
      margin: qrOptions.value.margin,
      color: qrOptions.value.color
    })
  } catch (error) {
    message.error('二维码生成失败')
  }
}

// 复制结果
function copyResult(text: string) {
  if (!text) {
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(text)
      .then(() => message.success('已复制到剪贴板'))
      .catch(() => message.error('复制失败'))
}

// 下载二维码
function downloadQRCode() {
  if (!qrResult.value) {
    message.warning('请先生成二维码')
    return
  }

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrResult.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 处理拖放事件
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

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processQRImage(file)
  } else {
    message.error('请选择图片文件')
  }
}

// 统一处理二维码图片
function processQRImage(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      // 设置预览图
      qrPreviewUrl.value = e.target?.result as string

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        message.error('无法创建画布上下文')
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        qrDecodeResult.value = code.data
        message.success('二维码识别成功')
      } else {
        message.error('未能识别二维码')
      }
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
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
      message[hashVerifyStatus.value](`文件哈希值${status}`)
    }
  } catch (error) {
    message.error('哈希计算失败')
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
</script>

<template>
  <div class="generate-tool">
    <div class="tool-container">
      <NTabs v-model:value="activeTab" type="segment" class="tab-header">
        <NTabPane name="uuid" tab="UUID生成">
          <div class="tab-content">
            <div class="options-group">
              <div class="options-group-item" style="width: 20%;">
                <glass-morphism-select
                    v-model="uuidVersion"
                    width="100px"
                    :options="[
                    { label: 'UUID v4', value: 4 }
                  ]"
                />
              </div>
              <div class="switches">
                <glass-morphism-button
                    :type="uuidOptions.uppercase ? 'primary' : 'default'"
                    @click="uuidOptions.uppercase = !uuidOptions.uppercase"
                >
                  大写
                </glass-morphism-button>
                <glass-morphism-button
                    :type="uuidOptions.hyphens ? 'primary' : 'default'"
                    @click="uuidOptions.hyphens = !uuidOptions.hyphens"
                >
                  连字符
                </glass-morphism-button>
              </div>
            </div>

            <div class="input-group">
              <glass-morphism-input
                  v-model="uuidCount"
                  placeholder="请输入用户名..."
                  type="number"
                  :blur="5"
                  :opacity="0.2"
                  suffixButton
                  buttonText="生成"
                  buttonType="primary"
                  @button-click="generateUUID"
              />
            </div>

            <div class="result-group">
              <glass-morphism-input
                  v-model="uuidResult"
                  placeholder="生成的UUID将显示在这里"
                  :blur="5"
                  :opacity="0.2"
                  textarea
                  showCount
                  rows="10"
              />
              <NButton @click="copyResult(uuidResult)" :disabled="!uuidResult">
                复制结果
              </NButton>

            </div>
          </div>
        </NTabPane>

        <NTabPane name="hash" tab="哈希计算">
          <div class="tab-content">
            <div class="input-group">
              <glass-morphism-select
                  v-model="hashType"
                  :options="fieldOptions.methods"
              />
            </div>

            <div class="input-group">

              <glass-morphism-input
                  v-model="hashInput"
                  placeholder="输入需要计算哈希的内容"
                  :blur="5"
                  :opacity="0.2"
                  textarea
                  showCount
                  rows="10"
                  maxlength="10000"
              />
              <NButton @click="calculateHash">计算</NButton>
            </div>

            <div class="result-group">
              <glass-morphism-input
                  v-model="hashResult"
                  placeholder="哈希结果将显示在这里"
                  :blur="5"
                  :opacity="0.2"
                  textarea
                  readonly
                  showCount
                  rows="10"
              />
              <NButton @click="copyResult(hashResult)" :disabled="!hashResult">
                复制结果
              </NButton>
            </div>

            <div class="section-title">哈希校验</div>
            <div class="verify-section">
              <div class="verify-header">
                <glass-morphism-input
                    v-model="hashVerifyInput"
                    v-model:selectValue="hashType"
                    :options="fieldOptions.methods"
                    use-select-prefix
                    suffixWidth="70px"
                    placeholder="输入哈希值进行校验（可选）"
                    :blur="5"
                    :opacity="0.2"
                />
              </div>

              <div
                  class="upload-area"
                  :class="{
                    'is-dragover': isHashDragging,
                    'is-success': hashVerifyStatus === 'success',
                    'is-error': hashVerifyStatus === 'error'
                  }"
                  @click="triggerHashFileInput"
                  @dragover="handleHashDragOver"
                  @dragleave="handleHashDragLeave"
                  @drop="handleHashDrop"
              >
                <input
                    ref="hashFileInput"
                    type="file"
                    class="file-input"
                    @change="e => handleHashFileUpload((e.target as HTMLInputElement).files![0])"
                />
                <div class="upload-text">
                  <template v-if="hashVerifyFile">
                    <div class="file-info">
                      <span class="file-name">{{ hashVerifyFile.name }}</span>
                      <span class="file-size">{{ formatFileSize(hashVerifyFile.size) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    点击或拖拽文件到此处计算哈希值
                  </template>
                </div>
              </div>

              <div v-if="hashVerifyResult" class="verify-result">
                <glass-morphism-input
                    v-model="hashVerifyResult"
                    placeholder="请输入内容..."
                    :blur="5"
                    :opacity="0.2"
                    readonly
                    suffixButton
                    buttonText="复制"
                    @button-click="copyResult(hashVerifyResult)"
                    width="100%"
                    border-color="rgba(255, 255, 255, 0.3)"
                />
                <div v-if="hashVerifyStatus" class="status-text" :class="hashVerifyStatus">
                  {{ hashVerifyStatus === 'success' ? '哈希值匹配' : '哈希值不匹配' }}
                </div>
              </div>
            </div>
          </div>
        </NTabPane>

        <NTabPane name="qrcode" tab="二维码工具">
          <div class="tab-content">
            <!-- 生成部分 -->
            <div class="section-title">生成二维码</div>
            <div class="input-group">

              <glass-morphism-input
                  v-model="qrInput"
                  placeholder="输入需要生成二维码的内容"
                  :blur="5"
                  :opacity="0.2"
                  textarea
                  showCount
                  rows="10"
                  maxlength="10000"
              />
              <NButton @click="generateQRCode">生成</NButton>
            </div>

            <div class="qr-options">
              <div class="option-item">
                <span>尺寸:</span>
                <glass-morphism-input
                    v-model="qrOptions.width"
                    type="number"
                />
              </div>
              <div class="option-item">
                <span>边距:</span>
                <glass-morphism-input
                    v-model="qrOptions.margin"
                    type="number"
                />
              </div>
            </div>

            <div class="qr-preview" v-if="qrResult">
              <img :src="qrResult" alt="QR Code">
              <div class="preview-actions">
                <NButton @click="downloadQRCode">下载</NButton>
                <NButton @click="copyResult(qrResult)">复制图片链接</NButton>
              </div>
            </div>

            <!-- 识别部分 -->
            <div class="section-title">识别二维码</div>
            <div class="decode-section">
              <input
                  ref="qrFileInput"
                  type="file"
                  accept="image/*"
                  class="file-input"
              />
              <div
                  class="upload-area"
                  :class="{ 'is-dragover': isDragging }"
                  @dragover="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop"
              >
                <div class="upload-text">
                  点击或拖拽图片到此处
                </div>
              </div>
              <div v-if="qrPreviewUrl" class="qr-preview">
                <img :src="qrPreviewUrl" alt="QR Code Preview">
              </div>
              <div v-if="qrDecodeResult" class="decode-result">
                <div class="result-label">识别结果：</div>
                <NInput
                    v-model:value="qrDecodeResult"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 6 }"
                    readonly
                />
                <NButton @click="copyResult(qrDecodeResult)">
                  复制结果
                </NButton>
              </div>
            </div>
          </div>
        </NTabPane>
      </NTabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generate-tool {
  padding: 20px;

  .tool-container {
    max-width: 800px;
    margin: 0 auto;
    background: var(--n-card-color);
    border-radius: 12px;
    border: 1px solid var(--n-border-color);
    box-shadow: var(--n-box-shadow);
    overflow: hidden;

    .tab-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .options-group {
      display: flex;
      gap: 16px;
      align-items: center;

      .version-select {
        width: 120px;
      }

      .switches {
        display: flex;
        gap: 8px;
      }
    }

    .input-group {
      display: flex;
      gap: 12px;
      align-items: flex-start;

      :deep(.n-input) {
        flex: 1;
      }
    }

    .result-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .qr-options {
      display: flex;
      gap: 20px;
      padding: 16px;
      background: var(--n-color);
      border-radius: 8px;
      border: 1px solid var(--n-border-color);

      .option-item {
        display: flex;
        align-items: center;
        gap: 8px;

        span {
          color: var(--n-text-color-2);
          font-size: 14px;
        }

        :deep(.n-input) {
          width: 100px;
        }
      }
    }

    .qr-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--n-color);
      border-radius: 8px;
      border: 1px solid var(--n-border-color);

      img {
        max-width: 100%;
        border-radius: 4px;
      }

      .preview-actions {
        display: flex;
        gap: 12px;
      }
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--n-text-color);
      margin: 24px 0 16px;

      &:first-child {
        margin-top: 0;
      }
    }

    .verify-section {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .verify-header {
        display: flex;
        gap: 12px;
        align-items: center;

        .algorithm-select {
          width: 120px;
        }

        :deep(.n-input) {
          flex: 1;
        }
      }

      .upload-area {
        position: relative;
        border: 2px dashed var(--n-border-color);
        border-radius: 8px;
        padding: 32px;
        text-align: center;
        background: var(--n-color);
        cursor: pointer;
        transition: all 0.3s var(--n-bezier);

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 1;
        }

        &:hover,
        &.is-dragover {
          border-color: var(--n-primary-color);
          background: var(--n-hover-color);
        }

        &.is-success {
          border-color: var(--n-success-color);
          background: var(--n-success-color-hover);
        }

        &.is-error {
          border-color: var(--n-error-color);
          background: var(--n-error-color-hover);
        }

        .upload-text {
          color: var(--n-text-color-3);

          .file-info {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .file-name {
              color: var(--n-text-color);
              font-weight: 500;
            }

            .file-size {
              font-size: 12px;
            }
          }
        }
      }

      .verify-result {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: var(--n-color);
        border-radius: 8px;
        border: 1px solid var(--n-border-color);

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .result-label {
            font-size: 14px;
            color: var(--n-text-color-2);
          }
        }

        .status-text {
          font-size: 14px;
          font-weight: 500;

          &.success {
            color: var(--n-success-color);
          }

          &.error {
            color: var(--n-error-color);
          }
        }
      }
    }

    .decode-section {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .file-input {
        display: none;
      }

      .upload-area {
        border: 2px dashed var(--n-border-color);
        border-radius: 8px;
        padding: 32px;
        text-align: center;
        background: var(--n-color);
        cursor: pointer;
        transition: all 0.3s var(--n-bezier);

        &:hover,
        &.is-dragover {
          border-color: var(--n-primary-color);
          background: var(--n-hover-color);
        }

        .upload-text {
          color: var(--n-text-color-3);
        }
      }

      .qr-preview {
        text-align: center;
        margin: 16px 0;
        padding: 16px;
        background: var(--n-color);
        border-radius: 8px;
        border: 1px solid var(--n-border-color);

        img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 4px;
        }
      }

      .decode-result {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: var(--n-color);
        border-radius: 8px;
        border: 1px solid var(--n-border-color);

        .result-label {
          font-size: 14px;
          color: var(--n-text-color-2);
        }
      }
    }
  }
}
</style>
