<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Toggle from '@/components/ui/Toggle.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

// 预设进制选项
const baseOptions = [
  {label: '二进制', value: 2},
  {label: '八进制', value: 8},
  {label: '十进制', value: 10},
  {label: '十六进制', value: 16}
]

// 输出进制选项
const outputBaseOptions = [
  ...baseOptions,
  {label: '26进制(a-z)', value: 26},
  {label: '32进制(无易混淆字符)', value: 32},
  {label: '36进制(0-9,a-z)', value: 36},
  {label: '52进制(a-z,A-Z)', value: 52},
  {label: '58进制(无易混淆字符)', value: 58},
  {label: '62进制(0-9,a-z,A-Z)', value: 62},
  {label: '64进制(0-9,a-z,A-Z,-_)', value: 64}
]

const selectedBase = ref(10)
const customBase = ref(2)
const showCustomBase = ref(false)
const inputValue = ref('')
const outputResults = ref<{ base: number | string, value: string }[]>([])

// 字符集定义
const charsets: Record<number, string> = {
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
      toast.error('转换失败')
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
    toast.error('转换失败')
  }
}

// 监听输入变化
watch([() => inputValue.value, () => selectedBase.value, () => customBase.value, () => showCustomBase.value], () => {
  convert()
})

// 监听进制变化，自动过滤非法字符
watch(() => selectedBase.value, (newBase) => {
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
    toast.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(value)
      .then(() => toast.success('复制成功'))
      .catch(() => toast.error('复制失败'))
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

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          进制转换工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          支持二进制、八进制、十进制、十六进制等数字进制转换
        </p>
      </div>

      <!-- 输入区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            输入配置
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入进制</label>
              <Select
                v-model:modelValue="selectedBase"
                :options="baseOptions"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">数值输入</label>
              <div class="flex space-x-2">
                <Input
                  v-model="inputValue"
                  :placeholder="`请输入${getBaseDescription(selectedBase)}数值...`"
                  class="flex-1 font-mono"
                />
                <Button variant="ghost" @click="clearInput">
                  清空
                </Button>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">自定义输出进制</label>
              <Toggle
                v-model="showCustomBase"
                label="启用自定义进制"
              />
              <div v-if="showCustomBase" class="flex items-center space-x-2">
                <NumberInput
                  v-model="customBase"
                  :max="64"
                  :min="2"
                  class="w-24"
                  placeholder="2-64"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">进制</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输出结果 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            转换结果
          </h2>

          <div v-if="outputResults.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">请输入数值进行转换</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="result in outputResults"
              :key="result.base"
              class="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="w-48 flex-shrink-0">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ getBaseDescription(result.base) }}
                </span>
              </div>
              <div class="flex-1 mr-4">
                <Input
                  :model-value="result.value"
                  class="font-mono text-sm"
                  readonly
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                @click="copyResult(result.value)"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                复制
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">支持的进制</h4>
            <ul class="space-y-2">
              <li>• 二进制 (0-1)</li>
              <li>• 八进制 (0-7)</li>
              <li>• 十进制 (0-9)</li>
              <li>• 十六进制 (0-9,A-F)</li>
              <li>• 26进制 (a-z)</li>
              <li>• 36进制 (0-9,a-z)</li>
              <li>• 62进制 (0-9,a-z,A-Z)</li>
              <li>• 自定义进制 (2-64)</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用技巧</h4>
            <ul class="space-y-2">
              <li>• 输入会自动过滤非法字符</li>
              <li>• 支持大小写字母混合输入</li>
              <li>• 可启用自定义进制输出</li>
              <li>• 点击复制按钮快速复制结果</li>
              <li>• 实时转换，无需手动触发</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>字符集说明：</strong>
            <br>• 58进制: 移除了易混淆字符 0, O, I, l
            <br>• 32进制: 移除了易混淆字符 0, 1, I, L, O
            <br>• 64进制: 包含 0-9, a-z, A-Z, -, _
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
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

/* 悬停效果 */
.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}
</style>
