<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { useToast } from '@/composables/useToast'
import { loadScript } from '@/utils/scriptLoader'
import moment from "moment/moment"
import cronstrue from 'cronstrue'
import 'cronstrue/locales/zh_CN'
declare const later: any

const toast = useToast()
const isScriptsLoaded = ref(false)

// 加载所需的脚本
async function loadDependencies() {
  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/later/1.2.0/later.min.js')
    ])

    // 设置 moment 的语言为中文
    moment.locale('zh-cn')

    isScriptsLoaded.value = true
    validateExpression()
  } catch (error) {
    toast.error('加载依赖失败')
    console.error('Failed to load dependencies:', error)
  }
}

// 状态变量
const cronExpression = ref('0 0 0 * * ?')
const expressionDescription = ref('')
const nextExecutionTimes = ref<string[]>([])
const isValid = ref(true)
const errorMessage = ref('')

// 字段选择值
const seconds = ref('0')
const minutes = ref('0')
const hours = ref('0')
const day = ref('*')
const month = ref('*')
const week = ref('?')

// 字段选项
const fieldOptions = {
  seconds: [
    { label: '每秒 (*)', value: '*' },
    { label: '0', value: '0' },
    { label: '每5秒', value: '0/5' },
    { label: '每10秒', value: '0/10' },
    { label: '每30秒', value: '0/30' }
  ],
  minutes: [
    { label: '每分钟 (*)', value: '*' },
    { label: '0', value: '0' },
    { label: '每5分钟', value: '0/5' },
    { label: '每10分钟', value: '0/10' },
    { label: '每30分钟', value: '0/30' }
  ],
  hours: [
    { label: '每小时 (*)', value: '*' },
    { label: '0', value: '0' },
    { label: '每2小时', value: '*/2' },
    { label: '每4小时', value: '*/4' },
    { label: '每6小时', value: '*/6' },
    { label: '每12小时', value: '*/12' }
  ],
  day: [
    { label: '每天 (*)', value: '*' },
    { label: '1号', value: '1' },
    { label: '最后一天', value: 'L' },
    { label: '最近的工作日', value: '1W' },
    { label: '最后一个工作日', value: 'LW' }
  ],
  month: [
    { label: '每月 (*)', value: '*' },
    { label: '一月', value: '1' },
    { label: '每季度', value: '*/3' },
    { label: '每半年', value: '*/6' }
  ],
  week: [
    { label: '不指定 (?)', value: '?' },
    { label: '每天 (*)', value: '*' },
    { label: '周一', value: 'MON' },
    { label: '周一至周五', value: 'MON-FRI' },
    { label: '最后一个周日', value: '1L' }
  ]
}

// 常用表达式
const quickExpressions = [
  { label: '每小时', value: '0 0 * * * ?' },
  { label: '每天零点', value: '0 0 0 * * ?' },
  { label: '每月1号零点', value: '0 0 0 1 * ?' },
  { label: '每年1月1日零点', value: '0 0 0 1 1 ?' },
  { label: '每30分钟', value: '0 0/30 * * * ?' }
]

// 更新表达式
function updateExpression() {
  cronExpression.value = `${seconds.value} ${minutes.value} ${hours.value} ${day.value} ${month.value} ${week.value}`
  validateExpression()
}

// 验证表达式
function validateExpression() {
  if (!isScriptsLoaded.value) return

  try {
    const parts = cronExpression.value.split(' ')
    if (parts.length !== 6) {
      throw new Error('Cron表达式必须包含6个部分')
    }

    // 使用中文解析表达式
    expressionDescription.value = cronstrue.toString(cronExpression.value, {
      locale: 'zh_CN',
      use24HourTimeFormat: true,
      verbose: true
    })
    errorMessage.value = ''
    isValid.value = true
    calculateNextExecutions()
  } catch (err: any) {
    errorMessage.value = err.message || '无效的Cron表达式'
    expressionDescription.value = ''
    nextExecutionTimes.value = []
    isValid.value = false
  }
}

// 计算未来执行时间
function calculateNextExecutions() {
  try {
    const parts = cronExpression.value.split(' ')
    let cronExpr = cronExpression.value
    if (parts[5] === '?') {
      cronExpr = parts.slice(0, 5).join(' ') + ' *'
    }

    later.date.localTime()
    const schedule = later.parse.cron(cronExpr, true)
    const occurrences = later.schedule(schedule).next(10)

    nextExecutionTimes.value = occurrences.map(date =>
      moment(date).format('YYYY-MM-DD HH:mm:ss')
    )
  } catch (err: any) {
    console.error('计算下次运行时间出错:', err)
    errorMessage.value = err.message || '计算下次运行时间出错'
    nextExecutionTimes.value = []
  }
}

