<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NTabs, NTabPane, useMessage } from 'naive-ui'

const message = useMessage()
const activeTab = ref('base64')

// Base64 相关
const base64Input = ref('')
const base64Output = ref('')

function base64Encode() {
  try {
    base64Output.value = btoa(base64Input.value)
  } catch (e) {
    message.error('Base64编码失败')
  }
}

function base64Decode() {
  try {
    base64Output.value = atob(base64Input.value)
  } catch (e) {
    message.error('Base64解码失败')
  }
}

// URL 相关
const urlInput = ref('')
const urlOutput = ref('')

function urlEncode() {
  try {
    urlOutput.value = encodeURIComponent(urlInput.value)
  } catch (e) {
    message.error('URL编码失败')
  }
}

function urlDecode() {
  try {
    urlOutput.value = decodeURIComponent(urlInput.value)
  } catch (e) {
    message.error('URL解码失败')
  }
}

// JWT 相关
const jwtInput = ref('')
const jwtOutput = ref('')

function parseJWT() {
  try {
    const parts = jwtInput.value.trim().split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    jwtOutput.value = JSON.stringify({
      header,
      payload
    }, null, 2)
  } catch (e) {
    message.error('JWT解析失败')
  }
}

// 复制结果
function copyResult(text: string) {
  if (!text) {
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(text)
    .then(() => message.success('复制成功'))
    .catch(() => message.error('复制失败'))
}

// 清空输入
function clearInput() {
  switch (activeTab.value) {
    case 'base64':
      base64Input.value = ''
      base64Output.value = ''
      break
    case 'url':
      urlInput.value = ''
      urlOutput.value = ''
      break
    case 'jwt':
      jwtInput.value = ''
      jwtOutput.value = ''
      break
  }
}
</script>

<template>
  <div class="code-tool">
    <NTabs v-model:value="activeTab" type="line" animated>
      <NTabPane name="base64" tab="Base64">
        <div class="convert-section">
          <div class="input-group">
            <div class="input-header">
              <span class="section-title">输入:</span>
              <NButton size="small" @click="clearInput">清空</NButton>
            </div>
            <NInput
                v-model:value="base64Input"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 10 }"
                placeholder="请输入要转换的文本..."
            />
          </div>

          <div class="action-buttons">
            <NButton @click="base64Encode">编码</NButton>
            <NButton @click="base64Decode">解码</NButton>
          </div>

          <div class="output-group">
            <div class="output-header">
              <span class="section-title">输出:</span>
              <NButton size="small" @click="copyResult(base64Output)">复制</NButton>
            </div>
            <NInput
                v-model:value="base64Output"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 10 }"
                readonly
            />
          </div>
        </div>
      </NTabPane>

      <NTabPane name="url" tab="URL">
        <div class="convert-section">
          <div class="input-group">
            <div class="input-header">
              <span class="section-title">输入:</span>
              <NButton size="small" @click="clearInput">清空</NButton>
            </div>
            <NInput
                v-model:value="urlInput"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 10 }"
                placeholder="请输入要转换的URL..."
            />
          </div>

          <div class="action-buttons">
            <NButton @click="urlEncode">编码</NButton>
            <NButton @click="urlDecode">解码</NButton>
          </div>

          <div class="output-group">
            <div class="output-header">
              <span class="section-title">输出:</span>
              <NButton size="small" @click="copyResult(urlOutput)">复制</NButton>
            </div>
            <NInput
                v-model:value="urlOutput"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 10 }"
                readonly
            />
          </div>
        </div>
      </NTabPane>

      <NTabPane name="jwt" tab="JWT">
        <div class="convert-section">
          <div class="input-group">
            <div class="input-header">
              <span class="section-title">输入:</span>
              <NButton size="small" @click="clearInput">清空</NButton>
            </div>
            <NInput
                v-model:value="jwtInput"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 10 }"
                placeholder="请输入JWT令牌..."
            />
          </div>

          <div class="action-buttons">
            <NButton @click="parseJWT">解析</NButton>
          </div>

          <div class="output-group">
            <div class="output-header">
              <span class="section-title">输出:</span>
              <NButton size="small" @click="copyResult(jwtOutput)">复制</NButton>
            </div>
            <NInput
                v-model:value="jwtOutput"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 10 }"
                readonly
            />
          </div>
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.code-tool {
  padding: 20px;

  .convert-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .input-group,
    .output-group {
      .input-header,
      .output-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .section-title {
          font-size: 14px;
          color: var(--n-text-color-3);
        }
      }

      :deep(.n-input) {
        .n-input__textarea-el {
          font-family: 'Fira Code', monospace;
        }
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }
}
</style> 