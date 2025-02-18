<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NSpace, NTabs, NTabPane, useMessage } from 'naive-ui'

const message = useMessage()
const activeTab = ref('convert')
const inputText = ref('')
const outputFormats = ref({
  upper: '',
  lower: '',
  capitalize: '',
  camelCase: '',
  pascalCase: '',
  snakeCase: '',
  kebabCase: '',
  alternating: ''
})

// 转换函数
const transformers = {
  upper: (text: string) => text.toUpperCase(),
  lower: (text: string) => text.toLowerCase(),
  capitalize: (text: string) => {
    return text.replace(/\b\w/g, c => c.toUpperCase())
  },
  camelCase: (text: string) => {
    return text.toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
  },
  pascalCase: (text: string) => {
    return text.toLowerCase()
      .replace(/(^|\s+)([a-z])/g, (_, space, c) => c.toUpperCase())
      .replace(/\s+/g, '')
  },
  snakeCase: (text: string) => {
    return text.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
  },
  kebabCase: (text: string) => {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
  },
  alternating: (text: string) => {
    return text.split('')
      .map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase())
      .join('')
  }
}

// 转换所有格式
function transformAll() {
  if (!inputText.value.trim()) {
    message.warning('请输入要转换的文本')
    return
  }
  
  Object.entries(transformers).forEach(([key, fn]) => {
    outputFormats.value[key as keyof typeof outputFormats.value] = fn(inputText.value)
  })
}

// 复制结果
function copyResult(format: keyof typeof outputFormats.value) {
  const text = outputFormats.value[format]
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
  inputText.value = ''
  Object.keys(outputFormats.value).forEach(key => {
    outputFormats.value[key as keyof typeof outputFormats.value] = ''
  })
}
</script>

<template>
  <div class="case-tool">
    <NTabs v-model:value="activeTab" type="line" animated>
      <NTabPane name="convert" tab="命名转换">
        <div class="input-section">
          <div class="input-header">
            <span class="section-title">输入文本:</span>
            <NSpace>
              <NButton type="primary" @click="transformAll">转换</NButton>
              <NButton type="error" @click="clearInput">清空</NButton>
            </NSpace>
          </div>
          <NInput
              type="textarea"
              v-model:value="inputText"
              :autosize="{ minRows: 3, maxRows: 5 }"
              placeholder="在此输入要转换的文本..."
          />
        </div>

        <div class="format-list">
          <div class="format-item">
            <span class="format-label">大写</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.upper"/>
              <NButton size="small" @click="copyResult('upper')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">小写</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.lower"/>
              <NButton size="small" @click="copyResult('lower')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">首字母大写</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.capitalize"/>
              <NButton size="small" @click="copyResult('capitalize')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">驼峰命名</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.camelCase"/>
              <NButton size="small" @click="copyResult('camelCase')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">帕斯卡命名</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.pascalCase"/>
              <NButton size="small" @click="copyResult('pascalCase')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">下划线命名</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.snakeCase"/>
              <NButton size="small" @click="copyResult('snakeCase')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">连字符命名</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.kebabCase"/>
              <NButton size="small" @click="copyResult('kebabCase')">复制</NButton>
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">交替大小写</span>
            <div class="format-content">
              <NInput readonly :value="outputFormats.alternating"/>
              <NButton size="small" @click="copyResult('alternating')">复制</NButton>
            </div>
          </div>
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.case-tool {
  padding: 20px;

  .input-section {
    background-color: var(--n-card-color);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
    margin-bottom: 20px;

    .input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .section-title {
        font-size: 14px;
        color: var(--n-text-color-3);
      }
    }
  }

  .format-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .format-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background-color: var(--n-color);
      border-radius: 4px;
      border: 1px solid var(--n-border-color);
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--n-color-hover);
      }

      .format-label {
        width: 100px;
        font-size: 14px;
        color: var(--n-text-color-3);
        flex-shrink: 0;
      }

      .format-content {
        flex: 1;
        display: flex;
        gap: 8px;
        align-items: center;

        :deep(.n-input) {
          flex: 1;
          
          .n-input__input-el {
            font-family: 'Fira Code', monospace;
          }
        }
      }
    }
  }
}
</style> 