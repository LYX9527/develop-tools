<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useMessage} from 'naive-ui'
import JSZip from 'jszip'
import {saveAs} from 'file-saver'
import UploadZone from '@/components/UploadZone.vue'

const message = useMessage()

// 状态变量
const originalImageDataURL = ref('')
const previewCanvases = new Map()
const selectedSizes = new Map()
const isLoading = ref(false)
const showPreview = ref(false)

// 配置项
const sizes = [16, 32, 48, 128, 256]
const scaleFactors = [1, 2]
const cornerRadius = ref('20%')
const borderWidth = ref('15%')

// 添加防抖函数
function debounce(func: Function, wait: number) {
  let timeout: number
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}

// 处理输入变化
const handleInputChange = debounce(async () => {
  if (originalImageDataURL.value) {
    isLoading.value = true
    showPreview.value = false

    try {
      // 获取当前输入值
      const cornerRadiusInput = document.getElementById('cornerRadius') as HTMLInputElement
      const borderWidthInput = document.getElementById('borderWidth') as HTMLInputElement

      // 更新 ref 值
      cornerRadius.value = cornerRadiusInput.value
      borderWidth.value = borderWidthInput.value

      const response = await fetch(originalImageDataURL.value)
      const blob = await response.blob()
      await processImage(blob)
      showPreview.value = true
    } catch (error) {
      console.error('Error updating previews:', error)
      message.error('更新预览时出错')
    } finally {
      isLoading.value = false
    }
  }
}, 300)

// 设置滚轮控制
function setupWheelControl(inputId: string, defaultUnit = '%') {
  const input = document.getElementById(inputId)
  if (!input) return

  input.addEventListener('wheel', (e) => {
    e.preventDefault()

    const currentValue = (input as HTMLInputElement).value || `0${defaultUnit}`
    let numValue: number
    let unit: string

    if (currentValue.endsWith('px')) {
      numValue = parseFloat(currentValue)
      unit = 'px'
    } else if (currentValue.endsWith('%')) {
      numValue = parseFloat(currentValue)
      unit = '%'
    } else {
      numValue = parseFloat(currentValue)
      unit = defaultUnit
    }

    const step = unit === 'px' ? 2 : 2
    numValue += e.deltaY < 0 ? step : -step

    if (unit === '%') {
      numValue = Math.min(Math.max(numValue, 0), 50)
    } else {
      numValue = Math.min(Math.max(numValue, 0), 100)
    }

    const round = Math.round(numValue) + "";
    const newValue = `${round}${unit}`;
        // 更新输入框值和 ref 值
        (input as HTMLInputElement).value = newValue
    if (inputId === 'cornerRadius') {
      cornerRadius.value = newValue
    } else if (inputId === 'borderWidth') {
      borderWidth.value = newValue
    }

    handleInputChange()
  })

  // 添加键盘控制
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()

      const currentValue = (input as HTMLInputElement).value || `0${defaultUnit}`
      let numValue: number
      let unit: string

      if (currentValue.endsWith('px')) {
        numValue = parseFloat(currentValue)
        unit = 'px'
      } else if (currentValue.endsWith('%')) {
        numValue = parseFloat(currentValue)
        unit = '%'
      } else {
        numValue = parseFloat(currentValue)
        unit = defaultUnit
      }

      const step = unit === 'px' ? 1 : 1
      numValue += e.key === 'ArrowUp' ? step : -step

      if (unit === '%') {
        numValue = Math.min(Math.max(numValue, 0), 50)
      } else {
        numValue = Math.min(Math.max(numValue, 0), 100)
      }

      const round = Math.round(numValue) + "";
      const newValue = `${round}${unit}`;
      // 更新输入框值和 ref 值
      (input as HTMLInputElement).value = newValue
      if (inputId === 'cornerRadius') {
        cornerRadius.value = newValue
      } else if (inputId === 'borderWidth') {
        borderWidth.value = newValue
      }

      handleInputChange()
    }
  })

  // 处理失去焦点
  input.addEventListener('blur', () => {
    let value = (input as HTMLInputElement).value.trim()

    if (!isNaN(Number(value))) {
      value = `${value}${defaultUnit}`
    }

    if (!/^\d+(%|px)$/.test(value)) {
      value = `20${defaultUnit}`
    }

    // 更新输入框值和 ref 值
    (input as HTMLInputElement).value = value
    if (inputId === 'cornerRadius') {
      cornerRadius.value = value
    } else if (inputId === 'borderWidth') {
      borderWidth.value = value
    }

    handleInputChange()
  })
}

