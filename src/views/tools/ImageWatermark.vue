<script lang="ts" setup>
import {nextTick, onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import Toggle from '@/components/ui/Toggle.vue'
import Upload from '@/components/ui/Upload.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()
const WaterMarkMagnification = 2

enum FontStyleEnum {
  Italic = "italic",
  Bold = "bold",
  Underline = "underline",
  StrikeThrough = "line-through"
}

type WatermarkConfig = {
  content: string
  fontSize: number
  fontStyle: FontStyleEnum[]
  fontColor: string
  rotation: number
  needTiled: boolean
  tiledMarginX: number
  tiledMarginY: number
  xOffset: number
  yOffset: number
}

const defaultWatermarkConfig: WatermarkConfig = {
  content: "水印内容",
  fontSize: 40,
  fontStyle: [],
  fontColor: "#000000",
  rotation: 30,
  needTiled: true,
  tiledMarginX: 30,
  tiledMarginY: 30,
  xOffset: 0,
  yOffset: 0,
}

const imgFile = ref<File | null>(null)
const currentFile = ref<File | null>(null)
const imgUrl = ref<string | null>(null)
const uploadedFiles = ref<File[]>([])
const nowHasImgDrop = ref(false)

const image = ref<HTMLImageElement | null>(null)
const imageCanvasRef = ref<HTMLCanvasElement | null>(null)
const watermarkCanvasRef = ref<HTMLCanvasElement | null>(null)
const watermarkCanvasContext = ref<CanvasRenderingContext2D | null>(null)
const customWatermarkConfig = reactive<WatermarkConfig>(defaultWatermarkConfig)
const downloadLoading = ref(false)

// 字体样式选项
const fontStyleOptions = [
  {label: '加粗', value: FontStyleEnum.Bold},
  {label: '倾斜', value: FontStyleEnum.Italic},
  {label: '下划线', value: FontStyleEnum.Underline},
  {label: '删除线', value: FontStyleEnum.StrikeThrough}
]

function downloadNewImage() {
  if (!imageCanvasRef.value || !image.value) {
    toast.error('图片处理失败')
    return
  }

  downloadLoading.value = true
  try {
    // 创建高分辨率的下载canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建画布上下文')
    }

    // 使用原始图片尺寸
    const img = image.value
    canvas.width = img.width
    canvas.height = img.height

    // 绘制原始图片
    ctx.drawImage(img, 0, 0)

    // 创建高分辨率水印
    const watermarkCanvas = document.createElement('canvas')
    const watermarkCtx = watermarkCanvas.getContext('2d')
    if (!watermarkCtx) {
      throw new Error('无法创建水印画布上下文')
    }

    // 设置水印canvas为高分辨率
    watermarkCanvas.width = img.width * WaterMarkMagnification
    watermarkCanvas.height = img.height * WaterMarkMagnification

    // 绘制高分辨率水印
    drawWatermark(watermarkCtx, watermarkCanvas.width, watermarkCanvas.height, adjustWatermarkConfig(true))

    // 将高分辨率水印缩放绘制到最终canvas上
    ctx.drawImage(watermarkCanvas, 0, 0, canvas.width, canvas.height)

    const dataURL = canvas.toDataURL("image/png")
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'watermarked-image.png'
    link.click()

    toast.success('图片下载成功')
  } catch (error) {
    toast.error('图片下载失败')
    console.error(error)
  } finally {
    downloadLoading.value = false
  }
}

function clearImage() {
  imgFile.value = null
  currentFile.value = null
  image.value = null
  imgUrl.value = null
  uploadedFiles.value = []
}

function reselectImage() {
  clearImage()
  // 这会触发重新显示上传组件
}

function adjustWatermarkConfig(useHighRes: boolean = false): WatermarkConfig {
  const magnification = useHighRes ? WaterMarkMagnification : 1
  return {
    fontSize: customWatermarkConfig.fontSize * magnification,
    tiledMarginX: customWatermarkConfig.tiledMarginX * magnification,
    tiledMarginY: customWatermarkConfig.tiledMarginY * magnification,
    xOffset: customWatermarkConfig.xOffset * magnification,
    yOffset: customWatermarkConfig.yOffset * magnification,
    content: customWatermarkConfig.content,
    rotation: customWatermarkConfig.rotation,
    fontColor: customWatermarkConfig.fontColor,
    fontStyle: customWatermarkConfig.fontStyle,
    needTiled: customWatermarkConfig.needTiled,
  }
}

