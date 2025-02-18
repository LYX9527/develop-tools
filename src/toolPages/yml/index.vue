<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, useMessage } from 'naive-ui'
import jsyaml from 'js-yaml'

const message = useMessage()

const jsonContent = ref('')
const yamlContent = ref('')
const jsonError = ref('')
const yamlError = ref('')

// JSON 转 YAML
function jsonToYaml() {
  try {
    const jsonStr = jsonContent.value
    if (!jsonStr.trim()) {
      message.warning('请输入JSON数据')
      return
    }
    const jsonObj = JSON.parse(jsonStr)
    const yamlStr = jsyaml.dump(jsonObj, {
      lineWidth: -1,  // 禁用折行
      noRefs: true,   // 禁用引用
      quotingType: '"' // 使用双引号
    })
    yamlContent.value = yamlStr
    jsonError.value = ''
  } catch (err: any) {
    jsonError.value = '无效的JSON格式: ' + err.message
  }
}

// YAML 转 JSON
function yamlToJson() {
  try {
    const yamlStr = yamlContent.value
    if (!yamlStr.trim()) {
      message.warning('请输入YAML数据')
      return
    }
    const jsonObj = jsyaml.load(yamlStr)
    const jsonStr = JSON.stringify(jsonObj, null, 2)
    jsonContent.value = jsonStr
    yamlError.value = ''
  } catch (err: any) {
    yamlError.value = '无效的YAML格式: ' + err.message
  }
}

// 格式化 JSON
function formatJSON() {
  try {
    const jsonStr = jsonContent.value
    if (!jsonStr.trim()) return
    const jsonObj = JSON.parse(jsonStr)
    jsonContent.value = JSON.stringify(jsonObj, null, 2)
    jsonError.value = ''
  } catch (err: any) {
    jsonError.value = '无效的JSON格式: ' + err.message
  }
}

// 格式化 YAML
function formatYAML() {
  try {
    const yamlStr = yamlContent.value
    if (!yamlStr.trim()) return
    const jsonObj = jsyaml.load(yamlStr)
    yamlContent.value = jsyaml.dump(jsonObj, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"'
    })
    yamlError.value = ''
  } catch (err: any) {
    yamlError.value = '无效的YAML格式: ' + err.message
  }
}

// 复制内容
function copyContent(text: string) {
  if (!text.trim()) {
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(text)
    .then(() => message.success('已复制到剪贴板'))
    .catch(() => message.error('复制失败，请手动复制'))
}

// 清空内容
function clearContent(type: 'json' | 'yaml') {
  if (type === 'json') {
    jsonContent.value = ''
    jsonError.value = ''
  } else {
    yamlContent.value = ''
    yamlError.value = ''
  }
}

// 添加示例数据
const exampleData = {
  name: "配置示例",
  version: "1.0.0",
  description: "这是一个包含多种数据类型的示例配置文件，用于演示JSON和YAML的转换效果。",
  settings: {
    enabled: true,
    timeout: 30,
    items: [
      "第一项配置内容",
      "这是一段较长的配置说明文本",
      "another_config_item"
    ],
    database: {
      host: "localhost",
      port: 5432,
      credentials: {
        username: "admin",
        password: "password123"
      }
    }
  }
}

jsonContent.value = JSON.stringify(exampleData, null, 2)
jsonToYaml()
</script>

<template>
  <div class="yml-tool">
    <div class="editor-container">
      <div class="editor-section">
        <div class="editor-header">
          <span>JSON</span>
          <div class="button-group">
            <NButton size="small" type="primary" @click="formatJSON">格式化</NButton>
            <NButton size="small" @click="copyContent(jsonContent)">复制</NButton>
            <NButton size="small" @click="clearContent('json')">清空</NButton>
          </div>
        </div>
        <NInput
            v-model:value="jsonContent"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 20 }"
            placeholder="请输入JSON"
        />
        <div v-if="jsonError" class="error-text">{{ jsonError }}</div>
      </div>

      <div class="editor-section">
        <div class="editor-header">
          <span>YAML</span>
          <div class="button-group">
            <NButton size="small" type="primary" @click="formatYAML">格式化</NButton>
            <NButton size="small" @click="copyContent(yamlContent)">复制</NButton>
            <NButton size="small" @click="clearContent('yaml')">清空</NButton>
          </div>
        </div>
        <NInput
            v-model:value="yamlContent"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 20 }"
            placeholder="请输入YAML"
        />
        <div v-if="yamlError" class="error-text">{{ yamlError }}</div>
      </div>
    </div>

    <div class="action-group">
      <NButton type="primary" @click="jsonToYaml">JSON → YAML</NButton>
      <NButton type="primary" @click="yamlToJson">YAML → JSON</NButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.yml-tool {
  padding: 20px;

  .editor-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .editor-section {
      flex: 1;
      min-width: 0;

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        span {
          font-size: 16px;
          font-weight: 500;
          color: var(--n-text-color);
        }

        .button-group {
          display: flex;
          gap: 8px;
        }
      }

      :deep(.n-input) {
        .n-input__textarea-el {
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
          background: var(--n-color);
        }
      }
    }
  }

  .action-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .error-text {
    margin-top: 8px;
    color: var(--n-error-color);
    font-size: 12px;
  }
}
</style> 