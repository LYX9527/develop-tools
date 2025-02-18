<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NButton, NSpace, NSelect, useMessage, NSwitch } from 'naive-ui'

const message = useMessage()

// 预设进制选项
const baseOptions = [
  { label: '二进制', value: 2 },
  { label: '八进制', value: 8 },
  { label: '十进制', value: 10 },
  { label: '十六进制', value: 16 }
]

// 输出进制选项
const outputBaseOptions = [
  ...baseOptions,
  { label: '26进制(a-z)', value: 26 },
  { label: '32进制(无易混淆字符)', value: 32 },
  { label: '36进制(0-9,a-z)', value: 36 },
  { label: '52进制(a-z,A-Z)', value: 52 },
  { label: '58进制(无易混淆字符)', value: 58 },
  { label: '62进制(0-9,a-z,A-Z)', value: 62 },
  { label: '64进制(0-9,a-z,A-Z,-_)', value: 64 },
  { label: '自定义', value: 'custom' }
]

const selectedBase = ref(10)
const customBase = ref(2)
const showCustomBase = ref(false)
const inputValue = ref('')
const outputResults = ref<{ base: number | string, value: string }[]>([])

// 字符集定义
const charsets = {
  2: '01',
  8: '01234567',
  10: '0123456789',
  16: '0123456789ABCDEF',
  26: 'abcdefghijklmnopqrstuvwxyz',
  32: '0123456789ABCDEFGHJKLMNPQRSTVWXYZ',
  36: '0123456789abcdefghijklmnopqrstuvwxyz',
  52: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  64: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
}

// 验证输入是否合法
function validateInput(value: string, base: number): boolean {
  if (!value) return true // 空值允许
  const charset = charsets[base] || ''
  if (!charset) return true // 自定义进制不验证
  return value.split('').every(char => charset.includes(char.toLowerCase())) // 忽略大小写
}

// 转换到十进制
function toDecimal(value: string, fromBase: number): number {
  if (fromBase <= 36) {
    return parseInt(value, fromBase)
  }
  
  const charset = charsets[fromBase]
  if (!charset) return NaN
  
  let result = 0
  for (let i = 0; i < value.length; i++) {
    result = result * fromBase + charset.indexOf(value[i])
  }
  return result
}

// 从十进制转换到指定进制
function fromDecimal(value: number, toBase: number): string {
  if (toBase <= 36) {
    return value.toString(toBase).toUpperCase()
  }
  
  const charset = charsets[toBase]
  if (!charset) return ''
  
  let result = ''
  let num = value
  while (num > 0) {
    result = charset[num % toBase] + result
    num = Math.floor(num / toBase)
  }
  return result || '0'
}

// 转换函数
function convert() {
  if (!inputValue.value) {
    outputResults.value = []
    return
  }

  const base = selectedBase.value
  if (!validateInput(inputValue.value, base)) {
    // 不直接报错，而是清除非法字符
    inputValue.value = inputValue.value
      .split('')
      .filter(char => charsets[base].includes(char.toLowerCase()))
      .join('')
    return
  }

  try {
    const decimal = toDecimal(inputValue.value.toLowerCase(), base)
    if (isNaN(decimal)) {
      message.error('转换失败')
      return
    }

    // 获取要显示的进制列表
    const targetBases = [...Object.keys(charsets).map(Number)]
    if (showCustomBase.value && customBase.value >= 2 && customBase.value <= 64) {
      targetBases.push(customBase.value)
    }

    // 生成结果
    outputResults.value = targetBases
      .filter((base, index, self) => self.indexOf(base) === index) // 去重
      .sort((a, b) => a - b) // 排序
      .map(base => ({
        base,
        value: fromDecimal(decimal, base)
      }))
  } catch (error) {
    message.error('转换失败')
  }
}

// 监听输入变化
watch([() => inputValue.value, () => selectedBase.value, () => customBase.value], () => {
  convert()
})

// 监听进制变化，自动过滤非法字符
watch(() => selectedBase.value, (newBase) => {
  if (newBase === 'custom') return
  if (!inputValue.value) return
  
  const charset = charsets[newBase]
  if (!charset) return

  // 过滤掉不在当前进制字符集中的字符
  inputValue.value = inputValue.value
    .split('')
    .filter(char => charset.includes(char.toLowerCase()))
    .join('')
})

// 复制结果
function copyResult(value: string) {
  if (!value) {
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(value)
    .then(() => message.success('复制成功'))
    .catch(() => message.error('复制失败'))
}

// 清空输入
function clearInput() {
  inputValue.value = ''
  outputResults.value = []
}

// 获取进制说明
function getBaseDescription(base: number | string): string {
  const option = outputBaseOptions.find(opt => opt.value === base)
  return option ? option.label : `${base}进制`
}
</script>

<template>
  <div class="scale-tool">
    <div class="input-section">
      <div class="base-selector">
        <span class="section-label">输入进制:</span>
        <NSelect v-model:value="selectedBase" :options="baseOptions" style="width: 200px"/>
      </div>
      
      <div class="input-group">
        <NInput
            v-model:value="inputValue"
            type="text"
            :placeholder="`请输入${getBaseDescription(selectedBase)}数值...`"
        />
        <NButton type="error" @click="clearInput">清空</NButton>
      </div>

      <div class="output-options">
        <span class="section-label">自定义输出进制:</span>
        <div class="custom-base-input">
          <NSwitch v-model:value="showCustomBase"/>
          <NInput
              v-if="showCustomBase"
              v-model:value="customBase"
              type="number"
              :min="2"
              :max="64"
              style="width: 100px"
              placeholder="2-64"
          />
        </div>
      </div>
    </div>

    <div class="format-list">
      <div v-for="result in outputResults" :key="result.base" class="format-item">
        <span class="format-label">{{ getBaseDescription(result.base) }}</span>
        <div class="format-content">
          <NInput readonly :value="result.value"/>
          <NButton size="small" @click="copyResult(result.value)">复制</NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scale-tool {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .input-section {
    background-color: var(--n-card-color);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
    display: flex;
    flex-direction: column;
    gap: 16px;

    .base-selector {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .input-group {
      display: flex;
      gap: 12px;
      align-items: center;

      :deep(.n-input) {
        flex: 1;
      }
    }

    .section-label {
      font-size: 14px;
      color: var(--n-text-color-3);
      width: 100px;
    }

    .output-options {
      display: flex;
      gap: 12px;
      align-items: center;

      .custom-base-input {
        display: flex;
        gap: 12px;
        align-items: center;
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
        width: 200px;
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