<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useMessage} from 'naive-ui'

const message = useMessage()

// JSON内容
const jsonInput = ref('')
const outputContainer = ref<HTMLDivElement | null>(null)
const errorMsg = ref('')
const isFullscreen = ref(false)

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
function formatJSON() {
  try {
    const input = jsonInput.value
    if (!input.trim()) {
      showError('请输入JSON内容')
      return
    }
    const jsonObj = JSON.parse(input)
    displayJSONTree(jsonObj)
    errorMsg.value = ''
  } catch (e: any) {
    showError('无效的JSON格式: ' + e.message)
  }
}

// 压缩JSON
function compressJSON() {
  try {
    const input = jsonInput.value
    if (!input.trim()) {
      showError('请输入JSON内容')
      return
    }
    const jsonObj = JSON.parse(input)
    const compressed = JSON.stringify(jsonObj)
    if (outputContainer.value) {
      outputContainer.value.textContent = compressed
      outputContainer.value.className = 'editor json-tree compressed'
    }
    errorMsg.value = ''
  } catch (e: any) {
    showError('无效的JSON格式: ' + e.message)
  }
}

// 转义JSON
function escapeJSON() {
  const input = jsonInput.value
  if (!input.trim()) {
    showError('请输入内容')
    return
  }
  const escaped = input.replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
  if (outputContainer.value) {
    outputContainer.value.textContent = escaped
  }
  errorMsg.value = ''
}

// 去除转义
function unescapeJSON() {
  const input = jsonInput.value
  if (!input.trim()) {
    showError('请输入内容')
    return
  }
  try {
    const unescaped = JSON.parse(`"${input}"`)
    if (outputContainer.value) {
      outputContainer.value.textContent = unescaped
    }
    errorMsg.value = ''
  } catch (e: any) {
    showError('解析转义字符时出错: ' + e.message)
  }
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
        itemCount.textContent = `${entries.length} 项`
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
            const inlineClosing = closeBracket.cloneNode(true)
            lineContent.appendChild(inlineClosing)
          } else {
            // 在展开状态下，移除行内的结束括号
            const inlineClosing = lineContent.querySelector(`.${styles.bracket}:last-child`)
            if (inlineClosing) {
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
        if (!isLast) {
          closeBracket.appendChild(createComma())
        }
        lineContent.appendChild(closeBracket)
        wrapper.appendChild(lineContent)
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
      numberSpan.textContent = value
      container.appendChild(numberSpan)
      if (!isLast) container.appendChild(createComma())
      break

    case 'boolean':
      const booleanSpan = document.createElement('span')
      booleanSpan.className = styles.boolean
      booleanSpan.textContent = value
      container.appendChild(booleanSpan)
      if (!isLast) container.appendChild(createComma())
      break
  }

  return container
}

function createComma() {
  const comma = document.createElement('span')
  comma.textContent = ','
  return comma
}

// 复制结果
function copyResult() {
  if (!outputContainer.value) return

  try {
    // 创建临时容器
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = outputContainer.value.innerHTML

    // 移除所有折叠指示器
    tempContainer.querySelectorAll('.json-tree-collapsible::before').forEach(el => el.remove())

    // 移除所有项目计数提示
    tempContainer.querySelectorAll('.json-tree-item-count').forEach(el => el.remove())

    // 移除所有预览内容
    tempContainer.querySelectorAll('.json-tree-preview').forEach(el => el.remove())

    // 移除所有换行和多余空格
    const text = tempContainer.textContent || ''
    const jsonObj = JSON.parse(text)
    const formattedText = JSON.stringify(jsonObj, null, 2)

    navigator.clipboard.writeText(formattedText)
      .then(() => message.success('已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制'))
  } catch (e) {
    message.error('复制失败，内容格式有误')
  }
}

// 清空所有
function clearAll() {
  jsonInput.value = ''
  if (outputContainer.value) {
    outputContainer.value.innerHTML = ''
  }
  errorMsg.value = ''
}

// 显示错误信息
function showError(msg: string) {
  errorMsg.value = msg
}

