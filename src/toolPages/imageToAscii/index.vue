<script setup lang="ts">
import {ref, reactive, onMounted, watch, onUnmounted} from 'vue'
import GlassMorphismSelect from '@/components/GlassMorphismSelect.vue'

// 状态管理
const imageFile = ref<File | null>(null)
const previewUrl = ref('')
const asciiResult = ref('')
const isConverting = ref(false)
const showCopiedMessage = ref(false)
const isFullscreen = ref(false)

// 标签页状态
const activeTab = ref('image') // 'image' 或 'text'

// 艺术字符配置
const textInput = ref('输入文字')
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
  {label: '标准', value: 'standard'},
  {label: '详细', value: 'detailed'},
  {label: '方块', value: 'blocks'},
  {label: '简单', value: 'simple'}
]

const widthOptions = [
  {label: '小 (40字符)', value: 40},
  {label: '中 (80字符)', value: 80},
  {label: '大 (120字符)', value: 120},
  {label: '超大 (160字符)', value: 160}
]

// 添加一个ref用于文件输入
const fileInputRef = ref<HTMLInputElement | null>(null)

// 添加一个方法来触发文件选择
function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 切换标签页
function switchTab(tab: string) {
  activeTab.value = tab
  
  // 如果切换到文本标签页并且没有生成过结果，则立即生成
  if (tab === 'text' && !artisticResult.value) {
    generateArtisticText()
  }
}

// 艺术字符生成函数
function generateArtisticText() {
  if (!textInput.value.trim()) return
  
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
    artisticResult.value = '生成失败，请重试。'
  } finally {
    isGeneratingText.value = false
  }
}

// 标准艺术字
function generateStandardArt(text: string): string {
  // 使用Figlet API或其他方式生成ASCII艺术字
  // 这里使用简单示例
  const lines = [
    `  ___  ___  ___  ___  ___  `,
    ` / _ \\/ _ \\/ _ \\/ _ \\/ _ \\ `,
    `| (_) | (_) | (_) | (_) | (_) |`,
    ` \\___/ \\___/ \\___/ \\___/ \\___/ `
  ]
  
  return processArtText(text.split('').map(() => lines).flat().join('\n'))
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
  
  return processArtText(result)
}

// 阴影艺术字
function generateShadowArt(text: string): string {
  // 简单实现，实际应用中可以使用更复杂的算法
  const chars = text.split('')
  let result = ''
  
  // 第一行：带阴影的字符
  result += chars.map(c => `${c} `).join('') + '\n'
  // 第二行：阴影部分
  result += chars.map(() => '\\ ').join('') + '\n'
  
  return processArtText(result)
}

// 细线艺术字
function generateThinArt(text: string): string {
  // 简单实现
  const lines = [
    text.split('').map(c => `┌─┐`).join(' '),
    text.split('').map(c => `│${c}│`).join(' '),
    text.split('').map(c => `└─┘`).join(' ')
  ]
  
  return processArtText(lines.join('\n'))
}

// 手写风格艺术字
function generateScriptArt(text: string): string {
  // 简单实现
  const chars = text.split('')
  return processArtText(`_${chars.join('_')}_\n/${chars.map(() => ' ').join('')}\\`)
}

// 处理艺术文本，添加HTML格式
function processArtText(text: string): string {
  return `<pre>${text.replace(/\n/g, '<br>')}</pre>`
}

// 监听文件上传
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    previewUrl.value = URL.createObjectURL(target.files[0])
    convertToAscii()
  }
}

// 监听拖放事件
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    imageFile.value = event.dataTransfer.files[0]
    previewUrl.value = URL.createObjectURL(event.dataTransfer.files[0])
    convertToAscii()
  }
}

