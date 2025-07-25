<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import Input from '@/components/ui/Input.vue'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

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
const errorMessage = ref('')

// 常用正则表达式
const commonPatterns = [
  {
    name: '手机号码',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配11位中国大陆手机号',
    example: '13812345678'
  },
  {
    name: '邮箱地址',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: '匹配标准邮箱格式',
    example: 'example@email.com'
  },
  {
    name: '身份证号',
    pattern: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    description: '匹配18位身份证号',
    example: '110101199001011234'
  },
  {
    name: '日期格式(yyyy-mm-dd)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: '匹配yyyy-mm-dd格式日期',
    example: '2024-01-15'
  },
  {
    name: '时间格式(HH:mm:ss)',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$',
    description: '匹配24小时制时间',
    example: '14:30:25'
  },
  {
    name: 'URL地址',
    pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-\\.,@?^=%&:\\/~\\+#]*$',
    description: '匹配HTTP/HTTPS URL地址',
    example: 'https://www.example.com'
  },
  {
    name: 'IPv4地址',
    pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    description: '匹配IPv4地址格式',
    example: '192.168.1.1'
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    description: '匹配一个或多个中文字符',
    example: '中文测试'
  },
  {
    name: '密码强度',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: '至少8位，包含大小写字母、数字和特殊字符',
    example: 'Password123!'
  },
  {
    name: '十六进制颜色',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: '匹配十六进制颜色代码',
    example: '#FF5733'
  }
]

// 计算标志字符串
const flagString = computed(() => {
  let result = ''
  if (flags.value.global) result += 'g'
  if (flags.value.ignoreCase) result += 'i'
  if (flags.value.multiline) result += 'm'
  return result
})

// 测试正则表达式
function testRegex() {
  if (!regexInput.value || !testInput.value) {
    highlightedText.value = ''
    matchCount.value = 0
    errorMessage.value = ''
    return
  }

  try {
    const regex = new RegExp(regexInput.value, flagString.value)
    const matches = []
    let count = 0

    if (flags.value.global) {
      let match
      while ((match = regex.exec(testInput.value)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[0]
        })
        count++

        // 防止无限循环
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testInput.value)
      if (match) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[0]
        })
        count = 1
      }
    }

    // 生成高亮文本
    let result = ''
    let lastIndex = 0

    matches.forEach(match => {
      result += escapeHtml(testInput.value.substring(lastIndex, match.start))
      result += `<mark class="highlight">${escapeHtml(match.content)}</mark>`
      lastIndex = match.end
    })

    result += escapeHtml(testInput.value.substring(lastIndex))
    highlightedText.value = result
    matchCount.value = count
    errorMessage.value = ''

    if (count > 0) {
      toast.success(`找到 ${count} 个匹配`)
    }
  } catch (err) {
    highlightedText.value = ''
    matchCount.value = 0
    errorMessage.value = err instanceof Error ? err.message : '正则表达式格式错误'
    toast.error('正则表达式格式错误')
  }
}

// HTML转义
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 选择正则表达式模板
function selectPattern(pattern: { pattern: string, example: string }) {
  regexInput.value = pattern.pattern
  testInput.value = pattern.example
  toast.success('已选择该正则表达式模板')
  testRegex()
}

// 复制正则表达式
function copyPattern(pattern: string) {
  navigator.clipboard.writeText(pattern)
    .then(() => toast.success('已复制到剪贴板'))
    .catch(() => toast.error('复制失败'))
}

// 清空内容
function clearAll() {
  regexInput.value = ''
  testInput.value = ''
  highlightedText.value = ''
  matchCount.value = 0
  errorMessage.value = ''
}