// 通用水印绘制函数
function drawWatermark(canvasCtx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, watermarkConfig: WatermarkConfig) {
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight)

  if (watermarkConfig.content === "") {
    return
  }

  const {fontSize, tiledMarginX, tiledMarginY, xOffset, yOffset, content, rotation, fontColor} = watermarkConfig
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  let fontStyle = ""
  if (watermarkConfig.fontStyle.includes(FontStyleEnum.Italic)) {
    fontStyle += `${FontStyleEnum.Italic} `
  }
  if (watermarkConfig.fontStyle.includes(FontStyleEnum.Bold)) {
    fontStyle += `${FontStyleEnum.Bold} `
  }

  canvasCtx.font = `${fontStyle} ${fontSize}px Verdana`
  canvasCtx.textBaseline = 'middle'
  canvasCtx.textAlign = 'center'
  canvasCtx.fillStyle = fontColor
  canvasCtx.save()

  const textWidth = canvasCtx.measureText(content).width

  // 单文字渲染
  if (!watermarkConfig.needTiled) {
    canvasCtx.translate(centerX + xOffset, centerY + yOffset)
    canvasCtx.rotate(rotation * Math.PI / 180)
    canvasCtx.fillText(content, 0, 0)

    if (watermarkConfig.fontStyle.includes(FontStyleEnum.Underline)) {
      drawTextUnderline(canvasCtx, fontSize, fontColor, 0, 0, textWidth)
    }
    if (watermarkConfig.fontStyle.includes(FontStyleEnum.StrikeThrough)) {
      drawTextStrikeThrough(canvasCtx, fontColor, 0, 0, textWidth)
    }

    canvasCtx.restore()
    return
  }

  // 平铺模式
  canvasCtx.translate(centerX, centerY)
  canvasCtx.rotate(rotation * Math.PI / 180)
  canvasCtx.translate(-centerX, -centerY)

  for (let y = -canvasHeight; y <= canvasHeight * 2; y += fontSize + tiledMarginY) {
    for (let x = -canvasWidth; x <= canvasWidth * 2; x += textWidth + tiledMarginX) {
      const textX = x + xOffset
      const textY = y + yOffset
      canvasCtx.fillText(content, textX, textY)

      if (watermarkConfig.fontStyle.includes(FontStyleEnum.Underline)) {
        drawTextUnderline(canvasCtx, fontSize, fontColor, textX, textY, textWidth)
      }
      if (watermarkConfig.fontStyle.includes(FontStyleEnum.StrikeThrough)) {
        drawTextStrikeThrough(canvasCtx, fontColor, textX, textY, textWidth)
      }
    }
  }
  canvasCtx.restore()
}

function updateWatermark() {
  if (!watermarkCanvasContext.value) {
    console.warn('Watermark canvas context not initialized')
    return
  }

  const canvasCtx: CanvasRenderingContext2D = watermarkCanvasContext.value
  const canvasWidth = canvasCtx.canvas.width
  const canvasHeight = canvasCtx.canvas.height

  // 使用预览分辨率的配置绘制水印
  drawWatermark(canvasCtx, canvasWidth, canvasHeight, adjustWatermarkConfig())
}

function drawTextUnderline(canvasCtx: CanvasRenderingContext2D, fontSize: number, fontColor: string, textX: number, textY: number, textWidth: number) {
  canvasCtx.beginPath()
  canvasCtx.moveTo(textX - textWidth / 2, textY + fontSize / 2)
  canvasCtx.lineTo(textX + textWidth / 2, textY + fontSize / 2)
  canvasCtx.strokeStyle = fontColor
  canvasCtx.lineWidth = 8
  canvasCtx.stroke()
}

function drawTextStrikeThrough(canvasCtx: CanvasRenderingContext2D, fontColor: string, textX: number, textY: number, textWidth: number) {
  canvasCtx.beginPath()
  canvasCtx.moveTo(textX - textWidth / 2, textY)
  canvasCtx.lineTo(textX + textWidth / 2, textY)
  canvasCtx.strokeStyle = fontColor
  canvasCtx.lineWidth = 8
  canvasCtx.stroke()
}

