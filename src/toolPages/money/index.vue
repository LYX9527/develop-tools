<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

const message = useMessage()
const inputAmount = ref('')
const outputAmount = ref('')

// 数字对应的中文
const numMap = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const unitMap = ['', '拾', '佰', '仟']
const sectionMap = ['', '万', '亿', '万亿']

function convertToChinese() {
  if (!inputAmount.value.trim()) {
    message.warning('请输入金额')
    return
  }

  try {
    // 检查输入格式
    const amount = parseFloat(inputAmount.value)
    if (isNaN(amount)) {
      message.error('请输入有效的金额')
      return
    }
    if (amount > 999999999999.99) {
      message.error('金额超出范围(最大支持13位数)')
      return
    }
    if (amount < 0) {
      message.error('金额不能为负数')
      return
    }

    // 将数字转换为字符串，并固定两位小数
    const numStr = amount.toFixed(2)
    const parts = numStr.split('.')
    const intPart = parts[0]
    const decPart = parts[1]

    // 转换整数部分
    let intResult = convertIntegerPart(intPart)

    // 转换小数部分
    const decResult = decPart[0] === '0' && decPart[1] === '0'
      ? '整'
      : `${numMap[parseInt(decPart[0])]}角${decPart[1] === '0' ? '' : numMap[parseInt(decPart[1])] + '分'}`

    outputAmount.value = `${intResult}圆${decResult}`
  } catch (error) {
    message.error('转换失败')
    console.error(error)
  }
}

function convertIntegerPart(intStr: string): string {
  if (intStr === '0') return '零'

  let result = ''
  let sectionIndex = 0

  // 从后向前每4位分段处理
  while (intStr.length > 0) {
    const section = intStr.slice(-4)
    intStr = intStr.slice(0, -4)

    // 处理每一个段
    let sectionResult = convertSection(section)

    // 添加单位（万、亿等）
    if (sectionResult && sectionIndex > 0) {
      sectionResult += sectionMap[sectionIndex]
    }

    // 拼接结果
    result = sectionResult + result
    sectionIndex++
  }

  // 清理连续的零
  result = result.replace(/零+/g, '零').replace(/零+$/, '')

  return result || '零'
}

function convertSection(section: string): string {
  let result = ''
  const len = section.length

  for (let i = 0; i < len; i++) {
    const num = parseInt(section[i])
    if (num === 0) {
      if (i === len - 1 || result.endsWith('零')) continue
      result += '零'
    } else {
      result += numMap[num] + unitMap[len - 1 - i]
    }
  }

  return result
}

function copyResult() {
  if (!outputAmount.value) {
    message.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(outputAmount.value)
    .then(() => message.success('复制成功'))
    .catch(() => message.error('复制失败'))
}

function clearInput() {
  inputAmount.value = ''
  outputAmount.value = ''
}
</script>

<template>
  <div class="money-tool">
    <div class="convert-section">
      <div class="input-group">
        <div class="input-header">
          <span class="section-title">输入金额:</span>
          <n-button size="small" @click="clearInput">清空</n-button>
        </div>

        <glass-morphism-input
          v-model="inputAmount"
          placeholder="请输入数字金额（最多支持13位数）"
          @button-click="convertToChinese"
          button-text="转换"
          suffix-button
        />
      </div>


      <div class="output-group">
        <div class="output-header">
          <span class="section-title">转换结果:</span>
          <n-button size="small" @click="copyResult">复制</n-button>
        </div>
        <div class="output-content" v-if="outputAmount">
          {{ outputAmount }}
        </div>
        <div class="empty-hint" v-else>
          转换结果将显示在这里
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.money-tool {
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
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .output-content {
      padding: 16px;
      background: var(--n-color);
      border-radius: 4px;
      border: 1px solid var(--n-border-color);
      color: var(--n-text-color);
      font-size: 16px;
      min-height: 56px;
      display: flex;
      align-items: center;
    }

    .empty-hint {
      padding: 16px;
      background: var(--n-color);
      border-radius: 4px;
      border: 1px solid var(--n-border-color);
      color: var(--n-text-color-3);
      font-size: 14px;
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
