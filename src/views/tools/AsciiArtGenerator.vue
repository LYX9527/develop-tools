<script lang="ts" setup>
import {onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import {gsap} from 'gsap'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import Button from '@/components/ui/Button.vue'
import TextArea from '@/components/ui/TextArea.vue'
import Select from '@/components/ui/Select.vue'
import Upload from '@/components/ui/Upload.vue'
import Toggle from '@/components/ui/Toggle.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

// 状态管理
const activeTab = ref(0)
const imageFile = ref<File | null>(null)
const previewUrl = ref('')
const asciiResult = ref('')
const isConverting = ref(false)
const showCopiedMessage = ref(false)
const isFullscreen = ref(false)

// 艺术字符配置
const textInput = ref('Hello World')
const artisticResult = ref('')
const isGeneratingText = ref(false)
const selectedFont = ref('standard')

// 艺术字体样式
const fontStyles = {
  standard: {
    name: '标准',
    generateFunction: generateStandardArt
  },
  block: {
    name: '方块',
    generateFunction: generateBlockArt
  },
  shadow: {
    name: '阴影',
    generateFunction: generateShadowArt
  },
  thin: {
    name: '细线',
    generateFunction: generateThinArt
  },
  script: {
    name: '手写',
    generateFunction: generateScriptArt
  }
}

const fontOptions = Object.entries(fontStyles).map(([value, data]) => ({
  label: data.name,
  value
}))

// 配置选项
const config = reactive({
  width: 80,
  inverted: false,
  colorOutput: true,
  charSet: 'standard'
})

// 预设字符集
const charSets = {
  standard: '@%#*+=-:. ',
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  blocks: '█▓▒░ ',
  simple: '#@&%O+=-:. '
}

const charSetOptions = [
  { label: '标准', value: 'standard' },
  { label: '详细', value: 'detailed' },
  { label: '方块', value: 'blocks' },
  { label: '简单', value: 'simple' }
]

const widthOptions = [
  { label: '小 (40字符)', value: 40 },
  { label: '中 (80字符)', value: 80 },
  { label: '大 (120字符)', value: 120 },
  { label: '超大 (160字符)', value: 160 }
]

// 艺术字符生成函数
function generateArtisticText() {
  if (!textInput.value.trim() || isGeneratingText.value) return

  isGeneratingText.value = true

  try {
    // 调用选中字体的生成函数
    const style = fontStyles[selectedFont.value as keyof typeof fontStyles]
    if (style && style.generateFunction) {
      artisticResult.value = style.generateFunction(textInput.value)
    } else {
      artisticResult.value = generateStandardArt(textInput.value)
    }
  } catch (error) {
    console.error('生成艺术字符失败:', error)
    toast.error('生成艺术字符失败')
    artisticResult.value = ''
  } finally {
    isGeneratingText.value = false
  }
}

// 标准艺术字
function generateStandardArt(text: string): string {
  const charHeight = 5
  const charWidth = 4

  // 简单的ASCII字符映射
  const charMaps: { [key: string]: string[] } = {
    'A': [
      ' ## ',
      '#  #',
      '####',
      '#  #',
      '#  #'
    ],
    'B': [
      '### ',
      '#  #',
      '### ',
      '#  #',
      '### '
    ],
    'C': [
      ' ###',
      '#   ',
      '#   ',
      '#   ',
      ' ###'
    ],
    'D': [
      '### ',
      '#  #',
      '#  #',
      '#  #',
      '### '
    ],
    'E': [
      '####',
      '#   ',
      '### ',
      '#   ',
      '####'
    ],
    'F': [
      '####',
      '#   ',
      '### ',
      '#   ',
      '#   '
    ],
    'G': [
      ' ###',
      '#   ',
      '# ##',
      '#  #',
      ' ###'
    ],
    'H': [
      '#  #',
      '#  #',
      '####',
      '#  #',
      '#  #'
    ],
    'I': [
      '###',
      ' # ',
      ' # ',
      ' # ',
      '###'
    ],
    'J': [
      '####',
      '   #',
      '   #',
      '#  #',
      ' ## '
    ],
    'K': [
      '#  #',
      '# # ',
      '##  ',
      '# # ',
      '#  #'
    ],
    'L': [
      '#   ',
      '#   ',
      '#   ',
      '#   ',
      '####'
    ],
    'M': [
      '#  #',
      '####',
      '####',
      '#  #',
      '#  #'
    ],
    'N': [
      '#  #',
      '## #',
      '# ##',
      '#  #',
      '#  #'
    ],
    'O': [
      ' ## ',
      '#  #',
      '#  #',
      '#  #',
      ' ## '
    ],
    'P': [
      '### ',
      '#  #',
      '### ',
      '#   ',
      '#   '
    ],
    'Q': [
      ' ## ',
      '#  #',
      '#  #',
      '# ##',
      ' ###'
    ],
    'R': [
      '### ',
      '#  #',
      '### ',
      '# # ',
      '#  #'
    ],
    'S': [
      ' ###',
      '#   ',
      ' ## ',
      '   #',
      '### '
    ],
    'T': [
      '###',
      ' # ',
      ' # ',
      ' # ',
      ' # '
    ],
    'U': [
      '#  #',
      '#  #',
      '#  #',
      '#  #',
      ' ## '
    ],
    'V': [
      '#  #',
      '#  #',
      '#  #',
      ' ## ',
      ' ## '
    ],
    'W': [
      '#  #',
      '#  #',
      '####',
      '####',
      '#  #'
    ],
    'X': [
      '#  #',
      ' ## ',
      ' ## ',
      ' ## ',
      '#  #'
    ],
    'Y': [
      '#  #',
      '#  #',
      ' ## ',
      ' ## ',
      ' ## '
    ],
    'Z': [
      '####',
      '  # ',
      ' #  ',
      '#   ',
      '####'
    ],
    ' ': [
      '    ',
      '    ',
      '    ',
      '    ',
      '    '
    ]
  }

  const lines = Array(charHeight).fill('').map(() => '')

  for (const char of text.toUpperCase()) {
    const charMap = charMaps[char] || charMaps[' ']
    for (let i = 0; i < charHeight; i++) {
      lines[i] += (charMap[i] || '    ') + ' '
    }
  }

  return lines.join('\n')
}

// 方块艺术字
function generateBlockArt(text: string): string {
  const blockChars = ['█', '▓', '▒', '░']
  let result = ''

  // 每个字符使用5x5的方块表示
  for (let i = 0; i < 5; i++) {
    for (const char of text) {
      // 简单示例：根据字符和行号生成不同密度的方块
      const code = char.charCodeAt(0)
      for (let j = 0; j < 5; j++) {
        const value = (code + i + j) % 4
        result += blockChars[value]
      }
      result += ' '
    }
    result += '\n'
  }

  return result
}

// 阴影艺术字
function generateShadowArt(text: string): string {
  const chars = text.split('')
  let result = ''

  // 第一行：带阴影的字符
  result += chars.map(c => `${c}${c}`).join(' ') + '\n'
  // 第二行：阴影部分
  result += chars.map(c => ` ${c}`).join(' ') + '\n'

  return result
}

// 细线艺术字
function generateThinArt(text: string): string {
  const lines = [
    text.split('').map(() => '┌─┐').join(' '),
    text.split('').map(c => `│${c}│`).join(' '),
    text.split('').map(() => '└─┘').join(' ')
  ]

  return lines.join('\n')
}

// 手写风格艺术字
function generateScriptArt(text: string): string {
  const chars = text.split('')
  const lines = [
    `_${chars.map(() => '_').join('_')}_`,
    `/${chars.map(() => ' ').join('')}\\`,
    `\\${chars.join('')}/`,
    ` ${chars.map(() => '-').join('-')} `
  ]

  return lines.join('\n')
}

// 文件上传处理
async function handleFileUpload(files: File[]) {
  const file = files[0]
  if (!file) return

  // 防止重复处理同一个文件
  if (imageFile.value === file) return

  // 清理之前的预览URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)

  // 避免在转换过程中重复触发
  if (!isConverting.value) {
    await convertToAscii()
  }
}

// 处理上传错误
function handleUploadError(message: string) {
  toast.error(message)
}

// 转换图片为ASCII字符画
async function convertToAscii() {
  if (!imageFile.value || isConverting.value) return

  isConverting.value = true
  asciiResult.value = ''

  try {
    const img = new Image()
    img.src = previewUrl.value

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('图片加载失败'))
      // 设置超时
      setTimeout(() => reject(new Error('图片加载超时')), 10000)
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    // 计算高度，保持宽高比
    const width = config.width
    const height = Math.round(width * img.height / img.width / 2.2) // 字符高宽比约为2.2:1

    canvas.width = width
    canvas.height = height

    // 绘制图像
    ctx.drawImage(img, 0, 0, width, height)

    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data

    let result = ''
    const chars = charSets[config.charSet as keyof typeof charSets]

    // 处理每个像素
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        // 计算灰度值
        const r = pixels[idx]
        const g = pixels[idx + 1]
        const b = pixels[idx + 2]
        const a = pixels[idx + 3] / 255

        // 加权平均法计算灰度
        let gray = (0.299 * r + 0.587 * g + 0.114 * b) * a

        // 处理反转选项
        if (config.inverted) {
          gray = 255 - gray
        }

        // 映射灰度值到字符
        const charIndex = Math.floor(gray * (chars.length - 1) / 255)
        const char = chars[charIndex]

        // 增加颜色支持
        if (config.colorOutput) {
          result += `<span style="color: rgb(${r},${g},${b})">${char}</span>`
        } else {
          result += char
        }
      }
      result += '\n'
    }

    asciiResult.value = result
    toast.success('转换完成')
  } catch (error) {
    console.error('转换失败:', error)
    toast.error(`转换失败: ${error.message || '请重试'}`)
    asciiResult.value = ''
  } finally {
    isConverting.value = false
  }
}