// 示例测试
function loadExample() {
  regexInput.value = '^1[3-9]\\d{9}$'
  testInput.value = '手机号码：13812345678\n固定电话：010-12345678\n另一个手机：15987654321'
  testRegex()
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
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
          正则表达式测试
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          测试和验证正则表达式，实时匹配结果和语法高亮
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- 主要测试区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <!-- 控制面板 -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-wrap items-center gap-4">
                <Button variant="primary" @click="testRegex">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  测试匹配
                </Button>

                <Button variant="ghost" @click="loadExample">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  示例
                </Button>

                <Button variant="danger" @click="clearAll">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  清空
                </Button>

                <!-- 匹配标志 -->
                <div class="flex items-center space-x-4 ml-auto">
                  <Checkbox
                    v-model="flags.global"
                    label="全局 (g)"
                    @update:modelValue="testRegex"
                  />
                  <Checkbox
                    v-model="flags.ignoreCase"
                    label="忽略大小写 (i)"
                    @update:modelValue="testRegex"
                  />
                  <Checkbox
                    v-model="flags.multiline"
                    label="多行 (m)"
                    @update:modelValue="testRegex"
                  />
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="p-6 space-y-6">
              <!-- 正则表达式输入 -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    正则表达式
                  </label>
                  <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>标志：</span>
                    <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{{ flagString || '无' }}</code>
                  </div>
                </div>
                <Input
                  v-model="regexInput"
                  class="font-mono"
                  placeholder="输入正则表达式，如：^1[3-9]\d{9}$"
                  @input="testRegex"
                />
              </div>

              <!-- 测试文本输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  测试文本
                </label>
                <TextArea
                  v-model="testInput"
                  :rows="6"
                  class="font-mono"
                  placeholder="输入需要匹配的测试文本..."
                  @input="testRegex"
                />
              </div>

              <!-- 匹配结果 -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    匹配结果
                  </label>
                  <div v-if="matchCount > 0" class="text-sm text-green-600 dark:text-green-400">
                    找到 {{ matchCount }} 个匹配
                  </div>
                  <div v-else-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
                    {{ errorMessage }}
                  </div>
                </div>
                <div
                  :class="{ 'text-red-600 dark:text-red-400': errorMessage }"
                  class="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-sm whitespace-pre-wrap break-words"
                >
                  <div v-if="!regexInput || !testInput" class="text-gray-500 dark:text-gray-400 text-center flex items-center justify-center h-full">
                    输入正则表达式和测试文本后，匹配结果将在这里高亮显示
                  </div>
                  <div v-else-if="errorMessage" class="text-center flex items-center justify-center h-full">
                    {{ errorMessage }}
                  </div>
                  <div v-else-if="highlightedText" v-html="highlightedText"></div>
                  <div v-else class="text-gray-500 dark:text-gray-400 text-center flex items-center justify-center h-full">
                    没有找到匹配项
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常用正则表达式 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              常用正则表达式
            </h3>

            <div class="space-y-3">
              <div
                v-for="pattern in commonPatterns"
                :key="pattern.name"
                class="group border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 cursor-pointer"
                @click="selectPattern(pattern)"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900 dark:text-white text-sm">
                    {{ pattern.name }}
                  </h4>
                  <Button
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                    variant="ghost"
                    @click.stop="copyPattern(pattern.pattern)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                  </Button>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {{ pattern.description }}
                </div>
                <code class="block text-xs font-mono text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded break-all">
                  {{ pattern.pattern }}
                </code>
                <div class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  示例：<code>{{ pattern.example }}</code>
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
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">匹配标志：</h4>
            <ul class="space-y-1">
              <li>• <code>g</code> - 全局匹配，查找所有匹配项</li>
              <li>• <code>i</code> - 忽略大小写</li>
              <li>• <code>m</code> - 多行模式，^和$匹配行首行尾</li>
              <li>• 可以组合使用多个标志</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">常用元字符：</h4>
            <ul class="space-y-1">
              <li>• <code>.</code> - 匹配任意字符（除换行符）</li>
              <li>• <code>*</code> - 匹配前面的字符0次或多次</li>
              <li>• <code>+</code> - 匹配前面的字符1次或多次</li>
              <li>• <code>?</code> - 匹配前面的字符0次或1次</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">使用技巧：</h4>
            <ul class="space-y-1">
              <li>• 点击常用模板快速开始</li>
              <li>• 实时查看匹配结果和数量</li>
              <li>• 使用转义字符 \ 匹配特殊字符</li>
              <li>• 复制按钮可快速获取正则表达式</li>
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

/* 高亮样式 */
:deep(.highlight) {
  background-color: #fbbf24;
  color: #92400e;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.dark .highlight) {
  background-color: #f59e0b;
  color: #1f2937;
}

/* 代码样式 */
code {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
}
</style>