// 文件上传处理
async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  isLoading.value = true
  showPreview.value = false

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      originalImageDataURL.value = e.target?.result as string
      await processImage(file)
      showPreview.value = true
    }
    reader.readAsDataURL(file)
  } catch (error) {
    message.error('处理图片时出错')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 处理图片
async function processImage(file: File) {
  const previewGrid = document.getElementById('previewGrid')
  if (!previewGrid) return

  previewGrid.innerHTML = ''
  previewCanvases.clear()

  for (const size of sizes) {
    for (const scale of scaleFactors) {
      const dimension = size * scale
      const previewItem = createPreviewItem(size, scale)
      previewGrid.appendChild(previewItem)

      const sizeKey = createSizeKey(size, scale)
      const checkbox = previewItem.querySelector('input[type="checkbox"]')
      if (checkbox) {
        checkbox.checked = selectedSizes.has(sizeKey)
      }

      try {
        await generatePreview(dimension, size, scale, previewItem)
      } catch (error) {
        throw error
      }
    }
  }
}

// 生成预览图
async function generatePreview(dimension: number, size: number, scale: number, previewItem: HTMLElement) {
  const canvas = previewItem.querySelector('canvas') as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  canvas.width = dimension
  canvas.height = dimension
  canvas.style.width = '100%'
  canvas.style.height = 'auto'

  const img = new Image()
  img.src = originalImageDataURL.value

  await new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        drawRoundedIcon(ctx, img, dimension)
        previewCanvases.set(`${size}_${scale}`, canvas)
        resolve(null)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
  })
}

// 绘制圆角图标
function drawRoundedIcon(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dimension: number) {
  let radius: number
  let borderWidthValue: number

  try {
    // 使用 ref 值
    if (cornerRadius.value.endsWith('%')) {
      const percentage = parseFloat(cornerRadius.value) / 100
      radius = dimension * percentage
    } else if (cornerRadius.value.endsWith('px')) {
      radius = parseFloat(cornerRadius.value)
    } else {
      radius = dimension * 0.2 // 默认值
    }

    // 使用 ref 值
    if (borderWidth.value.endsWith('%')) {
      const percentage = parseFloat(borderWidth.value) / 100
      borderWidthValue = dimension * percentage
    } else if (borderWidth.value.endsWith('px')) {
      borderWidthValue = parseFloat(borderWidth.value)
    } else {
      borderWidthValue = dimension * 0.15 // 默认值
    }

    borderWidthValue = Math.min(borderWidthValue, dimension * 0.4)
    radius = Math.min(radius, (dimension - 2 * borderWidthValue) / 2)

    ctx.clearRect(0, 0, dimension, dimension)

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = dimension
    tempCanvas.height = dimension
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCtx.beginPath()
    tempCtx.moveTo(borderWidthValue + radius, borderWidthValue)
    tempCtx.lineTo(dimension - borderWidthValue - radius, borderWidthValue)
    tempCtx.quadraticCurveTo(dimension - borderWidthValue, borderWidthValue, dimension - borderWidthValue, borderWidthValue + radius)
    tempCtx.lineTo(dimension - borderWidthValue, dimension - borderWidthValue - radius)
    tempCtx.quadraticCurveTo(dimension - borderWidthValue, dimension - borderWidthValue, dimension - borderWidthValue - radius, dimension - borderWidthValue)
    tempCtx.lineTo(borderWidthValue + radius, dimension - borderWidthValue)
    tempCtx.quadraticCurveTo(borderWidthValue, dimension - borderWidthValue, borderWidthValue, dimension - borderWidthValue - radius)
    tempCtx.lineTo(borderWidthValue, borderWidthValue + radius)
    tempCtx.quadraticCurveTo(borderWidthValue, borderWidthValue, borderWidthValue + radius, borderWidthValue)
    tempCtx.closePath()

    tempCtx.fillStyle = 'white'
    tempCtx.fill()

    tempCtx.save()
    tempCtx.clip()
    tempCtx.drawImage(img, borderWidthValue, borderWidthValue, dimension - 2 * borderWidthValue, dimension - 2 * borderWidthValue)
    tempCtx.restore()

    ctx.clearRect(0, 0, dimension, dimension)
    ctx.drawImage(tempCanvas, 0, 0)
  } catch (error) {
    console.error('Error in drawRoundedIcon:', error)
  }
}