// 复制表达式
function copyExpression() {
  navigator.clipboard.writeText(cronExpression.value).then(() => {
    toast.success('已复制到剪贴板')
  }).catch(() => {
    toast.error('复制失败')
  })
}

// 选择快速表达式
function selectQuickExpression(expression: string) {
  cronExpression.value = expression

  // 解析表达式并更新字段
  const parts = expression.split(' ')
  if (parts.length === 6) {
    seconds.value = parts[0]
    minutes.value = parts[1]
    hours.value = parts[2]
    day.value = parts[3]
    month.value = parts[4]
    week.value = parts[5]
  }

  validateExpression()
}

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
  loadDependencies()
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Cron表达式生成器
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          生成和验证Cron表达式，查看未来运行时间
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="!isScriptsLoaded" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">加载依赖中...</p>
      </div>

      <!-- 主要内容 -->
      <div v-else class="space-y-6">
        <!-- 常用表达式 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">常用表达式</h3>
          <div class="flex flex-wrap gap-3">
            <Button
              v-for="expr in quickExpressions"
              :key="expr.value"
              @click="selectQuickExpression(expr.value)"
              variant="ghost"
              size="sm"
              class="hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              {{ expr.label }}
            </Button>
          </div>
        </div>

        <!-- Cron字段构建器 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">字段配置</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <!-- 秒 -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">秒</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">0-59</div>
              <Select
                v-model:modelValue="seconds"
                :options="fieldOptions.seconds"
                @update:modelValue="updateExpression"
              />
            </div>

            <!-- 分钟 -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">分钟</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">0-59</div>
              <Select
                v-model:modelValue="minutes"
                :options="fieldOptions.minutes"
                @update:modelValue="updateExpression"
              />
            </div>

            <!-- 小时 -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">小时</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">0-23</div>
              <Select
                v-model:modelValue="hours"
                :options="fieldOptions.hours"
                @update:modelValue="updateExpression"
              />
            </div>

            <!-- 日期 -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">日期</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">1-31</div>
              <Select
                v-model:modelValue="day"
                :options="fieldOptions.day"
                @update:modelValue="updateExpression"
              />
            </div>

            <!-- 月份 -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">月份</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">1-12</div>
              <Select
                v-model:modelValue="month"
                :options="fieldOptions.month"
                @update:modelValue="updateExpression"
              />
            </div>

            <!-- 星期 -->
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">星期</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">1-7 或 SUN-SAT</div>
              <Select
                v-model:modelValue="week"
                :options="fieldOptions.week"
                @update:modelValue="updateExpression"
              />
            </div>
          </div>
        </div>

        <!-- 结果展示 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">生成结果</h3>

          <!-- 表达式输入框 -->
          <div class="flex space-x-3 mb-6">
            <Input
              v-model="cronExpression"
              placeholder="Cron表达式"
              class="font-mono flex-1"
              @input="validateExpression"
            />
            <Button @click="copyExpression" variant="primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              复制
            </Button>
          </div>

          <!-- 错误信息或描述 -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-800 dark:text-red-200">{{ errorMessage }}</p>
          </div>
          <div v-else-if="expressionDescription" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-green-800 dark:text-green-200">{{ expressionDescription }}</p>
          </div>

          <!-- 未来执行时间 -->
          <div v-if="nextExecutionTimes.length > 0">
            <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">未来10次运行时间</h4>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div
                  v-for="(time, index) in nextExecutionTimes"
                  :key="index"
                  class="text-sm font-mono text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  {{ index + 1 }}. {{ time }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Cron表达式说明
          </h3>
          <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">字段格式</h4>
              <ul class="space-y-2">
                <li><strong>秒 (0-59)</strong>: 具体秒数</li>
                <li><strong>分 (0-59)</strong>: 具体分钟数</li>
                <li><strong>时 (0-23)</strong>: 具体小时数</li>
                <li><strong>日 (1-31)</strong>: 月份中的天数</li>
                <li><strong>月 (1-12)</strong>: 月份</li>
                <li><strong>周 (1-7)</strong>: 星期几</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">特殊字符</h4>
              <ul class="space-y-2">
                <li><strong>*</strong>: 匹配所有值</li>
                <li><strong>?</strong>: 不指定值（仅用于日和周）</li>
                <li><strong>/</strong>: 递增触发（如：0/15 表示每15分钟）</li>
                <li><strong>L</strong>: 最后一天/周</li>
                <li><strong>W</strong>: 工作日</li>
                <li><strong>-</strong>: 范围（如：MON-FRI）</li>
              </ul>
            </div>
          </div>
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
</style>
