<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import Toggle from '@/components/ui/Toggle.vue'
import Modal from '@/components/ui/modal/Modal.vue'
import Select from '@/components/ui/Select.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const activeTab = ref(0)

interface ShadowConfig {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
  direction: string
  shape: string
}

const selectedColor = ref('#e0e0e0')
const shadowConfig = reactive<ShadowConfig>({
  x: -20,
  y: 20,
  blur: 60,
  spread: 0,
  color: '#000000',
  opacity: 0.2,
  inset: false,
  direction: 'bottom-right',
  shape: 'straight'
})

const previewStyle = ref({
  width: '100px',
  height: '100px',
  borderRadius: 50,
  backgroundColor: '#E0E0E0',
  margin: '100px auto',
  boxShadow: ''
})

// 阴影方向预设
const directions = [
  { key: 'top-left', icon: '↖' },
  { key: 'top', icon: '↑' },
  { key: 'top-right', icon: '↗' },
  { key: 'left', icon: '←' },
  { key: 'center', icon: '•' },
  { key: 'right', icon: '→' },
  { key: 'bottom-left', icon: '↙' },
  { key: 'bottom', icon: '↓' },
  { key: 'bottom-right', icon: '↘' }
]

// 阴影形状预设
const shapes = [
  { key: 'straight', label: '直线' },
  { key: 'convex', label: '凸形' },
  { key: 'concave', label: '凹形' },
  { key: 'fold', label: '折线' }
]

// 计算当前颜色的不同格式
const colorFormats = reactive({
  hex: selectedColor.value,
  rgb: '',
  rgba: ''
})

// CSS 代码的响应式引用
const cssCode = ref(`border-radius: 50px;
background: #E0E0E0;
box-shadow: -20px 20px 60px 0px rgba(0, 0, 0, 0.2);`)

// === 色系调色板相关 ===
const showGeneratorModal = ref(false)