// 监听配置变化时重新转换
watch([() => config.width, () => config.inverted, () => config.charSet, () => config.colorOutput],
    () => {
      if (imageFile.value && !isConverting.value) {
        convertToAscii()
      }
    }
)

// 监听文本变化
watch(textInput, () => {
  if (!isGeneratingText.value) {
    generateArtisticText()
  }
})

// 监听字体变化
watch(selectedFont, () => {
  if (!isGeneratingText.value) {
    generateArtisticText()
  }
})

// 复制结果
function copyResult(mode = 'image') {
  const content = mode === 'image' ? asciiResult.value : artisticResult.value
  if (!content) {
    toast.warning('没有可复制的内容')
    return
  }

  // 创建临时元素用于纯文本复制
  const textarea = document.createElement('textarea')
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  textarea.value = tempDiv.innerText || tempDiv.textContent || ''

  document.body.appendChild(textarea)
  textarea.select()
  navigator.clipboard.writeText(textarea.value)
    .then(() => {
      toast.success('已复制到剪贴板')
      showCopiedMessage.value = true
      setTimeout(() => {
        showCopiedMessage.value = false
      }, 2000)
    })
    .catch(() => {
      toast.error('复制失败')
    })

  document.body.removeChild(textarea)
}

// 下载结果
function downloadResult(mode = 'image') {
  const content = mode === 'image' ? asciiResult.value : artisticResult.value
  if (!content) {
    toast.warning('没有可下载的内容')
    return
  }

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  const text = tempDiv.innerText || tempDiv.textContent || ''

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = mode === 'image' ? 'ascii_art.txt' : 'artistic_text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  toast.success('下载成功')
}

