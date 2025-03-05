<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import MacCodeBlock from '@/components/MacCodeBlock.vue'

const message = useMessage()
let ws: WebSocket | null = null

// 状态变量
const wsUrl = ref('')
const isConnected = ref(false)
const messageInput = ref('')
const messages = ref<{ type: 'sent' | 'received' | 'error' | 'warn' | 'success'; content: string; time: string }[]>([])
const urlHint = ref('')

// 监听URL输入变化
function handleUrlInput() {
  const url = wsUrl.value.trim()
  if (!url) {
    urlHint.value = ''
    return
  }

  // 检查协议
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    const isPageSecure = window.location.protocol === 'https:'
    if (isPageSecure) {
      urlHint.value = '当前是HTTPS页面，建议使用WSS协议'
    } else {
      urlHint.value = ''
    }
  } else {
    urlHint.value = ''
  }
}

// 连接 WebSocket
function connectWebSocket() {
  if (ws) {
    message.warning('已经建立连接')
    return
  }

  try {
    let url = wsUrl.value
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      url = protocol + url
      wsUrl.value = url
    }

    ws = new WebSocket(url)

    ws.onopen = function() {
      isConnected.value = true
      appendMessage('WebSocket 连接已建立', 'success')
    }

    ws.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data)
        appendMessage(`收到消息: ${JSON.stringify(data, null, 2)}`, 'received')
      } catch {
        appendMessage(`收到消息: ${event.data}`, 'received')
      }
    }

    ws.onclose = function() {
      resetConnectionState()
      appendMessage('WebSocket 连接已关闭', 'warn')
    }

    ws.onerror = function() {
      resetConnectionState()
      appendMessage('WebSocket 连接错误', 'error')
    }
  } catch (error) {
    appendMessage(`连接失败: ${(error as Error).message}`, 'error')
    resetConnectionState()
  }
}

// 断开连接
function disconnectWebSocket() {
  if (ws) {
    ws.close()
  }
}

// 发送消息
function sendMessage() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    appendMessage('请先连接WebSocket', 'received')
    return
  }

  if (messageInput.value.trim()) {
    ws.send(messageInput.value)
    appendMessage(`发送消息: ${messageInput.value}`, 'sent')
    messageInput.value = ''
  }
}

// 添加消息到列表
function appendMessage(content: string, type: 'sent' | 'received' | 'error' | 'warn' | 'success') {
  messages.value.push({
    type,
    content,
    time: new Date().toLocaleTimeString()
  })
  // 滚动到底部
  setTimeout(() => {
    const messageArea = document.getElementById('messageArea')
    if (messageArea) {
      messageArea.scrollTop = messageArea.scrollHeight
    }
  }, 0)
}

// 重置连接状态
function resetConnectionState() {
  isConnected.value = false
  ws = null
}

// 在页面加载时设置默认 URL
function setDefaultUrl() {
  const defaultHost = 'localhost:8080/ws'
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  wsUrl.value = protocol + defaultHost
}

onMounted(() => {
  setDefaultUrl()
})
</script>

<template>
  <div class="websocket-tool">
    <div class="status-bar">
      <div class="connection-settings">
        <n-input
            v-model:value="wsUrl"
            :disabled="isConnected"
            placeholder="输入 WebSocket 地址"
            @input="handleUrlInput"
        />
        <div v-if="urlHint" class="url-hint">{{ urlHint }}</div>
      </div>
      <div class="button-group">
        <n-button
            type="primary"
            :disabled="isConnected"
            @click="connectWebSocket"
        >
          连接
        </n-button>
        <n-button
            type="error"
            :disabled="!isConnected"
            @click="disconnectWebSocket"
        >
          断开
        </n-button>
      </div>
      <div class="status-indicator" :class="{ connected: isConnected }">
        {{ isConnected ? '已连接' : '未连接' }}
      </div>
    </div>

    <div id="messageArea" class="message-area custom-scrollbar">
      <div v-for="(msg, index) in messages"
           :key="index"
           class="message"
           :class="[
             msg.type,
             { 'json-message': msg.content.includes('{') }
           ]"
      >
        <span class="time">{{ msg.time }}</span>
        <div class="content" v-if="msg.content.includes('{')">
          <MacCodeBlock :code="msg.content" language="json" />
        </div>
        <span class="content" v-else>{{ msg.content }}</span>
      </div>
    </div>

    <div class="input-area">
      <n-input
          v-model:value="messageInput"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="输入要发送的消息..."
          @keyup.enter.prevent="sendMessage"
      />
      <n-button
          type="primary"
          :disabled="!isConnected"
          @click="sendMessage"
      >
        发送
      </n-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.websocket-tool {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 240px);
  gap: 20px;
  background: var(--n-color);
  position: relative;
  box-sizing: border-box;

  .status-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
    backdrop-filter: blur(10px);

    .connection-settings {
      flex: 1;
      position: relative;

      .url-hint {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        font-size: 12px;
        color: var(--n-warning-color);
      }
    }

    .button-group {
      display: flex;
      gap: 8px;
    }

    .status-indicator {
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 500;
      background: var(--n-error-color);
      color: white;

      &.connected {
        background: var(--n-success-color);
      }
    }
  }

  .message-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;
    margin-bottom: 100px;
    background: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
    backdrop-filter: blur(10px);

    .message {
      padding: 6px 10px;
      border-radius: 6px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
      transition: all 0.3s ease;

      & + .message {
        margin-top: 2px;
      }

      &.sent {
        background: var(--primary-color-suppl);
        margin-left: 15%;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
      }

      &.received {
        background: var(--color);
        margin-right: 15%;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
      }

      &.error {
        background: var(--error-color-suppl);
        border-left: 3px solid var(--error-color);
      }

      &.warn {
        background: var(--warning-color-suppl);
        border-left: 3px solid var(--warning-color);
      }

      &.success {
        background: var(--success-color-suppl);
        border-left: 3px solid var(--success-color);
      }

      &.json-message {
        .content {
          width: 100%;
        }
      }

      .time {
        color: var(--n-text-color-3);
        font-size: 12px;
        white-space: nowrap;
        opacity: 0.7;
      }

      .content {
        word-break: break-word;
        font-family: 'Fira Code', monospace;
        font-size: 13px;
      }

      &:hover {
        transform: translateX(2px);
        .time {
          opacity: 1;
        }
      }
    }
  }

  // 自定义滚动条
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--n-scrollbar-color);
      border-radius: 3px;

      &:hover {
        background: var(--n-scrollbar-color-hover);
      }
    }
  }

  .input-area {
    position: fixed;
    bottom: 20px;
    left: 40px;
    right: 40px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 20px;
    background: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
    backdrop-filter: blur(10px);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;

    :deep(.n-input) {
      flex: 1;

      .n-input__textarea-el {
        font-family: 'Fira Code', monospace;
        font-size: 13px;
      }
    }

    .n-button {
      align-self: stretch;
      display: flex;
      align-items: center;
    }
  }
}
</style>
