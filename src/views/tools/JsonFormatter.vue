<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {gsap} from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

const inputJson = ref('')
const outputJson = ref('')
const outputContainer = ref<HTMLDivElement | null>(null)
const indentSize = ref(2)
const isValid = ref(true)
const errorMessage = ref('')
const isFullscreen = ref(false)
const displayMode = ref<'formatted' | 'tree'>('formatted')

// 定义样式类名
const styles = {
  collapsible: 'json-tree-collapsible',
  toggleIcon: 'json-tree-toggle-icon',
  bracket: 'json-tree-bracket',
  itemCount: 'json-tree-item-count',
  indent: 'json-tree-indent',
  hidden: 'json-tree-hidden',
  key: 'json-tree-key',
  string: 'json-tree-string',
  number: 'json-tree-number',
  boolean: 'json-tree-boolean',
  null: 'json-tree-null',
  preview: 'json-tree-preview'
}

// 格式化JSON
const formatJson = () => {
  if (!inputJson.value.trim()) {
    toast.warning('请先输入JSON数据')
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    if (displayMode.value === 'tree') {
      displayJSONTree(parsed)
      outputJson.value = ''
    } else {
    outputJson.value = JSON.stringify(parsed, null, indentSize.value)
      if (outputContainer.value) {
        outputContainer.value.innerHTML = ''
      }
    }
    isValid.value = true
    errorMessage.value = ''
    toast.success('JSON格式化成功！')
  } catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的JSON格式'
    outputJson.value = ''
    if (outputContainer.value) {
      outputContainer.value.innerHTML = ''
    }
    toast.error('JSON格式无效')
  }
}

// 压缩JSON
const minifyJson = () => {
  if (!inputJson.value.trim()) {
    toast.warning('请先输入JSON数据')
    return
  }

  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    displayMode.value = 'formatted'
    if (outputContainer.value) {
      outputContainer.value.innerHTML = ''
    }
    isValid.value = true
    errorMessage.value = ''
    toast.success('JSON压缩成功！')
  } catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的JSON格式'
    outputJson.value = ''
    toast.error('JSON格式无效')
  }
}

// 验证JSON
const validateJson = () => {
  if (!inputJson.value.trim()) {
    toast.warning('请先输入JSON数据')
    return
  }

  try {
    JSON.parse(inputJson.value)
    isValid.value = true
    errorMessage.value = ''
    toast.success('JSON格式有效！')
  } catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的JSON格式'
    toast.error('JSON格式无效')
  }
}

// 转义JSON
const escapeJson = () => {
  const input = inputJson.value
  if (!input.trim()) {
    toast.warning('请输入内容')
    return
  }
  const escaped = input.replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')

  outputJson.value = escaped
  displayMode.value = 'formatted'
  if (outputContainer.value) {
    outputContainer.value.innerHTML = ''
  }
  errorMessage.value = ''
  toast.success('JSON转义成功！')
}

// 去除转义
const unescapeJson = () => {
  const input = inputJson.value
  if (!input.trim()) {
    toast.warning('请输入内容')
    return
  }
  try {
    const unescaped = JSON.parse(`"${input}"`)
    outputJson.value = unescaped
    displayMode.value = 'formatted'
    if (outputContainer.value) {
      outputContainer.value.innerHTML = ''
    }
    errorMessage.value = ''
    toast.success('去除转义成功！')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '解析转义字符时出错'
    toast.error('解析转义字符时出错')
  }
}

// 显示树形视图
const showTreeView = () => {
  if (!inputJson.value.trim()) {
    toast.warning('请先输入JSON数据')
    return
  }
  displayMode.value = 'tree'
  formatJson()
}

// 显示格式化视图
const showFormattedView = () => {
  if (!inputJson.value.trim()) {
    toast.warning('请先输入JSON数据')
    return
  }
  displayMode.value = 'formatted'
  formatJson()
}