// 下载图标
async function downloadIcons() {
  isLoading.value = true

  try {
    const zip = new JSZip()

    for (const [_, sizeObj] of selectedSizes) {
      const {size, scale} = sizeObj
      const canvas = previewCanvases.get(`${size}_${scale}`)
      if (canvas) {
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve))
        const fileName = `icon_${size}x${size}${scale > 1 ? '@2x' : ''}.png`
        zip.file(fileName, blob)
      }
    }

    const content = await zip.generateAsync({type: 'blob'})
    saveAs(content, 'icons.zip')
    message.success('下载成功')
  } catch (error) {
    message.error('创建压缩包时出错')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 辅助函数
function createSizeKey(size: number, scale: number) {
  return `${size}_${scale}`
}

function updateDownloadButton() {
  const selectedCount = selectedSizes.size
  const downloadBtn = document.getElementById('downloadBtn')
  if (!downloadBtn) return

  downloadBtn.disabled = selectedCount === 0
  downloadBtn.innerHTML = selectedCount === 0
      ? '请选择要下载的尺寸'
      : `下载选中的图标 (已选择 ${selectedCount} 个)`
}

// 创建预览项
function createPreviewItem(size: number, scale: number) {
  const previewItem = document.createElement('div')
  previewItem.className = 'preview-item'

  const sizeKey = createSizeKey(size, scale)
  const isChecked = selectedSizes.has(sizeKey)

  // 使用模板字符串创建完整的 HTML 结构
  previewItem.innerHTML = `
    <div class="size-checkbox">
      <input type="checkbox" id="size_${size}_${scale}" ${isChecked ? 'checked' : ''}>
    </div>
    <div class="preview-content">
      <div class="canvas-wrapper">
        <canvas class="preview-canvas" id="preview_${size}_${scale}"></canvas>
      </div>
      <h3>${size}x${size}${scale > 1 ? '@2x' : ''}</h3>
    </div>
  `

  // 添加复选框事件监听
  const checkboxInput = previewItem.querySelector('input')
  if (checkboxInput) {
    checkboxInput.addEventListener('change', function() {
      const sizeKey = createSizeKey(size, scale)
      if (this.checked) {
        selectedSizes.set(sizeKey, { size, scale })
      } else {
        selectedSizes.delete(sizeKey)
      }
      updateDownloadButton()
    })
  }

  return previewItem
}

// 处理文件上传
function onFileSelected(file: File) {
  handleFileUpload({ target: { files: [file] } } as any)
}

function onUploadError(message: string) {
  message.error(message)
}

// 初始化
onMounted(() => {
  // 初始化尺寸选择
  sizes.forEach(size => {
    scaleFactors.forEach(scale => {
      selectedSizes.set(createSizeKey(size, scale), {size, scale})
    })
  })

  // 设置滚轮控制
  setupWheelControl('cornerRadius')
  setupWheelControl('borderWidth')
})
</script>

<template>
  <div class="container">
    <!-- 替换上传区域 -->
    <UploadZone
      accept="image/*"
      :max-size="5"
      hint="支持 PNG、JPG、SVG 等图片格式，文件大小不超过 5MB"
      @file="onFileSelected"
      @error="onUploadError"
    />

    <!-- 设置区域 -->
    <div class="settings-section">
      <div class="settings-wrapper">
        <div class="setting-item">
          <label for="cornerRadius">圆角设置:</label>
          <div class="input-group">
            <input
                type="text"
                id="cornerRadius"
                v-model="cornerRadius"
                placeholder="例如: 20% 或 10px"
            >
            <span class="hint">支持百分比或像素值</span>
          </div>
        </div>

        <div class="setting-item">
          <label for="borderWidth">边缘透明范围:</label>
          <div class="input-group">
            <input
                type="text"
                id="borderWidth"
                v-model="borderWidth"
                placeholder="例如: 15% 或 8px"
            >
            <span class="hint">支持百分比或像素值</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div v-show="showPreview" class="preview-section">
      <div id="previewGrid" class="preview-grid"></div>
      <n-button
          id="downloadBtn"
          class="download-button"
          @click="downloadIcons"
          :disabled="selectedSizes.size === 0"
      >
        {{ selectedSizes.size === 0 ? '请选择要下载的尺寸' : `下载选中的图标 (已选择 ${selectedSizes.size} 个)` }}
      </n-button>
    </div>

    <!-- 加载提示 -->
    <div v-show="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>正在处理...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--n-color);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px var(--n-box-shadow);
  color: var(--n-text-color);

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--n-text-color);
  }
}