// 切换全屏
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
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
  `
  document.head.appendChild(styleEl)
}

// 在组件挂载时添加样式
onMounted(() => {
  addStyles()

  const exampleJSON = {
    "name": "JSON格式化工具",
    "version": "1.0.0",
    "features": ["格式化", "压缩", "转义"],
    "settings": {
      "theme": "light",
      "autoFormat": true,
      "indentSize": 4
    },
    "isActive": true,
    "lastUpdate": null
  }
  jsonInput.value = JSON.stringify(exampleJSON)
  formatJSON()

  // 添加输入框自动格式化功能
  let formatTimer: number
  const input = document.querySelector('.json-input') as HTMLTextAreaElement
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(formatTimer)
      formatTimer = window.setTimeout(() => {
        try {
          const input = jsonInput.value.trim()
          if (input) {
            JSON.parse(input)
            formatJSON()
          }
        } catch (e) {
          // 解析失败时不执行格式化
        }
      }, 500)
    })
  }
})
</script>

<template>
  <div class="container" :class="{ fullscreen: isFullscreen }">
    <button class="fullscreen-button" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path v-if="isFullscreen"
              d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        <path v-else
              d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    </button>
    <h1>JSON工具</h1>
    <div class="button-group">
      <n-button class="action-button" @click="formatJSON">格式化</n-button>
      <n-button class="action-button" @click="compressJSON">压缩</n-button>
      <n-button class="action-button" @click="escapeJSON">转义</n-button>
      <n-button class="action-button" @click="unescapeJSON">去除转义</n-button>
      <n-button class="action-button" @click="copyResult">复制结果</n-button>
      <n-button class="action-button" @click="clearAll">清空</n-button>
    </div>
    <div class="editor-container">
      <div class="editor-section">
        <div class="editor-label">输入:</div>
        <textarea
            v-model="jsonInput"
            class="editor json-input"
            placeholder="请输入JSON内容..."
        ></textarea>
      </div>
      <div class="editor-section">
        <div class="editor-label">输出:</div>
        <div ref="outputContainer" class="editor json-tree"></div>
      </div>
    </div>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
  </div>
</template>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--n-color-modal);
  padding: 20px;
  color: var(--n-text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--n-color);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px var(--n-box-shadow);
  position: relative;

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--n-text-color);
  }

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: none;
    margin: 0;
    border-radius: 0;
    z-index: 1000;
    padding: 20px;
    background: var(--base-color);

    .editor-container {
      height: calc(100vh - 180px);
    }

    .editor {
      height: 100%;
    }
  }
}

.editor-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 500px;
}

.editor-section {
  flex: 1;
  min-width: 0;
  width: 50%;

  .editor-label {
    font-weight: 500;
    margin-bottom: 10px;
    color: var(--n-text-color);
  }
}

.editor {
  width: 100%;
  height: 500px;
  font-family: monospace;
  padding: 15px;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  resize: none;
  font-size: var(--n-font-size);
  line-height: 1.5;
  background: var(--n-color-modal);
  color: var(--n-text-color);
  overflow-x: auto;
  white-space: pre;
  word-wrap: normal;

  &.compressed {
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .action-button {
    padding: 8px 16px;
    color: var(--color);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s var(--n-bezier);

    &:hover {
      background: var(--n-primary-color-hover);
    }
  }
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--n-color-modal);
  color: var(--n-text-color);
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--n-box-shadow);
  opacity: 0;
  transition: opacity 0.5s var(--n-bezier);
  z-index: 1000;

  &.show {
    opacity: 1;
  }
}

.error {
  color: var(--n-error-color);
  margin-top: 10px;
  font-size: var(--n-font-size-small);
}

.fullscreen-button {
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  transition: all 0.3s var(--n-bezier);

  &:hover {
    background: var(--n-primary-color-hover);
  }
}

// JSON树样式
:deep(.json-tree) {
  .json-tree-key {
    color: var(--n-purple) !important;
  }

  .json-tree-string {
    color: var(--n-blue) !important;
  }

  .json-tree-number {
    color: var(--n-orange) !important;
  }

  .json-tree-boolean {
    color: var(--n-green) !important;
  }

  .json-tree-null {
    color: var(--n-red) !important;
  }

  .json-tree-bracket {
    color: var(--n-text-color-3) !important;
  }

  .json-tree-indent {
    border-left: 1px solid var(--n-divider-color);
  }

  .json-tree-item-count,
  .json-tree-preview,
  .json-tree-collapsible::before {
    color: var(--n-text-color-3);
  }
}
</style>