// 清空内容
const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
  if (outputContainer.value) {
    outputContainer.value.innerHTML = ''
  }
  isValid.value = true
  errorMessage.value = ''
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    let textToCopy = ''

    if (displayMode.value === 'tree' && outputContainer.value) {
      // 从树形视图提取JSON文本
      try {
        const parsed = JSON.parse(inputJson.value)
        textToCopy = JSON.stringify(parsed, null, indentSize.value)
      } catch {
        textToCopy = inputJson.value
      }
    } else {
      textToCopy = outputJson.value
    }

    if (!textToCopy) {
      toast.warning('没有可复制的内容')
      return
    }

    await navigator.clipboard.writeText(textToCopy)
    toast.success('已复制到剪贴板！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 示例JSON
const loadExample = () => {
  inputJson.value = JSON.stringify({
    "name": "开发者工具箱",
    "version": "1.0.0",
    "features": [
      "JSON格式化",
      "Base64转换",
      "密码生成器"
    ],
    "config": {
      "theme": "dark",
      "language": "zh-CN",
      "autoSave": true
    },
    "meta": {
      "author": "Developer",
      "created": "2024-01-01",
      "tags": ["tools", "development", "utilities"]
    }
  }, null, 2)

  // 自动格式化示例数据
  formatJson()
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 显示JSON树形结构
function displayJSONTree(obj: any) {
  if (!outputContainer.value) return
  outputContainer.value.innerHTML = ''
  outputContainer.value.appendChild(createJSONTree(obj))
}

// 创建JSON树形结构
function createJSONTree(value: any, key: string | null = null, level = 0, isLast = true) {
  const container = document.createElement('div')
  container.dataset.v = ''

  if (key !== null) {
    const keySpan = document.createElement('span')
    keySpan.className = styles.key
    keySpan.dataset.v = ''
    keySpan.textContent = `"${key}": `
    container.appendChild(keySpan)
  }

  if (value === null) {
    const nullSpan = document.createElement('span')
    nullSpan.className = styles.null
    nullSpan.dataset.v = ''
    nullSpan.textContent = 'null'
    container.appendChild(nullSpan)
    if (!isLast) container.appendChild(createComma())
    return container
  }

  switch (typeof value) {
    case 'object':
      const isArray = Array.isArray(value)
      const entries = Object.entries(value)

      // 创建主容器
      const wrapper = document.createElement('div')
      wrapper.className = styles.collapsible
      wrapper.dataset.v = ''

      // 创建展开/折叠行
      const lineContent = document.createElement('div')
      lineContent.className = 'line-content'

      // 创建开始括号
      const openBracket = document.createElement('span')
      openBracket.className = styles.bracket
      openBracket.textContent = isArray ? '[' : '{'
      lineContent.appendChild(openBracket)

      if (entries.length > 0) {
        // 创建折叠时的预览
        const preview = document.createElement('span')
        preview.className = styles.preview
        preview.style.display = 'none'
        preview.textContent = ' ... '
        lineContent.appendChild(preview)

        // 创建项目数量
        const itemCount = document.createElement('span')
        itemCount.className = styles.itemCount
        itemCount.textContent = ` ${entries.length} 项`
        lineContent.appendChild(itemCount)

        // 创建子节点容器
        const childrenContainer = document.createElement('div')
        childrenContainer.className = styles.indent

        // 添加所有子节点
        entries.forEach(([k, v], i) => {
          const childWrapper = document.createElement('div')
          childWrapper.className = 'child-wrapper'
          const child = createJSONTree(v, isArray ? null : k, level + 1, i === entries.length - 1)
          childWrapper.appendChild(child)
          childrenContainer.appendChild(childWrapper)
        })

        // 创建结束括号容器
        const closingContainer = document.createElement('div')
        closingContainer.className = 'closing-line'
        closingContainer.style.marginLeft = level > 0 ? '20px' : '0'

        // 创建结束括号
        const closeBracket = document.createElement('span')
        closeBracket.className = styles.bracket
        closeBracket.textContent = isArray ? ']' : '}'
        closingContainer.appendChild(closeBracket)

        // 添加逗号（如果需要）
        if (!isLast) {
          const comma = createComma()
          closingContainer.appendChild(comma)
        }

        // 添加折叠功能
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation()
          const isCollapsed = wrapper.classList.toggle('collapsed')
          childrenContainer.classList.toggle('hidden', isCollapsed)
          preview.style.display = isCollapsed ? 'inline' : 'none'
          itemCount.style.display = isCollapsed ? 'none' : 'inline'
          closingContainer.style.display = isCollapsed ? 'none' : 'block'

          if (isCollapsed) {
            // 在折叠状态下，将结束括号添加到行内
            const inlineClosing = closeBracket.cloneNode(true) as HTMLElement
            lineContent.appendChild(inlineClosing)
          } else {
            // 在展开状态下，移除行内的结束括号
            const inlineClosing = lineContent.querySelector(`.${styles.bracket}:last-child`)
            if (inlineClosing && inlineClosing !== openBracket) {
              lineContent.removeChild(inlineClosing)
            }
          }
        })

        wrapper.appendChild(lineContent)
        wrapper.appendChild(childrenContainer)
        container.appendChild(wrapper)
        container.appendChild(closingContainer)
      } else {
        // 空数组/对象的处理
        const closeBracket = document.createElement('span')
        closeBracket.className = styles.bracket
        closeBracket.textContent = isArray ? ']' : '}'
        lineContent.appendChild(closeBracket)
        if (!isLast) {
          lineContent.appendChild(createComma())
        }
        wrapper.appendChild(lineContent)
        container.appendChild(wrapper)
      }
      break

    case 'string':
      const stringSpan = document.createElement('span')
      stringSpan.className = styles.string
      stringSpan.textContent = `"${value}"`
      container.appendChild(stringSpan)
      if (!isLast) container.appendChild(createComma())
      break

    case 'number':
      const numberSpan = document.createElement('span')
      numberSpan.className = styles.number
      numberSpan.textContent = value.toString()
      container.appendChild(numberSpan)
      if (!isLast) container.appendChild(createComma())
      break

    case 'boolean':
      const booleanSpan = document.createElement('span')
      booleanSpan.className = styles.boolean
      booleanSpan.textContent = value.toString()
      container.appendChild(booleanSpan)
      if (!isLast) container.appendChild(createComma())
      break
  }

  return container
}