.settings-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--n-color-modal);
  border-radius: 8px;

  .settings-wrapper {
    display: flex;
    gap: 30px;
    justify-content: center;
    align-items: flex-start;
  }

  .setting-item {
    flex: 1;
    max-width: 400px;
    position: relative;

    label {
      display: block;
      margin-bottom: 10px;
      font-weight: 500;
      color: var(--n-text-color);
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    input {
      padding: 8px 12px;
      border: 1px solid var(--n-border-color);
      border-radius: 4px;
      font-size: var(--n-font-size);
      width: 120px;
      cursor: ns-resize;
      background: var(--n-color);
      color: var(--n-text-color);
      transition: all 0.3s var(--n-bezier);

      &:hover {
        border-color: var(--n-primary-color);
      }

      &:focus {
        outline: none;
        border-color: var(--n-primary-color);
        box-shadow: 0 0 0 2px var(--n-primary-color-hover);
      }
    }

    .hint {
      font-size: var(--n-font-size-small);
      color: var(--n-text-color-3);
      white-space: nowrap;
    }

    &::after {
      content: "使用鼠标滚轮或方向键调整";
      position: absolute;
      bottom: -20px;
      left: 0;
      font-size: var(--n-font-size-small);
      color: var(--n-text-color-3);
      opacity: 0;
      transition: opacity 0.3s var(--n-bezier);
    }

    &:hover::after {
      opacity: 1;
    }
  }
}

.preview-section {
  margin-top: 30px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

:deep(.preview-item) {
  background: var(--n-color);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--n-box-shadow);
  text-align: center;
  position: relative;
  border: 1px solid var(--n-border-color);

  h3 {
    margin: 0;
    font-size: var(--n-font-size-small);
    color: var(--n-text-color-2);
  }
}

:deep(.preview-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

:deep(.canvas-wrapper) {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color-modal);
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  overflow: hidden;
}

:deep(.preview-canvas) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

:deep(.size-checkbox) {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
}

.download-button {
  width: 100%;
  padding: 15px;
  background: var(--t-color-success);
  color: var(--color);
  border: none;
  border-radius: 6px;
  font-size: var(--n-font-size);
  cursor: pointer;
  transition: all 0.3s var(--n-bezier);
  margin-top: 20px;

  &:disabled {
    background: var(--n-color-disabled);
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:not(:disabled):hover {
    background: var(--t-color-success-hover);
  }
}

.loading {
  text-align: center;
  margin: 20px 0;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--n-color-disabled);
    border-top: 4px solid var(--n-primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  p {
    margin-top: 10px;
    color: var(--n-text-color-2);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .settings-section {
    padding: 15px;
  }

  .settings-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .setting-item {
    max-width: none;

    .input-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    input {
      width: 100%;
    }

    .hint {
      margin-left: 0;
    }
  }
}

@media (max-width: 480px) {
  body {
    padding: 10px;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }
}
</style>
