<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Upload from '@/components/ui/Upload.vue'
import {useToast} from '@/composables/useToast'
import JSZip from 'jszip'
import {saveAs} from 'file-saver'

const toast = useToast()

// 状态变量
const originalImageDataURL = ref('')
const previewCanvases = new Map()
const selectedSizes = ref(new Map())
const isLoading = ref(false)
const showPreview = ref(false)
const currentFile = ref<File | null>(null)

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
  if (!originalImageDataURL.value || !currentFile.value) {
    return
  }

  isLoading.value = true
  showPreview.value = false

  try {
    await processImage(currentFile.value)
    showPreview.value = true
  } catch (error) {
    console.error('Error updating previews:', error)
    toast.error('更新预览时出错')
  } finally {
    isLoading.value = false
  }
}, 300)

// 处理圆角输入变化
function handleCornerRadiusChange(value: string) {
  if (!value.endsWith('%') && !value.endsWith('px')) {
    cornerRadius.value = `${value}%`
  } else {
    cornerRadius.value = value
  }
  handleInputChange()
}

// 处理边缘宽度输入变化
function handleBorderWidthChange(value: string) {
  if (!value.endsWith('%') && !value.endsWith('px')) {
    borderWidth.value = `${value}%`
  } else {
    borderWidth.value = value
  }
  handleInputChange()
}

// 文件上传处理
async function handleFileUpload(files: File[]) {
  const file = files[0]
  if (!file) return

  // 防止重复处理同一个文件
  if (currentFile.value === file) return

  currentFile.value = file
  isLoading.value = true
  showPreview.value = false

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        originalImageDataURL.value = e.target?.result as string
        await processImage(file)
        showPreview.value = true
      } catch (error) {
        console.error('处理图片时出错:', error)
        toast.error('处理图片时出错')
      } finally {
        isLoading.value = false
      }
    }
    reader.onerror = () => {
      toast.error('读取文件失败')
      isLoading.value = false
    }
    reader.readAsDataURL(file)
  } catch (error) {
    toast.error('处理图片时出错')
    console.error(error)
    isLoading.value = false
  }
}