// 转换图片为ASCII字符画
async function convertToAscii() {
  if (!imageFile.value) return

  isConverting.value = true
  asciiResult.value = ''

  try {
    const img = new Image()
    img.src = previewUrl.value

    await new Promise((resolve) => {
      img.onload = resolve
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
      result += '<br>'
    }

    asciiResult.value = result
  } catch (error) {
    console.error('转换失败:', error)
    asciiResult.value = '转换失败，请重试。'
  } finally {
    isConverting.value = false
  }
}

// 监听配置变化时重新转换
watch([() => config.width, () => config.inverted, () => config.charSet, () => config.colorOutput],
    () => {
      if (imageFile.value) {
        convertToAscii()
      }
    }
)

// 复制结果
function copyResult(mode = 'image') {
  const content = mode === 'image' ? asciiResult.value : artisticResult.value;
  if (!content) return;
  
  // 创建临时元素用于纯文本复制
  const textarea = document.createElement('textarea');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  textarea.value = tempDiv.innerText;
  
  document.body.appendChild(textarea);
  textarea.select();
  navigator.clipboard.writeText(textarea.value);
  document.body.removeChild(textarea);
  
  // 显示复制成功提示
  showCopiedMessage.value = true;
  setTimeout(() => {
    showCopiedMessage.value = false;
  }, 2000);
}

// 下载结果
function downloadResult(mode = 'image') {
  const content = mode === 'image' ? asciiResult.value : artisticResult.value;
  if (!content) return;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const text = tempDiv.innerText;
  
  const blob = new Blob([text], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = mode === 'image' ? 'ascii_art.txt' : 'artistic_text.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 切换全屏显示
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    // 添加防止滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 恢复滚动
    document.body.style.overflow = ''
  }
}

// ESC键退出全屏
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// 注册和移除键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // 恢复滚动
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="container">
    <!-- 标签页切换 -->
    <div class="tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'image' }" 
        @click="switchTab('image')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        图片转字符画
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'text' }" 
        @click="switchTab('text')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="9" x2="20" y2="9"/>
          <line x1="4" y1="15" x2="20" y2="15"/>
          <line x1="10" y1="3" x2="8" y2="21"/>
          <line x1="16" y1="3" x2="14" y2="21"/>
        </svg>
        艺术字符生成
      </button>
    </div>

    <!-- 图片转字符画标签页 -->
    <div v-if="activeTab === 'image'" class="tab-content">
      <div class="tool-columns">
        <!-- 左侧上传和配置区 -->
        <div class="left-column">
          <div class="upload-section">
            <div
                class="upload-area"
                @dragover="handleDragOver"
                @drop="handleDrop"
                :class="{ 'has-image': previewUrl }"
            >
              <div v-if="!previewUrl" class="upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>点击选择或拖放图片到此处</p>
                <input type="file" accept="image/*" @change="handleFileUpload" class="file-input"/>
              </div>
              <div v-else class="preview-container">
                <img :src="previewUrl" class="image-preview" alt="预览图"/>
                <button class="change-image-btn" @click="triggerFileInput">
                  更换图片
                </button>
                <input ref="fileInputRef" type="file" accept="image/*" @change="handleFileUpload" class="file-input"/>
              </div>
            </div>

            <div class="config-section">
              <div class="config-item">
                <label>输出宽度:</label>
                <GlassMorphismSelect v-model="config.width" :options="widthOptions"/>
              </div>

              <div class="config-item">
                <label>字符集:</label>
                <GlassMorphismSelect v-model="config.charSet" :options="charSetOptions"/>
              </div>

              <div class="config-item toggle-item">
                <label>反转亮度:</label>
                <label class="switch">
                  <input type="checkbox" v-model="config.inverted">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="config-item toggle-item">
                <label>彩色输出:</label>
                <label class="switch">
                  <input type="checkbox" v-model="config.colorOutput">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧结果区 -->
        <div class="right-column">
          <div class="result-section" v-if="asciiResult">
            <div class="result-header">
              <h2>转换结果</h2>
              <div class="result-actions">
                <button class="action-button" @click="copyResult('image')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  复制
                </button>
                <button class="action-button" @click="downloadResult('image')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  下载
                </button>
                <button class="action-button" @click="toggleFullscreen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                  全屏
                </button>
              </div>
            </div>

            <div class="copied-message" v-if="showCopiedMessage">已复制到剪贴板！</div>

            <div class="ascii-result" ref="resultContainer">
              <div v-html="asciiResult" class="ascii-art"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="loading-overlay" v-if="isConverting">
        <div class="spinner"></div>
        <p>正在转换，请稍候...</p>
      </div>

      <!-- 全屏模式 -->
      <div v-if="isFullscreen" class="fullscreen-overlay">
        <div class="fullscreen-header">
          <h2>ASCII字符画</h2>
          <div class="fullscreen-actions">
            <button class="action-button" @click="copyResult('image')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              复制
            </button>
            <button class="action-button" @click="downloadResult('image')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              下载
            </button>
            <button class="action-button" @click="toggleFullscreen">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
              退出全屏
            </button>
          </div>
        </div>
        <div class="fullscreen-content">
          <div v-html="asciiResult" class="ascii-art fullscreen-ascii"></div>
        </div>
      </div>
    </div>

    <!-- 艺术字符生成标签页 -->
    <div v-else-if="activeTab === 'text'" class="tab-content">
      <div class="tool-columns">
        <!-- 左侧输入和配置区 -->
        <div class="left-column">
          <div class="upload-section">
            <div class="section-title">输入文字</div>
            <div class="text-input-container">
              <textarea 
                v-model="textInput" 
                class="text-input" 
                placeholder="请输入要转换的文字..."
                @input="generateArtisticText"
              ></textarea>
            </div>
          </div>

          <div class="config-section">
            <div class="section-title">配置选项</div>
            
            <div class="config-item">
              <label>字体风格:</label>
              <GlassMorphismSelect v-model="selectedFont" :options="fontOptions" @change="generateArtisticText"/>
            </div>
          </div>
        </div>

        <!-- 右侧结果区 -->
        <div class="right-column">
          <div class="result-section" v-if="artisticResult">
            <div class="result-header">
              <h2>生成结果</h2>
              <div class="result-actions">
                <button class="action-button" @click="copyResult('text')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  复制
                </button>
                <button class="action-button" @click="downloadResult('text')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  下载
                </button>
              </div>
            </div>

            <div class="ascii-result artistic-result">
              <div v-html="artisticResult" class="ascii-art"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 全屏显示和加载遮罩 -->
  <div v-if="isFullscreen" class="fullscreen-overlay">
    <div class="fullscreen-header">
      <h2>ASCII字符画</h2>
      <div class="fullscreen-actions">
        <button class="action-button" @click="copyResult('image')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制
        </button>
        <button class="action-button" @click="downloadResult('image')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          下载
        </button>
        <button class="action-button" @click="toggleFullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
          退出全屏
        </button>
      </div>
    </div>
    <div class="fullscreen-content">
      <div v-html="asciiResult" class="ascii-art fullscreen-ascii"></div>
    </div>
  </div>

  <div class="loading-overlay" v-if="isConverting">
    <div class="spinner"></div>
    <p>正在转换，请稍候...</p>
  </div>