function renderImage(fileReader: FileReader) {
  if (!imgFile.value) {
    toast.warning("请先选择图片！")
    return
  }

  // 等待一下确保DOM完全更新
  nextTick(() => {
    if (!imageCanvasRef.value) {
      console.error('imageCanvasRef.value is null', {imageCanvasRef})
      toast.error("画布元素未找到，请刷新页面重试")
      return
    }

    if (!watermarkCanvasRef.value) {
      console.error('watermarkCanvasRef.value is null', {watermarkCanvasRef})
      toast.error("水印画布元素未找到，请刷新页面重试")
      return
    }

    const canvas: HTMLCanvasElement = imageCanvasRef.value
    const canvasContext = canvas.getContext("2d")
    if (!canvasContext) {
      toast.warning("图片渲染画布上下文为空")
      return
    }

    const img = new Image()
    img.src = fileReader.result as string
    img.onload = () => {
      image.value = img

      if (!watermarkCanvasContext.value) {
        toast.error("水印画布上下文未初始化")
        return
      }

      const watermarkCanvasCtx: CanvasRenderingContext2D = watermarkCanvasContext.value

      // 设置两个canvas相同的尺寸，便于预览叠加显示
      const canvasWidth = img.width
      const canvasHeight = img.height

      canvasContext.canvas.width = canvasWidth
      canvasContext.canvas.height = canvasHeight
      watermarkCanvasCtx.canvas.width = canvasWidth
      watermarkCanvasCtx.canvas.height = canvasHeight

      canvasContext.drawImage(img, 0, 0)
      updateWatermark()
    }
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

// 文件上传处理
async function handleFileUpload(files: File[]) {
  const file = files[0]
  if (!file) return

  // 避免重复处理同一个文件
  if (currentFile.value === file) return

  if (!file.type.startsWith("image/")) {
    toast.error("选择的文件不是图片")
    return
  }

  try {
    currentFile.value = file
    imgFile.value = file
  } catch (error) {
    console.error('文件上传处理失败:', error)
    toast.error('文件处理失败')
  }
}

// 处理上传错误
function handleUploadError(message: string) {
  toast.error(message)
}

// 处理字体样式切换
function toggleFontStyle(style: FontStyleEnum) {
  const index = customWatermarkConfig.fontStyle.indexOf(style)
  if (index > -1) {
    customWatermarkConfig.fontStyle.splice(index, 1)
  } else {
    customWatermarkConfig.fontStyle.push(style)
  }
}

// 检查字体样式是否激活
function isFontStyleActive(style: FontStyleEnum) {
  return customWatermarkConfig.fontStyle.includes(style)
}

watch(imgFile, (newFile: File | null) => {
  if (!newFile) return

  toast.success(`图片选择成功: ${newFile.name} (${formatFileSize(newFile.size)})`)

  const reader = new FileReader()
  reader.onload = (e) => {
    imgUrl.value = e.target?.result as string
    // 使用 nextTick 确保 DOM 更新完成后再渲染图片
    nextTick(() => {
      renderImage(e.target!!)
    })
  }
  reader.readAsDataURL(newFile)
})

watch(customWatermarkConfig, () => {
  if (imgUrl.value) {
    updateWatermark()
  }
})

onMounted(() => {
  // 使用 nextTick 确保 DOM 已经完全渲染
  nextTick(() => {
    // 初始化水印canvas上下文
    if (watermarkCanvasRef.value) {
      const context = watermarkCanvasRef.value.getContext("2d")
      if (context) {
        watermarkCanvasContext.value = context
        console.log('Water mark canvas context initialized successfully')
      } else {
        console.error('Failed to get watermark canvas context')
      }
    } else {
      console.error('Watermark canvas ref not found')
    }

    // 检查图片canvas是否也存在
    if (imageCanvasRef.value) {
      console.log('Image canvas ref found and ready')
    } else {
      console.error('Image canvas ref not found')
    }
  })

  // 动画
  gsap.fromTo('.tool-container',
      {opacity: 0, y: 30},
      {opacity: 1, y: 0, duration: 0.8, ease: "power3.out"}
  )
})

onUnmounted(() => {
  // 清理资源，防止内存泄漏
  if (imgUrl.value && imgUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imgUrl.value)
  }

  imgFile.value = null
  currentFile.value = null
  image.value = null
  imgUrl.value = null
  uploadedFiles.value = []
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          图片水印
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          为图片添加自定义水印，支持文字样式和位置调整，提供单文字和平铺模式
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- 左侧 - 图片上传 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择图片</h3>

            <div v-if="!imgUrl">
              <Upload
                  :max-size="50 * 1024 * 1024"
                  accept="image/*"
                  label="上传图片文件"
                  @error="handleUploadError"
                  @update:modelValue="handleFileUpload"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                支持 PNG、JPG、GIF 等图片格式，文件大小不超过 10MB
              </p>
            </div>

            <div v-else class="space-y-4">
              <!-- 图片预览 -->
              <div
                  class="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <img :src="imgUrl" alt="预览图片" class="w-full h-auto max-h-64 object-contain rounded"/>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-2">
                <Button class="flex-1" size="sm" variant="ghost" @click="clearImage">
                  清空
                </Button>
                <Button class="flex-1" size="sm" variant="primary" @click="reselectImage">
                  重选
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间 - 水印配置 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">水印配置</h3>

            <div class="space-y-6">
              <!-- 水印内容 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">水印内容</label>
                <Input
                    v-model="customWatermarkConfig.content"
                    :disabled="!imgUrl"
                    placeholder="输入水印内容"
                />
              </div>

              <!-- 基础样式 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">基础样式</label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">字体大小</label>
                    <NumberInput
                        v-model="customWatermarkConfig.fontSize"
                        :disabled="!imgUrl"
                        :max="200"
                        :min="10"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">字体颜色</label>
                    <input
                        v-model="customWatermarkConfig.fontColor"
                        :disabled="!imgUrl"
                        class="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                        type="color"
                    />
                  </div>
                </div>
              </div>

              <!-- 旋转角度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  旋转角度: {{ customWatermarkConfig.rotation }}°
                </label>
                <input
                    v-model="customWatermarkConfig.rotation"
                    :disabled="!imgUrl"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
                    max="360"
                    min="0"
                    type="range"
                />
              </div>

              <!-- 文字偏移 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文字偏移</label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">X轴偏移</label>
                    <NumberInput
                        v-model="customWatermarkConfig.xOffset"
                        :disabled="!imgUrl"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y轴偏移</label>
                    <NumberInput
                        v-model="customWatermarkConfig.yOffset"
                        :disabled="!imgUrl"
                    />
                  </div>
                </div>
              </div>

              <!-- 文字样式 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文字样式</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                      v-for="option in fontStyleOptions"
                      :key="option.value"
                      :class="isFontStyleActive(option.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'"
                      :disabled="!imgUrl"
                      class="px-3 py-2 text-sm rounded-md border transition-colors disabled:opacity-50"
                      @click="toggleFontStyle(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- 渲染模式 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">渲染模式</label>
                <div class="space-y-3">
                  <Toggle
                      v-model="customWatermarkConfig.needTiled"
                      :disabled="!imgUrl"
                      label="平铺模式"
                  />

                  <div v-if="customWatermarkConfig.needTiled" class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">X轴间距</label>
                      <NumberInput
                          v-model="customWatermarkConfig.tiledMarginX"
                          :disabled="!imgUrl"
                          :min="0"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y轴间距</label>
                      <NumberInput
                          v-model="customWatermarkConfig.tiledMarginY"
                          :disabled="!imgUrl"
                          :min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 下载按钮 -->
              <Button
                  :disabled="!imgUrl || downloadLoading"
                  class="w-full"
                  variant="primary"
                  @click="downloadNewImage"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"></path>
                </svg>
                {{ downloadLoading ? '处理中...' : '下载水印图片' }}
              </Button>
            </div>
          </div>
        </div>

        <!-- 右侧 - 预览结果 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">预览结果</h3>

            <!-- Canvas 预览区域 -->
            <div class="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 min-h-64 flex items-center justify-center">
              <div class="relative">
                <!-- 图片 Canvas -->
                <canvas
                  ref="imageCanvasRef"
                  :class="{ 'opacity-0': !imgUrl }"
                  class="max-w-full max-h-full border border-gray-300 dark:border-gray-600 rounded shadow-sm"
                  style="display: block;"
                ></canvas>

                <!-- 水印 Canvas - 叠加在图片 Canvas 之上 -->
                <canvas
                  ref="watermarkCanvasRef"
                  :class="{ 'opacity-0': !imgUrl }"
                  class="absolute inset-0 max-w-full max-h-full pointer-events-none"
                  style="display: block;"
                ></canvas>
              </div>

              <!-- 无图片时的提示 -->
              <div v-if="!imgUrl"
                   class="absolute inset-0 flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="1"></path>
                </svg>
                <p>请先选择图片</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 - 单独占满底部区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">功能特点</h4>
            <ul class="space-y-1">
              <li>• 支持多种图片格式（PNG、JPG、GIF）</li>
              <li>• 自定义水印文字内容和样式</li>
              <li>• 支持文字旋转和位置调整</li>
              <li>• 提供单文字和平铺两种模式</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用步骤</h4>
            <ul class="space-y-1">
              <li>1. 上传需要添加水印的图片</li>
              <li>2. 设置水印文字内容和样式</li>
              <li>3. 调整水印位置和旋转角度</li>
              <li>4. 选择单文字或平铺模式</li>
              <li>5. 点击下载获得带水印的图片</li>
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

canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
