<template>
  <div class="tool-page">
    <NCard>
      <div class="input-area">
        <div class="section-title">请输入要MD5加密的文本：</div>
        <NInput
          v-model:value="inputText"
          type="textarea"
          placeholder="请输入要加密的内容..."
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </div>

      <div class="result-area">
        <div class="section-title">加密结果：</div>
        <NSpace vertical>
          <NCard size="small" class="result-item" v-for="(item, index) in resultList" :key="index">
            <div class="result-header">
              <span class="result-label">{{ item.label }}</span>
              <NButton size="small" type="primary" ghost @click="copyText(item.value)">
                复制
              </NButton>
            </div>
            <div class="result-content">
              {{ item.value }}
            </div>
          </NCard>
        </NSpace>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'
import { NCard, NInput, NSpace, NButton, useMessage } from 'naive-ui'

const message = useMessage()
const inputText = ref('')

const md5Result = computed(() => {
  if (!inputText.value) return ''
  return CryptoJS.MD5(inputText.value).toString()
})

const resultList = computed(() => [
  {
    label: '32位小写（默认）',
    value: md5Result.value.toLowerCase()
  },
  {
    label: '32位大写',
    value: md5Result.value.toUpperCase()
  },
  {
    label: '16位小写',
    value: md5Result.value.substring(8, 24).toLowerCase()
  },
  {
    label: '16位大写',
    value: md5Result.value.substring(8, 24).toUpperCase()
  }
])

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('复制成功')
  } catch (err) {
    message.error('复制失败')
  }
}
</script>

<style scoped>
.tool-page {
  padding: 20px;
}

.input-area {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color);
  margin-bottom: 12px;
}

.result-item {
  width: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-label {
  font-size: 14px;
  color: var(--n-text-color-2);
}

.result-content {
  font-family: monospace;
  word-break: break-all;
  background: var(--n-card-color);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--n-border-color);
  color: var(--n-text-color);
}
</style>