// 预设的色系方案
const colorSchemes = ref([
  {
    name: '海洋系列',
    colors: ['#001F3F', '#003366', '#004A8F', '#005B99', '#0088CC', '#00AAFF', '#33BBFF', '#66CCFF']
  },
  {
    name: '森林系列',
    colors: ['#0B2A1F', '#1B4D3E', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7']
  },
  {
    name: '日落系列',
    colors: ['#FF4D4D', '#FF6B6B', '#FF8787', '#FFA5A5', '#FFC3C3', '#FFE3E3', '#FFF1F1', '#FFF9F9']
  },
  {
    name: '紫罗兰系列',
    colors: ['#2E1052', '#4C1C8C', '#6833B9', '#845EC2', '#A178DF', '#B298DC', '#C5B3E6', '#D8CEF0']
  },
  {
    name: '柑橘系列',
    colors: ['#CC4A1B', '#FF6B35', '#FF8C42', '#FFA62B', '#FFC14D', '#FFD97D', '#FFE7A8', '#FFF3D4']
  },
  {
    name: '薄荷系列',
    colors: ['#004D40', '#00695C', '#00897B', '#009688', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB']
  },
  {
    name: '樱花系列',
    colors: ['#FFB7C5', '#FFC1CF', '#FFCBD9', '#FFD5E3', '#FFDFED', '#FFE9F7', '#FFF3FB', '#FFFBFF']
  },
  {
    name: '咖啡系列',
    colors: ['#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F', '#BCAAA4']
  },
  {
    name: '极光系列',
    colors: ['#00FF87', '#28FFB3', '#50FFDF', '#78FFFB', '#A0F7FF', '#C8EEFF', '#F0E5FF', '#FFE6F7']
  },
  {
    name: '宝石系列',
    colors: ['#880E4F', '#AD1457', '#D81B60', '#E91E63', '#EC407A', '#F06292', '#F48FB1', '#F8BBD0']
  },
  {
    name: '深邃系列',
    colors: ['#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#B3B3B3']
  },
  {
    name: '草原系列',
    colors: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7']
  }
])

// 自定义色系生成
const baseColor = ref('#000000')
const colorCount = ref(8)
const variationType = ref('tint') // tint, shade, tone

const variationOptions = [
  { label: '变浅', value: 'tint' },
  { label: '变深', value: 'shade' },
  { label: '变灰', value: 'tone' }
]

// 添加一个函数来处理钉住/取消钉住
function togglePin(index: number) {
  const scheme = colorSchemes.value[index]
  if (scheme.name.startsWith('自定义色系 ')) {
    // 已经是钉住状态，取消钉住
    scheme.name = '自定义色系'
  } else if (scheme.name === '自定义色系') {
    // 钉住该色系
    scheme.name = `自定义色系 ${new Date().toLocaleTimeString()}`
  }
}

// 修改生成色系的函数
function generateColorScheme() {
  const hex = baseColor.value.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  const colors = []
  for (let i = 0; i < colorCount.value; i++) {
    let factor = i / (colorCount.value - 1)
    let newR, newG, newB

    switch (variationType.value) {
      case 'tint': // 添加白色
        newR = Math.round(r + (255 - r) * factor)
        newG = Math.round(g + (255 - g) * factor)
        newB = Math.round(b + (255 - b) * factor)
        break
      case 'shade': // 添加黑色
        newR = Math.round(r * (1 - factor))
        newG = Math.round(g * (1 - factor))
        newB = Math.round(b * (1 - factor))
        break
      case 'tone': // 添加灰色
        newR = Math.round(r + (128 - r) * factor)
        newG = Math.round(g + (128 - g) * factor)
        newB = Math.round(b + (128 - b) * factor)
        break
    }

    colors.push(`#${newR?.toString(16).padStart(2, '0')}${newG?.toString(16).padStart(2, '0')}${newB?.toString(16).padStart(2, '0')}`)
  }

  // 查找并替换未钉住的自定义色系
  const customIndex = colorSchemes.value.findIndex(scheme => scheme.name === '自定义色系')
  if (customIndex !== -1) {
    colorSchemes.value[customIndex] = {
      name: '自定义色系',
      colors: colors
    }
  } else {
    // 如果没有找到未钉住的自定义色系，则添加新的
    colorSchemes.value.unshift({
      name: '自定义色系',
      colors: colors
    })
  }

  showGeneratorModal.value = false
  toast.success('色系生成成功')
}

// 复制颜色值
function copyColorFromScheme(color: string) {
  navigator.clipboard.writeText(color)
    .then(() => toast.success('颜色代码已复制'))
    .catch(() => toast.error('复制失败'))
}

// 复制整个色系
function copyColorScheme(colors: string[]) {
  const colorString = colors.join(', ')
  navigator.clipboard.writeText(colorString)
    .then(() => toast.success('色系代码已复制'))
    .catch(() => toast.error('复制失败'))
}

// === 原有功能函数 ===

// 更新阴影效果
function updateShadow() {
  const rgba = hexToRgba(shadowConfig.color, shadowConfig.opacity)
  const inset = shadowConfig.inset ? 'inset ' : ''

  let shadowStyle = `${inset}${shadowConfig.x}px ${shadowConfig.y}px ${shadowConfig.blur}px ${shadowConfig.spread}px ${rgba}`

  if (shadowConfig.shape !== 'straight') {
    const extraShadows = getShapeShadows(shadowConfig.shape, shadowConfig.x, shadowConfig.y, rgba)
    shadowStyle = extraShadows.map(shadow => `${inset}${shadow}`).join(', ')
  }

  // 更新预览效果
  previewStyle.value.boxShadow = shadowStyle
  previewStyle.value.backgroundColor = selectedColor.value

  // 更新 CSS 代码预览
  cssCode.value = `border-radius: ${previewStyle.value.borderRadius}px;
background: ${selectedColor.value};
box-shadow: ${shadowStyle};`
}

// 根据方向获取偏移值
function getDirectionOffset(direction: string): { x: number, y: number } {
  const distance = 20
  const map: Record<string, { x: number, y: number }> = {
    'top-left': { x: -distance, y: -distance },
    'top': { x: 0, y: -distance },
    'top-right': { x: distance, y: -distance },
    'left': { x: -distance, y: 0 },
    'center': { x: 0, y: 0 },
    'right': { x: distance, y: 0 },
    'bottom-left': { x: -distance, y: distance },
    'bottom': { x: 0, y: distance },
    'bottom-right': { x: distance, y: distance }
  }
  return map[direction] || { x: 0, y: 0 }
}

// 根据形状生成额外的阴影
function getShapeShadows(shape: string, x: number, y: number, color: string): string[] {
  const blur = shadowConfig.blur
  const spread = shadowConfig.spread

  switch (shape) {
    case 'convex':
      return [
        `${x}px ${y}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 0.7)}px ${Math.round(y * 0.7)}px ${Math.round(blur * 0.7)}px ${spread}px ${color}`,
        `${Math.round(x * 0.4)}px ${Math.round(y * 0.4)}px ${Math.round(blur * 0.4)}px ${spread}px ${color}`
      ]
    case 'concave':
      return [
        `${x}px ${y}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 1.3)}px ${Math.round(y * 1.3)}px ${Math.round(blur * 1.3)}px ${spread}px ${color}`,
        `${Math.round(x * 1.6)}px ${Math.round(y * 1.6)}px ${Math.round(blur * 1.6)}px ${spread}px ${color}`
      ]
    case 'fold':
      return [
        `${x}px ${y}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 0.5)}px ${Math.round(y * 1.5)}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 1.5)}px ${Math.round(y * 0.5)}px ${blur}px ${spread}px ${color}`
      ]
    default:
      return [`${x}px ${y}px ${blur}px ${spread}px ${color}`]
  }
}

// 复制颜色
function copyColor(format: string) {
  let colorText = ''
  switch (format) {
    case 'hex':
      colorText = selectedColor.value
      break
    case 'rgb':
      colorText = colorFormats.rgb
      break
    case 'rgba':
      colorText = colorFormats.rgba
      break
  }

  navigator.clipboard.writeText(colorText).then(() => {
    toast.success('复制成功')
  }).catch(() => {
    toast.error('复制失败')
  })
}

// 复制阴影样式
function copyShadowStyle() {
  navigator.clipboard.writeText(cssCode.value).then(() => {
    toast.success('阴影样式已复制')
  }).catch(() => {
    toast.error('复制失败')
  })
}

// 辅助函数：HEX转RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// 辅助函数：HEX转RGBA
function hexToRgba(hex: string, opacity: number) {
  const rgb = hexToRgb(hex)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

// 监听颜色变化
function handleColorChange(value: string) {
  selectedColor.value = value
  updateColorFormats()
  updateShadow()
}

// 更新所有颜色格式
function updateColorFormats() {
  const rgb = hexToRgb(selectedColor.value)
  colorFormats.hex = selectedColor.value.toUpperCase()
  colorFormats.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  colorFormats.rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
}

// 监听阴影配置变化
function handleShadowChange() {
  updateShadow()
}

// 修改方向按钮点击处理
function handleDirectionClick(direction: string) {
  shadowConfig.direction = direction
  const { x, y } = getDirectionOffset(direction)
  shadowConfig.x = x
  shadowConfig.y = y
  handleShadowChange()
}

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
  updateColorFormats()
  updateShadow()
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          颜色工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          颜色选择器、阴影生成器，支持多种阴影效果
        </p>
      </div>

      <!-- 标签页内容 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" variant="underline" :animated="true">
            <!-- 颜色选择 -->
            <TabItem label="颜色选择">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 颜色选择区域 -->
                <div class="space-y-6">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择颜色</h3>
                    <div class="flex items-center space-x-4">
                      <!-- 颜色选择器 -->
                      <input
                        type="color"
                        :value="selectedColor"
                        @input="handleColorChange(($event.target as HTMLInputElement).value)"
                        class="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                      />
                      <!-- 颜色预览 -->
                      <div class="flex-1 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-inner"
                           :style="{ backgroundColor: selectedColor }">
                      </div>
                    </div>
                  </div>

                  <!-- 颜色格式 -->
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HEX</label>
                      <div class="flex space-x-2">
                        <Input
                          v-model="colorFormats.hex"
                          class="font-mono flex-1"
                          readonly
                        />
                        <Button @click="copyColor('hex')" variant="ghost" size="sm">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                          复制
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RGB</label>
                      <div class="flex space-x-2">
                        <Input
                          v-model="colorFormats.rgb"
                          class="font-mono flex-1"
                          readonly
                        />
                        <Button @click="copyColor('rgb')" variant="ghost" size="sm">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                          复制
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RGBA</label>
                      <div class="flex space-x-2">
                        <Input
                          v-model="colorFormats.rgba"
                          class="font-mono flex-1"
                          readonly
                        />
                        <Button @click="copyColor('rgba')" variant="ghost" size="sm">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                          复制
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 预览区域 -->
                <div class="flex items-center justify-center">
                  <div class="w-80 h-80 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-inner flex items-center justify-center">
                    <div
                      class="w-32 h-32 rounded-2xl shadow-lg transition-all duration-300"
                      :style="{ backgroundColor: selectedColor }"
                    ></div>
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- 阴影生成 -->
            <TabItem label="阴影生成">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 预览区域 -->
                <div class="space-y-6">
                  <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8 h-80 flex items-center justify-center">
                    <div
                      class="shadow-preview transition-all duration-300"
                      :style="previewStyle"
                    ></div>
                  </div>

                  <!-- CSS 代码预览 -->
                  <div>
                    <div class="flex justify-between items-center mb-2">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">CSS 代码</h3>
                      <Button @click="copyShadowStyle" variant="ghost" size="sm">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                    <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">{{ cssCode }}</pre>
                  </div>
                </div>

                <!-- 控制区域 -->
                <div class="space-y-6">
                  <!-- 阴影类型 -->
                  <div>
                    <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">阴影类型</h4>
                    <Toggle v-model="shadowConfig.inset" @update:modelValue="handleShadowChange" label="内阴影" />
                  </div>

                  <!-- 阴影方向 -->
                  <div>
                    <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">阴影方向</h4>
                    <div class="grid grid-cols-3 gap-2">
                      <Button
                        v-for="dir in directions"
                        :key="dir.key"
                        @click="handleDirectionClick(dir.key)"
                        variant="ghost"
                        size="sm"
                        class="h-10 text-lg"
                        :class="shadowConfig.direction === dir.key ? '!bg-blue-100 dark:!bg-blue-900 !border-blue-500 !text-blue-600 dark:!text-blue-400' : ''"
                      >
                        {{ dir.icon }}
                      </Button>
                    </div>
                  </div>

                  <!-- 阴影形状 -->
                  <div>
                    <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">阴影形状</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <Button
                        v-for="shape in shapes"
                        :key="shape.key"
                        @click="shadowConfig.shape = shape.key; handleShadowChange()"
                        variant="ghost"
                        size="sm"
                        class="h-10 text-sm"
                        :class="shadowConfig.shape === shape.key ? '!bg-blue-100 dark:!bg-blue-900 !border-blue-500 !text-blue-600 dark:!text-blue-400' : ''"
                      >
                        {{ shape.label }}
                      </Button>
                    </div>
                  </div>

                  <!-- 数值控制 -->
                  <div class="space-y-4">
                    <NumberInput
                      v-model="shadowConfig.x"
                      label="X 偏移 (px)"
                      :min="-100"
                      :max="100"
                      @update:modelValue="handleShadowChange"
                    />
                    <NumberInput
                      v-model="shadowConfig.y"
                      label="Y 偏移 (px)"
                      :min="-100"
                      :max="100"
                      @update:modelValue="handleShadowChange"
                    />
                    <NumberInput
                      v-model="shadowConfig.blur"
                      label="模糊度 (px)"
                      :min="0"
                      :max="200"
                      @update:modelValue="handleShadowChange"
                    />
                    <NumberInput
                      v-model="shadowConfig.spread"
                      label="扩散 (px)"
                      :min="-50"
                      :max="50"
                      @update:modelValue="handleShadowChange"
                    />
                    <NumberInput
                      v-model="previewStyle.borderRadius"
                      label="圆角 (px)"
                      :min="0"
                      :max="100"
                      @update:modelValue="handleShadowChange"
                    />

                    <!-- 阴影颜色 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">阴影颜色</label>
                      <div class="flex items-center space-x-3">
                        <input
                          type="color"
                          v-model="shadowConfig.color"
                          @input="handleShadowChange"
                          class="w-12 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <Input
                          v-model="shadowConfig.color"
                          class="font-mono flex-1"
                          @input="handleShadowChange"
                        />
                      </div>
                    </div>

                    <!-- 透明度 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        透明度: {{ Math.round(shadowConfig.opacity * 100) }}%
                      </label>
                      <input
                        type="range"
                        v-model="shadowConfig.opacity"
                        min="0"
                        max="1"
                        step="0.01"
                        @input="handleShadowChange"
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- 色系调色板 -->
            <TabItem label="色系调色板">
              <div class="space-y-6">
                <!-- 头部操作 -->
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">预设色系</h3>
                  <Button @click="showGeneratorModal = true" variant="primary" size="sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    自定义色系
                  </Button>
                </div>

                <!-- 色系列表 -->
                <div class="space-y-4">
                  <div
                    v-for="(scheme, index) in colorSchemes"
                    :key="scheme.name"
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 color-scheme-card"
                  >
                    <!-- 色系头部 -->
                    <div class="flex justify-between items-center mb-3 color-scheme-header">
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ scheme.name }}</span>
                      <div class="flex items-center space-x-2 color-scheme-actions">
                        <!-- 只对自定义色系显示钉住按钮 -->
                        <Button
                          v-if="scheme.name.startsWith('自定义色系')"
                          @click="togglePin(index)"
                          variant="ghost"
                          size="sm"
                          class="text-xs"
                        >
                          <svg v-if="scheme.name === '自定义色系'" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                          </svg>
                          <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                          </svg>
                          {{ scheme.name === '自定义色系' ? '钉住' : '已钉住' }}
                        </Button>
                        <Button @click="copyColorScheme(scheme.colors)" variant="ghost" size="sm" class="text-xs">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                          复制色系
                        </Button>
                      </div>
                    </div>

                    <!-- 颜色块列表 -->
                    <div class="flex gap-2 h-16 color-block-grid">
                      <div
                        v-for="color in scheme.colors"
                        :key="color"
                        class="flex-1 rounded-md cursor-pointer relative overflow-hidden group transition-transform hover:scale-105"
                        :style="{ backgroundColor: color }"
                        @click="copyColorFromScheme(color)"
                      >
                        <!-- 颜色代码提示 -->
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span class="text-white text-xs font-mono bg-black/30 px-2 py-1 rounded color-block-tooltip">
                            {{ color }}
                          </span>
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-3 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">颜色选择器</h4>
            <ul class="space-y-2">
              <li>• 支持可视化颜色选择</li>
              <li>• 自动转换HEX、RGB、RGBA格式</li>
              <li>• 一键复制颜色代码</li>
              <li>• 实时预览颜色效果</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">阴影生成器</h4>
            <ul class="space-y-2">
              <li>• 支持内阴影和外阴影</li>
              <li>• 多种阴影形状效果</li>
              <li>• 可调节偏移、模糊、扩散等参数</li>
              <li>• 实时生成CSS代码</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">色系调色板</h4>
            <ul class="space-y-2">
              <li>• 12套精美预设色系</li>
              <li>• 自定义色系生成器</li>
              <li>• 支持变浅、变深、变灰</li>
              <li>• 一键复制单色或整套色系</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 自定义色系生成模态框 -->
  <Modal
    v-model:modelValue="showGeneratorModal"
    title="自定义色系生成器"
    size="md"
  >
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">基础颜色</label>
        <div class="flex items-center space-x-3">
          <input
            type="color"
            v-model="baseColor"
            class="w-16 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <Input
            v-model="baseColor"
            class="font-mono flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      <NumberInput
        v-model="colorCount"
        label="颜色数量"
        :min="3"
        :max="12"
        placeholder="选择生成的颜色数量"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">变化类型</label>
                 <Select
           v-model:modelValue="variationType"
           :options="variationOptions"
           placeholder="选择颜色变化类型"
         />
      </div>
    </div>

    <template #footer>
      <div class="flex space-x-3 justify-end">
        <Button @click="showGeneratorModal = false" variant="ghost">
          取消
        </Button>
        <Button @click="generateColorScheme" variant="primary">
          生成色系
        </Button>
      </div>
    </template>
  </Modal>
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

/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .slider::-webkit-slider-thumb {
  background: #60a5fa;
}

.dark .slider::-moz-range-thumb {
  background: #60a5fa;
}

/* 色系调色板样式 */
.color-scheme-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.color-scheme-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .color-scheme-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.color-block-tooltip {
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .color-scheme-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .color-scheme-actions {
    align-self: flex-end;
  }

  .color-block-grid {
    height: 3rem; /* 移动端较小的颜色块 */
  }

  .color-block-tooltip {
    font-size: 0.625rem; /* 10px */
  }
}
</style>
