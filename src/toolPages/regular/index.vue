<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NCheckbox, useMessage } from 'naive-ui'
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

const message = useMessage()

// 正则表达式输入
const regexInput = ref('')
const testInput = ref('')

// 匹配选项
const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false
})

// 匹配结果
const matchCount = ref(0)
const highlightedText = ref('')

// 常用正则表达式
const commonPatterns = [
  {
    name: '手机号码',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配11位手机号'
  },
  {
    name: '邮箱地址',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: '匹配标准邮箱格式'
  },
  {
    name: '身份证号',
    pattern: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    description: '匹配18位身份证号'
  },
  {
    name: '日期格式(yyyy-mm-dd)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: '匹配yyyy-mm-dd格式日期'
  },
  {
    name: '时间格式(HH:mm:ss)',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$',
    description: '匹配24小时制时间'
  },
  {
    name: 'URL地址',
    pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-\\.,@?^=%&:\\/~\\+#]*$',
    description: '匹配标准URL地址'
  },
  {
    name: 'IPv4地址',
    pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    description: '匹配IPv4地址格式'
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]',
    description: '匹配中文字符'
  }
]

// 测试正则表达式
function testRegex() {
  if (!regexInput.value || !testInput.value) {
    highlightedText.value = ''
    matchCount.value = 0
    return
  }

  try {
    // 构建正则表达式
    let flagStr = ''
    if (flags.value.global) flagStr += 'g'
    if (flags.value.ignoreCase) flagStr += 'i'
    if (flags.value.multiline) flagStr += 'm'

    const regex = new RegExp(regexInput.value, flagStr)

    // 高亮匹配结果
    let matches = []
    let match
    let count = 0

    if (flags.value.global) {
      while ((match = regex.exec(testInput.value)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length
        })
        count++
      }
    } else {
      match = regex.exec(testInput.value)
      if (match) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length
        })
        count = 1
      }
    }

    // 生成高亮文本
    let result = ''
    let lastIndex = 0

    matches.forEach(match => {
      result += testInput.value.substring(lastIndex, match.start)
      result += `<span class="highlight">${testInput.value.substring(match.start, match.end)}</span>`
      lastIndex = match.end
    })

    result += testInput.value.substring(lastIndex)
    highlightedText.value = result
    matchCount.value = count
  } catch (err) {
    highlightedText.value = `<span class="error">正则表达式错误: ${err.message}</span>`
    matchCount.value = 0
  }
}

// 选择正则表达式
function selectPattern(pattern: string) {
  regexInput.value = pattern
  message.success('已选择该正则表达式')
  testRegex()
}

// 复制正则表达式
function copyPattern(pattern: string) {
  navigator.clipboard.writeText(pattern)
    .then(() => message.success('已复制到剪贴板'))
    .catch(() => message.error('复制失败，请手动复制'))
}
</script>

<template>
  <div class="regular-tool">
    <div class="regex-section">
      <div class="input-group">
        <label>正则表达式:</label>
        <glass-morphism-input
            v-model:modelValue="regexInput"
            @update:modelValue="testRegex"
            placeholder="输入正则表达式"
        />
      </div>

      <div class="options">
        <NCheckbox v-model:checked="flags.global" @update:checked="testRegex">
          全局匹配 (g)
        </NCheckbox>
        <NCheckbox v-model:checked="flags.ignoreCase" @update:checked="testRegex">
          忽略大小写 (i)
        </NCheckbox>
        <NCheckbox v-model:checked="flags.multiline" @update:checked="testRegex">
          多行匹配 (m)
        </NCheckbox>
      </div>

      <div class="input-group">
        <label>测试文本:</label>
        <glass-morphism-input
          v-model:modelValue="testInput"
          @update:modelValue="testRegex"
          textarea
          placeholder="输入需要匹配的文本"
        />
      </div>

      <div class="input-group">
        <label>匹配结果:</label>
        <div v-if="matchCount > 0" class="match-count">
          找到 {{ matchCount }} 个匹配
        </div>
        <div class="result-section" v-html="highlightedText"></div>
      </div>

      <h3>常用正则表达式</h3>
      <div class="common-patterns">
        <div v-for="item in commonPatterns" :key="item.name" class="pattern-item">
          <div class="pattern-title">{{ item.name }}</div>
          <div class="pattern-value">{{ item.pattern }}</div>
          <div class="pattern-desc">{{ item.description }}</div>
          <div class="pattern-buttons">
            <NButton size="small" @click="selectPattern(item.pattern)">选择</NButton>
            <NButton size="small" @click="copyPattern(item.pattern)">复制</NButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.regular-tool {
  padding: 20px;

  .regex-section {
    background: var(--n-color);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    .input-group {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--n-text-color);
      }

      .match-count {
        font-size: 14px;
        color: var(--n-text-color-3);
        margin: 8px 0;
      }
    }

    .options {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .result-section {
      min-height: 100px;
      background: var(--n-input-color);
      border-radius: 4px;
      padding: 12px;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      border: 1px solid var(--n-border-color);
      font-size: 14px;
      line-height: 1.6;
      transition: border-color .3s var(--n-bezier);

      &:hover {
        border-color: var(--n-border-hover-color);
      }

      &:empty {
        color: var(--n-text-color-3);
        &::after {
          content: '匹配结果将显示在这里';
        }
      }

      :deep(.highlight) {
        background-color: var(--n-action-color);
        color: var(--n-text-color);
        border-radius: 2px;
        padding: 2px 0;
      }

      :deep(.error) {
        color: var(--n-error-color);
      }
    }

    h3 {
      margin: 30px 0 15px;
      color: var(--n-text-color);
    }

    .common-patterns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;

      .pattern-item {
        background: var(--n-card-color);
        padding: 15px;
        border-radius: 8px;
        border: 1px solid var(--n-border-color);
        display: flex;
        flex-direction: column;
        transition: border-color .3s var(--n-bezier);

        &:hover {
          border-color: var(--n-border-hover-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .pattern-title {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--n-text-color);
        }

        .pattern-value {
          font-family: monospace;
          color: var(--n-text-color-2);
          word-break: break-all;
          margin-bottom: 8px;
          flex: 1;
        }

        .pattern-desc {
          font-size: 12px;
          color: var(--n-text-color-3);
          margin-bottom: 12px;
        }

        .pattern-buttons {
          display: flex;
          gap: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--n-divider-color);
        }
      }
    }
  }
}
</style>