// 切换全屏显示
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// ESC键退出全屏
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// 初始化
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  // 生成初始艺术字符
  generateArtisticText()

  // 动画
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // 恢复滚动
  document.body.style.overflow = ''

  // 清理对象URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }

  // 清理文件引用
  imageFile.value = null

  // 重置状态
  isConverting.value = false
  isGeneratingText.value = false
  asciiResult.value = ''
  artisticResult.value = ''
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          ASCII字符画生成器
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          将图片转换为ASCII字符画，支持艺术字符生成
        </p>
      </div>

      <!-- 标签页内容 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" :animated="true" variant="underline">
            <!-- 图片转字符画 -->
            <TabItem label="图片转字符画">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 左侧上传和配置区 -->
                <div class="space-y-6">
                  <!-- 上传区域 -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择图片</h3>
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

                  <!-- 预览图片 -->
                  <div v-if="previewUrl" class="relative">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">图片预览</h3>
                    <div class="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <img :src="previewUrl" alt="预览图片" class="max-w-full h-auto max-h-64 mx-auto rounded"/>
                    </div>
                  </div>

                  <!-- 配置选项 -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">配置选项</h3>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输出宽度</label>
                        <Select v-model:modelValue="config.width" :options="widthOptions" />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">字符集</label>
                        <Select v-model:modelValue="config.charSet" :options="charSetOptions" />
                      </div>

                      <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">反转亮度</label>
                        <Toggle v-model="config.inverted" />
                      </div>

                      <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">彩色输出</label>
                        <Toggle v-model="config.colorOutput" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 右侧结果区 -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">转换结果</h3>
                    <div v-if="asciiResult" class="flex space-x-2">
                      <Button size="sm" variant="ghost" @click="copyResult('image')">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                      <Button size="sm" variant="ghost" @click="downloadResult('image')">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        下载
                      </Button>
                      <Button size="sm" variant="ghost" @click="toggleFullscreen">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        全屏
                      </Button>
                    </div>
                  </div>

                  <div v-if="asciiResult" class="bg-black text-green-400 p-4 rounded-lg font-mono text-xs leading-tight overflow-auto max-h-96">
                    <pre class="whitespace-pre" v-html="asciiResult"></pre>
                  </div>

                  <div v-else-if="!isConverting" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
                    </svg>
                    <p>上传图片后，ASCII字符画将显示在这里</p>
                  </div>

                  <!-- 加载状态 -->
                  <div v-if="isConverting" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <div class="inline-flex items-center space-x-4">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p class="text-gray-600 dark:text-gray-300">正在转换图片...</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- 艺术字符生成 -->
            <TabItem label="艺术字符生成">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 左侧输入和配置区 -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入文字</label>
                    <TextArea
                      v-model="textInput"
                      placeholder="请输入要转换的文字..."
                      rows="3"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">字体风格</label>
                    <Select v-model:modelValue="selectedFont" :options="fontOptions" />
                  </div>
                </div>

                <!-- 右侧结果区 -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">生成结果</h3>
                    <div v-if="artisticResult" class="flex space-x-2">
                      <Button size="sm" variant="ghost" @click="copyResult('text')">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                      <Button size="sm" variant="ghost" @click="downloadResult('text')">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        下载
                      </Button>
                    </div>
                  </div>

                  <div v-if="artisticResult" class="bg-black text-green-400 p-6 rounded-lg font-mono text-sm leading-relaxed overflow-auto max-h-96">
                    <pre class="text-center whitespace-pre">{{ artisticResult }}</pre>
                  </div>

                  <div v-else class="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
                    </svg>
                    <p>输入文字后，艺术字符将显示在这里</p>
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
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">图片转字符画</h4>
            <ul class="space-y-1">
              <li>• 支持PNG、JPG、GIF等图片格式</li>
              <li>• 可调整输出宽度和字符集</li>
              <li>• 支持反转亮度和彩色输出</li>
              <li>• 提供全屏查看模式</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">艺术字符生成</h4>
            <ul class="space-y-1">
              <li>• 支持多种字体风格</li>
              <li>• 实时预览生成效果</li>
              <li>• 可复制和下载结果</li>
              <li>• 适合制作ASCII横幅</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 全屏模式 -->
    <div v-if="isFullscreen" class="fixed inset-0 bg-black z-50 flex flex-col">
      <div class="flex items-center justify-between p-4 bg-gray-900">
        <h2 class="text-white text-xl font-semibold">ASCII字符画 - 全屏查看</h2>
        <div class="flex space-x-2">
          <Button class="text-white hover:bg-gray-800" variant="ghost" @click="copyResult('image')">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            复制
          </Button>
          <Button class="text-white hover:bg-gray-800" variant="ghost" @click="toggleFullscreen">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            退出全屏
          </Button>
        </div>
      </div>
      <div class="flex-1 overflow-auto p-6 bg-black text-green-400 font-mono text-xs leading-tight">
        <pre class="whitespace-pre text-center" v-html="asciiResult"></pre>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopiedMessage" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
      已复制到剪贴板！
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

.ascii-art {
  word-break: break-all;
  white-space: pre-wrap;
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
