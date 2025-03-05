<script setup lang="ts">
import {ref} from 'vue'
import {useMessage} from 'naive-ui'
// @ts-ignore
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
// @ts-ignore
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'

// 配置 VMdEditor
VMdPreview.use(githubTheme, {
  Hljs: hljs,
})

const message = useMessage()
const url = ref('')
const summary = ref('')
const isLoading = ref(false)
const loadingMessages = [
  '正在阅读页面内容...',
  '正在理解上下文...',
  '正在提取关键信息...',
  '正在组织语言...',
  '马上就好...'
]
const currentLoadingMessage = ref(loadingMessages[0])
let messageInterval: number

// 开始加载动画
function startLoadingAnimation() {
  let index = 0
  messageInterval = window.setInterval(() => {
    index = (index + 1) % loadingMessages.length
    currentLoadingMessage.value = loadingMessages[index]
  }, 2000)
}

// 停止加载动画
function stopLoadingAnimation() {
  clearInterval(messageInterval)
}

// 获取页面总结
async function getSummary() {
  if (!url.value) {
    message.warning('请输入要总结的页面地址')
    return
  }

  try {
    isLoading.value = true
    startLoadingAnimation()

    const response = await fetch('https://r.jina.ai/' + encodeURIComponent(url.value), {
      headers: {
        'Authorization': 'Bearer jina_40908bcd77f547c98782e87615d75640j3U77nRok0rM7I0LfIsrQVv3tm8B'
      }
    })

    if (!response.ok) {
      throw new Error('获取总结失败')
    }

    // 直接获取文本内容而不是 JSON
    summary.value = await response.text()
  } catch (error) {
    message.error('获取总结失败：' + (error as Error).message)
    summary.value = ''
  } finally {
    isLoading.value = false
    stopLoadingAnimation()
  }
}

// 复制总结内容
function copySummary() {
  if (!summary.value) return

  navigator.clipboard.writeText(summary.value).then(() => {
    message.success('已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}
</script>

<template>
  <div class="container">
    <div class="input-section">
      <div class="input-group">
        <n-input
            v-model:value="url"
            type="text"
            placeholder="输入要总结的页面地址"
            @keyup.enter="getSummary"
        />
        <n-button
            type="primary"
            :disabled="isLoading"
            @click="getSummary"
            :loading="isLoading"
        >
          总结
        </n-button>
      </div>
    </div>

    <div class="result-section">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-animation">
          <div class="brain">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor"
                    d="M13,3V7H17V3H13M5,3V7H9V3H5M13,11V15H17V11H13M5,11V15H9V11H5M4,19A1,1 0 0,0 5,20H9V16H5V19M13,19V20H17A1,1 0 0,0 18,19V16H13V19Z"/>
            </svg>
          </div>
          <p class="loading-text">{{ currentLoadingMessage }}</p>
        </div>
      </div>

      <template v-else-if="summary">
        <div class="summary-header">
          <h3>总结结果</h3>
          <n-button size="small" @click="copySummary">
            复制
          </n-button>
        </div>
        <div class="markdown-wrapper">
          <v-md-preview :text="summary"/>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background: var(--n-color);
  border-radius: 12px;
  box-shadow: 0 2px 10px var(--n-box-shadow);
  height: calc(100vh - 300px); // 减去上下padding
  display: flex;
  flex-direction: column;
}

.input-section {
  flex-shrink: 0;
  margin-bottom: 20px;

  .input-group {
    display: flex;
    gap: 12px;
    align-items: center;

    .n-input {
      flex: 1;
    }

    .n-button {
      white-space: nowrap;
    }
  }
}

.result-section {
  flex: 1;
  min-height: 0; // 重要：允许内容收缩
  background: var(--n-color-modal);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-animation {
  text-align: center;

  .brain {
    color: var(--n-primary-color);
    animation: pulse 2s infinite;
    margin-bottom: 20px;

    svg {
      filter: drop-shadow(0 0 8px var(--n-primary-color));
    }
  }

  .loading-text {
    color: var(--n-text-color);
    font-size: var(--n-font-size);
    animation: fadeInOut 2s infinite;
  }
}

.summary-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    color: var(--n-text-color);
    margin: 0;
  }
}

.markdown-wrapper {
  flex: 1;
  overflow-y: auto;
  margin: 0 -20px;
  padding: 0 20px;

  :deep(.github-markdown-body) {
    background: transparent !important;
    color: var(--n-text-color) !important;
  }

  :deep(pre) {
    background: var(--body-color) !important;
    border-radius: 0 !important;
  }

  :deep(code) {
    color: var(--text-color-3) !important;
    //background: var(--color) !important;
  }

  :deep(blockquote) {
    border-left-color: var(--n-primary-color) !important;
    background: var(--n-color) !important;
    color: var(--n-text-color-3) !important;
  }

  :deep(table) {
    tr {
      background: transparent !important;

      &:nth-child(2n) {
        background: var(--n-color) !important;
      }
    }

    th, td {
      border-color: var(--n-border-color) !important;
    }
  }

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--n-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--n-border-color);
    border-radius: 4px;

    &:hover {
      background: var(--n-text-color-3);
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
}
</style>