// 处理图片
async function processImage(file: File) {
  const previewGrid = document.getElementById('previewGrid')
  if (!previewGrid) {
    console.warn('previewGrid element not found')
    return
  }

  // 清理现有内容
  previewGrid.innerHTML = ''
  previewCanvases.clear()

  // 生成所有尺寸的预览
  for (const size of sizes) {
    for (const scale of scaleFactors) {
      const dimension = size * scale
      const previewItem = createPreviewItem(size, scale)
      previewGrid.appendChild(previewItem)

      try {
        await generatePreview(dimension, size, scale, previewItem)
      } catch (error) {
        console.error(`Error generating preview for ${size}x${size}@${scale}x:`, error)
        // 继续处理其他尺寸，不要中断整个流程
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
    // 计算圆角半径
    if (cornerRadius.value.endsWith('%')) {
      const percentage = parseFloat(cornerRadius.value) / 100
      radius = dimension * percentage
    } else if (cornerRadius.value.endsWith('px')) {
      radius = parseFloat(cornerRadius.value)
    } else {
      radius = dimension * 0.2 // 默认值
    }

    // 计算边缘宽度
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
    let hasSelectedIcons = false

    for (const [sizeKey, sizeObj] of selectedSizes.value) {
      const {size, scale} = sizeObj
      const canvas = previewCanvases.get(`${size}_${scale}`)
      if (canvas) {
        hasSelectedIcons = true
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve))
        const fileName = `icon_${size}x${size}${scale > 1 ? '@2x' : ''}.png`
        zip.file(fileName, blob)
      }
    }

    if (!hasSelectedIcons) {
      toast.warning('请至少选择一个尺寸')
      return
    }

    const content = await zip.generateAsync({type: 'blob'})
    saveAs(content, 'icons.zip')
    toast.success('下载成功')
  } catch (error) {
    toast.error('创建压缩包时出错')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// 辅助函数
function createSizeKey(size: number, scale: number) {
  return `${size}_${scale}`
}

// 创建预览项
function createPreviewItem(size: number, scale: number) {
  const previewItem = document.createElement('div')
  previewItem.className = 'preview-item bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700'

  const sizeKey = createSizeKey(size, scale)
  const isChecked = selectedSizes.value.has(sizeKey)

  // 使用模板字符串创建完整的 HTML 结构
  previewItem.innerHTML = `
    <div class="size-checkbox absolute top-3 right-3">
      <input type="checkbox" id="size_${size}_${scale}" ${isChecked ? 'checked' : ''}
             class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
    </div>
    <div class="preview-content flex flex-col items-center space-y-3">
      <div class="canvas-wrapper w-full aspect-square flex items-center justify-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <canvas class="preview-canvas max-w-full max-h-full" id="preview_${size}_${scale}"></canvas>
      </div>
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">${size}x${size}${scale > 1 ? '@2x' : ''}</h3>
    </div>
  `

  // 添加复选框事件监听
  const checkboxInput = previewItem.querySelector('input')
  if (checkboxInput) {
    checkboxInput.addEventListener('change', function () {
      const sizeKey = createSizeKey(size, scale)
      if (this.checked) {
        selectedSizes.value.set(sizeKey, {size, scale})
      } else {
        selectedSizes.value.delete(sizeKey)
      }
    })
  }

  return previewItem
}

// 处理上传错误
function handleUploadError(message: string) {
  toast.error(message)
}

// 初始化
onMounted(() => {
  // 初始化尺寸选择（避免响应式更新）
  const initialSizes = new Map()
  sizes.forEach(size => {
    scaleFactors.forEach(scale => {
      initialSizes.set(createSizeKey(size, scale), {size, scale})
    })
  })
  selectedSizes.value = initialSizes

  // 动画
  gsap.fromTo('.tool-container',
      {opacity: 0, y: 30},
      {opacity: 1, y: 0, duration: 0.8, ease: "power3.out"}
  )
})

// 清理函数
onUnmounted(() => {
  // 清理对象URL，避免内存泄漏
  if (originalImageDataURL.value && originalImageDataURL.value.startsWith('data:')) {
    // 对于data URL不需要清理，但清除引用
    originalImageDataURL.value = ''
  }
  currentFile.value = null
  previewCanvases.clear()
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
          图标生成器
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          支持生成各种尺寸的圆角图标，一键导出多个规格
        </p>
      </div>

      <!-- 上传区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择图片</h3>
        <Upload
            :max-size="50 * 1024 * 1024"
            accept="image/png, image/jpeg, image/svg+xml"
            label="上传图片文件"
            @error="handleUploadError"
            @update:modelValue="handleFileUpload"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          支持 PNG、JPG、SVG 等图片格式，文件大小不超过 5MB
        </p>
      </div>

      <!-- 设置区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">图标设置</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              圆角设置
            </label>
            <Input
                :model-value="cornerRadius"
                class="w-full"
                placeholder="例如: 20% 或 10px"
                @update:model-value="handleCornerRadiusChange"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">支持百分比或像素值</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              边缘透明范围
            </label>
            <Input
                :model-value="borderWidth"
                class="w-full"
                placeholder="例如: 15% 或 8px"
                @update:model-value="handleBorderWidthChange"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">支持百分比或像素值</p>
          </div>
        </div>
      </div>

      <!-- 预览区域 -->
      <div v-show="showPreview" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">预览与选择</h3>
          <Button
              :disabled="selectedSizes.size === 0 || isLoading"
              variant="primary"
              @click="downloadIcons"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"></path>
            </svg>
            {{ selectedSizes.size === 0 ? '请选择要下载的尺寸' : `下载选中的图标 (已选择 ${selectedSizes.size} 个)` }}
          </Button>
        </div>
        <div id="previewGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"></div>
      </div>

      <!-- 加载提示 -->
      <div v-show="isLoading" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div class="inline-flex items-center space-x-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="text-gray-600 dark:text-gray-300">正在处理图片...</p>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">支持的图标尺寸</h4>
            <ul class="space-y-1">
              <li>• 16x16 (小图标)</li>
              <li>• 32x32 (工具栏图标)</li>
              <li>• 48x48 (应用图标)</li>
              <li>• 128x128 (大图标)</li>
              <li>• 256x256 (高分辨率图标)</li>
              <li>• 支持@2x高清版本</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用步骤</h4>
            <ul class="space-y-1">
              <li>1. 上传原始图片文件</li>
              <li>2. 调整圆角和边缘设置</li>
              <li>3. 选择需要的图标尺寸</li>
              <li>4. 点击下载获得ZIP压缩包</li>
              <li>5. 圆角支持百分比和像素值</li>
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

.preview-item {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.preview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.canvas-wrapper {
  min-height: 80px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