</template>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.page-title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--n-text-color, inherit);
}

.tool-description {
  text-align: center;
  margin-bottom: 30px;
  color: var(--n-text-color-2, inherit);

  p {
    margin-bottom: 10px;
  }
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
}

.upload-area {
  flex: 1;
  height: 300px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.05);
  }

  &.has-image {
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--n-text-color-3, rgba(255, 255, 255, 0.5));

  svg {
    margin-bottom: 15px;
  }

  p {
    margin-bottom: 10px;
  }
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .image-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .change-image-btn {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.9);
    }
  }
}

.config-section {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    color: var(--n-text-color-2, inherit);
  }

  &.toggle-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: rgba(24, 144, 255, 0.7);

      &:before {
        transform: translateX(22px);
      }
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: .4s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
}

.result-section {
  margin-top: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-size: 18px;
    margin: 0;
  }
}

.result-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(24, 144, 255, 0.2);
  color: #40a9ff;
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(24, 144, 255, 0.3);
  }
}

.copied-message {
  position: absolute;
  top: 60px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  animation: fadeOut 2s forwards;
  z-index: 10;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.ascii-result {
  padding: 20px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.3);
  max-height: 500px;
  overflow-y: auto;
}

.ascii-art {
  font-family: monospace;
  font-size: 8px;
  line-height: 0.8;
  white-space: pre;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 10px;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;

  p {
    margin-top: 20px;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-size: 20px;
    margin: 0;
    color: white;
  }
}

.fullscreen-actions {
  display: flex;
  gap: 10px;
}

.fullscreen-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-ascii {
  font-size: 12px !important;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 14px !important;
  }

  @media (min-width: 1200px) {
    font-size: 16px !important;
  }
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background: rgba(24, 144, 255, 0.2);
    color: #40a9ff;
  }
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

.text-input-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.text-input {
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: none;
  background: transparent;
  color: white;
  font-size: 16px;
  resize: vertical;
  
  &:focus {
    outline: none;
  }
}

.artistic-result {
  font-family: monospace;
  text-align: center;
  padding: 30px;
  
  pre {
    margin: 0;
    display: inline-block;
    text-align: left;
  }
}
</style>
