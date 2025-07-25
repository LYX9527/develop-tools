<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()
const inputAmount = ref('')
const outputAmount = ref('')

// 数字对应的中文
const numMap = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const unitMap = ['', '拾', '佰', '仟']
const sectionMap = ['', '万', '亿', '万亿']

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

function convertToChinese() {
  if (!inputAmount.value.trim()) {
    toast.warning('请输入金额')
    return
  }

  try {
    // 检查输入格式
    const amount = parseFloat(inputAmount.value)
    if (isNaN(amount)) {
      toast.error('请输入有效的金额')
      return
    }
    if (amount > 999999999999.99) {
      toast.error('金额超出范围(最大支持13位数)')
      return
    }
    if (amount < 0) {
      toast.error('金额不能为负数')
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
    toast.success('转换成功')
  } catch (error) {
    toast.error('转换失败')
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
    toast.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(outputAmount.value)
    .then(() => toast.success('复制成功'))
    .catch(() => toast.error('复制失败'))
}

function clearInput() {
  inputAmount.value = ''
  outputAmount.value = ''
}

// 示例数据
function loadExample() {
  inputAmount.value = '1234567.89'
  convertToChinese()
}
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          人民币大写转换
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          将数字金额转换为人民币大写形式，支持最大13位数金额
        </p>
      </div>

      <!-- 主要功能区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <!-- 控制面板 -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap items-center gap-4">
            <Button variant="primary" @click="convertToChinese">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              转换
            </Button>

            <Button variant="secondary" @click="copyResult">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              复制结果
            </Button>

            <Button variant="ghost" @click="loadExample">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              示例
            </Button>

            <Button variant="danger" @click="clearInput">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              清空
            </Button>
          </div>
        </div>

        <!-- 输入输出区域 -->
        <div class="p-8">
          <div class="grid lg:grid-cols-2 gap-8">
            <!-- 输入区域 -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  输入金额
                </h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">最大支持13位数</span>
              </div>

              <Input
                v-model="inputAmount"
                class="text-lg"
                placeholder="请输入数字金额（如：1234567.89）"
                step="0.01"
              />

              <div class="text-sm text-gray-500 dark:text-gray-400">
                <p>• 支持小数点后两位</p>
                <p>• 金额范围：0 - 999,999,999,999.99</p>
                <p>• 示例：1234567.89</p>
              </div>
            </div>

            <!-- 输出区域 -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  转换结果
                </h3>
                <Button v-if="outputAmount" size="sm" variant="ghost" @click="copyResult">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  复制
                </Button>
              </div>

              <div class="min-h-[120px] p-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div v-if="outputAmount" class="text-gray-900 dark:text-white text-lg font-medium leading-relaxed">
                  {{ outputAmount }}
                </div>
                <div v-else class="text-gray-500 dark:text-gray-400 text-center flex items-center justify-center h-full">
                  转换结果将显示在这里
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">基础功能：</h4>
            <ul class="space-y-1">
              <li>• 数字金额转中文大写</li>
              <li>• 支持小数点后两位</li>
              <li>• 自动添加圆角分单位</li>
              <li>• 智能处理零的转换</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">支持范围：</h4>
            <ul class="space-y-1">
              <li>• 最大金额：999,999,999,999.99</li>
              <li>• 最小金额：0.01</li>
              <li>• 精确到分（0.01元）</li>
              <li>• 支持整数和小数</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">使用技巧：</h4>
            <ul class="space-y-1">
              <li>• 点击"示例"查看效果</li>
              <li>• 支持一键复制结果</li>
              <li>• 实时输入验证</li>
              <li>• 适用于财务报表等场景</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