function createComma() {
  const comma = document.createElement('span')
  comma.textContent = ','
  comma.className = 'json-comma'
  return comma
}

// 添加样式到 head
function addStyles() {
  const styleEl = document.createElement('style')
  styleEl.textContent = `
    .json-tree-collapsible {
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-left: 15px;
    }

    .json-tree-collapsible::before {
      content: '▼';
      position: absolute;
      left: 0;
      top: 3px;
      display: inline-block;
      transition: transform 0.3s;
      font-size: 10px;
      width: 10px;
      color: #6b7280;
    }

    .json-tree-collapsible.collapsed::before {
      transform: rotate(-90deg);
    }

    .line-content {
      display: inline-block;
      white-space: nowrap;
    }

    .json-tree-indent {
      margin-left: 20px;
      position: relative;
      padding-left: 10px;
      border-left: 1px solid #e5e7eb;
    }

    .dark .json-tree-indent {
      border-left-color: #374151;
    }

    .json-tree-indent.hidden {
      display: none;
    }

    .closing-line {
      display: block;
      padding-left: 15px;
    }

    .json-tree-collapsible.collapsed + .closing-line {
      display: none;
    }

    .child-wrapper {
      position: relative;
      padding-left: 0;
    }

    .json-tree-key { color: #7c3aed; font-weight: 500; }
    .json-tree-string { color: #059669; }
    .json-tree-number { color: #dc2626; }
    .json-tree-boolean { color: #2563eb; }
    .json-tree-null { color: #6b7280; font-style: italic; }
    .json-tree-bracket { color: #374151; font-weight: bold; }
    .json-tree-item-count { color: #6b7280; font-size: 0.875rem; }
    .json-tree-preview { color: #6b7280; }
    .json-comma { color: #374151; }

    .dark .json-tree-key { color: #a78bfa; }
    .dark .json-tree-string { color: #34d399; }
    .dark .json-tree-number { color: #f87171; }
    .dark .json-tree-boolean { color: #60a5fa; }
    .dark .json-tree-null { color: #9ca3af; }
    .dark .json-tree-bracket { color: #d1d5db; }
    .dark .json-tree-item-count { color: #9ca3af; }
    .dark .json-tree-preview { color: #9ca3af; }
    .dark .json-comma { color: #d1d5db; }
  `
  document.head.appendChild(styleEl)
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// 动画
onMounted(() => {
  addStyles()

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)

  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :class="{ 'fullscreen-container': isFullscreen }" class="tool-container min-h-screen p-6">
    <div :class="{ 'fullscreen-content': isFullscreen }" class="max-w-7xl mx-auto">


      <!-- 头部 -->
      <div :class="isFullscreen ? 'mb-4' : 'mb-8'">
        <div class="flex items-center justify-between">
          <div>
            <h1 :class="isFullscreen ? 'text-2xl' : 'text-4xl'" class="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              JSON 格式化工具
            </h1>
            <p v-if="!isFullscreen" class="text-gray-600 dark:text-gray-300 text-lg">
              格式化、压缩、验证和树形显示JSON数据，支持语法高亮和错误提示
            </p>
          </div>
          <div v-if="isFullscreen" class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mr-2">ESC</kbd>
            退出全屏
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div :class="isFullscreen ? 'p-4' : 'p-6'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-6">
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <Button @click="formatJson" variant="primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            格式化
          </Button>

          <Button @click="minifyJson" variant="secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            压缩
          </Button>

          <Button @click="validateJson" variant="info">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            验证
          </Button>

          <Button variant="ghost" @click="escapeJson">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            转义
          </Button>

          <Button variant="ghost" @click="unescapeJson">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 15l-3-3 3-3m-5 0H8m9 14H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            去除转义
          </Button>

          <Button @click="loadExample" variant="ghost">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            示例
          </Button>

          <Button @click="clearAll" variant="danger">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            清空
          </Button>

          <Button variant="ghost" @click="toggleFullscreen">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="isFullscreen" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              <path v-else d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </Button>
        </div>

        <!-- 设置区域 -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              缩进空格数：
            </label>
            <select
              v-model="indentSize"
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option :value="2">2</option>
              <option :value="4">4</option>
              <option :value="8">8</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              显示模式：
            </label>
            <div class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                :class="displayMode === 'formatted' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-3 py-1 text-sm transition-colors"
                @click="showFormattedView"
              >
                格式化
              </button>
              <button
                :class="displayMode === 'tree' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-3 py-1 text-sm transition-colors"
                @click="showTreeView"
              >
                树形视图
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div :class="{ 'fullscreen-grid': isFullscreen }" class="grid lg:grid-cols-2 gap-6">
        <!-- 输入区域 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              输入JSON
            </h3>
          </div>
          <div class="p-6">
            <TextArea
              v-model="inputJson"
              placeholder="在此输入或粘贴JSON数据..."
              :class="isFullscreen ? 'fullscreen-textarea' : ''"
              :rows="isFullscreen ? 32 : 20"
              class="font-mono text-sm"
            />

            <!-- 错误提示 -->
            <div v-if="!isValid && errorMessage" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-red-800 dark:text-red-200">JSON 格式错误</h4>
                  <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ displayMode === 'tree' ? '树形视图' : '格式化结果' }}
            </h3>
            <Button
              v-if="outputJson || (outputContainer && outputContainer.innerHTML)"
              @click="copyToClipboard"
              size="sm"
              variant="ghost"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              复制
            </Button>
          </div>
          <div class="p-6">
            <!-- 格式化文本输出 -->
            <TextArea
              v-if="displayMode === 'formatted'"
              v-model="outputJson"
              placeholder="格式化后的JSON将显示在这里..."
              :class="isFullscreen ? 'fullscreen-textarea' : ''"
              :rows="isFullscreen ? 32 : 20"
              readonly
              class="font-mono text-sm bg-gray-50 dark:bg-gray-900"
            />

            <!-- 树形视图输出 -->
            <div
              v-else
              ref="outputContainer"
              :class="isFullscreen ? 'fullscreen-tree-container' : 'h-80'"
              class="font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4 overflow-auto"
            ></div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div v-if="!isFullscreen" class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">基础功能：</h4>
            <ul class="space-y-1">
              <li>• 智能JSON格式化与美化</li>
              <li>• JSON数据压缩与验证</li>
              <li>• 实时语法验证和错误提示</li>
              <li>• 一键复制结果到剪贴板</li>
              <li>• 全屏模式支持</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">高级功能：</h4>
            <ul class="space-y-1">
              <li>• 交互式树形视图显示</li>
              <li>• 可折叠/展开的JSON结构</li>
              <li>• JSON字符串转义/去转义</li>
              <li>• 语法高亮和类型区分</li>
              <li>• 自定义缩进空格数</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">操作提示：</h4>
            <ul class="space-y-1">
              <li>• 点击树形视图中的节点可折叠</li>
              <li>• 支持大文件JSON处理</li>
              <li>• 实时错误定位和提示</li>
              <li>• 切换显示模式查看不同效果</li>
              <li>• 使用示例快速开始</li>
            </ul>
          </div>
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

.fullscreen-container {
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
  margin: 0;
  max-width: none;
  overflow-y: auto;
  animation: fadeInFullscreen 0.3s ease-out;
}

.dark .fullscreen-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

@keyframes fadeInFullscreen {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fullscreen-content {
  max-width: none;
  min-height: calc(100vh - 7rem);
  display: flex;
  flex-direction: column;
}

.fullscreen-grid {
  flex: 1;
  min-height: 0;
  height: calc(100vh - 260px);
}

.fullscreen-grid > div {
  height: 100%;
}

.fullscreen-textarea {
  height: calc(100vh - 360px) !important;
  min-height: 400px;
}

.fullscreen-tree-container {
  height: calc(100vh - 360px);
  min-height: 400px;
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



/* 确保树形视图中的样式优先级 */
:deep(.json-tree-collapsible) {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-left: 15px;
}

:deep(.json-tree-collapsible::before) {
  content: '▼';
  position: absolute;
  left: 0;
  top: 3px;
  display: inline-block;
  transition: transform 0.3s;
  font-size: 10px;
  width: 10px;
  color: #6b7280;
}

:deep(.json-tree-collapsible.collapsed::before) {
  transform: rotate(-90deg);
}
</style>
