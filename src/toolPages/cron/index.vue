<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useMessage} from 'naive-ui'
import {loadScript} from '@/utils/scriptLoader'
import moment from "moment/moment";
import cronstrue from 'cronstrue'
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";
import GlassMorphismSelect from "@/components/GlassMorphismSelect.vue";

declare const later: any

const message = useMessage()
const isScriptsLoaded = ref(false)

// 加载所需的脚本
async function loadDependencies() {
  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/later/1.2.0/later.min.js')
    ])

    // 设置 moment 的语言为中文
    moment.locale('zh-cn')

    // 移除 cronstrue 初始化，直接在使用时指定语言
    isScriptsLoaded.value = true
    validateExpression()
  } catch (error) {
    message.error('加载依赖失败')
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
    {label: '每秒 (*)', value: '*'},
    {label: '0', value: '0'},
    {label: '每5秒', value: '0/5'},
    {label: '每10秒', value: '0/10'},
    {label: '每30秒', value: '0/30'}
  ],
  minutes: [
    {label: '每分钟 (*)', value: '*'},
    {label: '0', value: '0'},
    {label: '每5分钟', value: '0/5'},
    {label: '每10分钟', value: '0/10'},
    {label: '每30分钟', value: '0/30'}
  ],
  hours: [
    {label: '每小时 (*)', value: '*'},
    {label: '0', value: '0'},
    {label: '每2小时', value: '*/2'},
    {label: '每4小时', value: '*/4'},
    {label: '每6小时', value: '*/6'},
    {label: '每12小时', value: '*/12'}
  ],
  day: [
    {label: '每天 (*)', value: '*'},
    {label: '1号', value: '1'},
    {label: '最后一天', value: 'L'},
    {label: '最近的工作日', value: '1W'},
    {label: '最后一个工作日', value: 'LW'}
  ],
  month: [
    {label: '每月 (*)', value: '*'},
    {label: '一月', value: '1'},
    {label: '每季度', value: '*/3'},
    {label: '每半年', value: '*/6'}
  ],
  week: [
    {label: '不指定 (?)', value: '?'},
    {label: '每天 (*)', value: '*'},
    {label: '周一', value: 'MON'},
    {label: '周一至周五', value: 'MON-FRI'},
    {label: '最后一个周日', value: '1L'}
  ]
}

// 常用表达式
const quickExpressions = [
  {label: '每小时', value: '0 0 * * * ?'},
  {label: '每天零点', value: '0 0 0 * * ?'},
  {label: '每月1号零点', value: '0 0 0 1 * ?'},
  {label: '每年1月1日零点', value: '0 0 0 1 1 ?'},
  {label: '每30分钟', value: '0 0/30 * * * ?'}
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

    // 使用中文解析表达式，直接在 toString 时指定语言
    expressionDescription.value = cronstrue.toString(cronExpression.value, {
      locale: 'zh_CN',
      use24HourTimeFormat: true, // 使用24小时制
      verbose: true // 使用详细描述
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
    message.success('已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 选择快速表达式
function selectQuickExpression(expression: string) {
  cronExpression.value = expression
  validateExpression()
}

// 初始化
onMounted(() => {
  loadDependencies()
})
</script>

<template>
  <div class="container">
    <div v-if="!isScriptsLoaded" class="loading-overlay">
      <n-spin size="large"/>
      <p>加载中...</p>
    </div>


    <div class="quick-select">
      <h3>常用表达式</h3>
      <div class="quick-select-buttons">
        <n-button
            v-for="expr in quickExpressions"
            :key="expr.value"
            @click="selectQuickExpression(expr.value)"
            size="small"
        >
          {{ expr.label }}
        </n-button>
      </div>
    </div>

    <div class="cron-builder">
      <div class="field-group">
        <div class="field-label">秒</div>
        <div class="field-description">0-59</div>
        <glass-morphism-select
            v-model="seconds"
            :options="fieldOptions.seconds"
            placeholder="请选择一个选项"
            :blur="10"
            :opacity="0.25"
            :radius="10"
            @update:modelValue="updateExpression"
        />
      </div>

      <div class="field-group">
        <div class="field-label">分钟</div>
        <div class="field-description">0-59</div>
        <glass-morphism-select
            v-model="minutes"
            :options="fieldOptions.minutes"
            placeholder="请选择一个选项"
            :blur="10"
            :opacity="0.25"
            :radius="10"
            @update:modelValue="updateExpression"
            />
      </div>

      <div class="field-group">
        <div class="field-label">小时</div>
        <div class="field-description">0-23</div>
        <glass-morphism-select
            v-model="hours"
            :options="fieldOptions.hours"
            placeholder="请选择一个选项"
            :blur="10"
            :opacity="0.25"
            :radius="10"
            @update:modelValue="updateExpression"
        />
      </div>

      <div class="field-group">
        <div class="field-label">日期</div>
        <div class="field-description">1-31</div>
        <glass-morphism-select
            v-model="day"
            :options="fieldOptions.day"
            placeholder="请选择一个选项"
            :blur="10"
            :opacity="0.25"
            :radius="10"
            @update:modelValue="updateExpression"
        />
      </div>

      <div class="field-group">
        <div class="field-label">月份</div>
        <div class="field-description">1-12</div>
        <GlassMorphismSelect
            v-model="month"
            :options="fieldOptions.month"
            placeholder="请选择一个选项"
            :blur="10"
            :opacity="0.25"
            :radius="10"
            @update:modelValue="updateExpression"
        />
      </div>

      <div class="field-group">
        <div class="field-label">星期</div>
        <div class="field-description">1-7 或 SUN-SAT</div>
        <glass-morphism-select
            v-model="week"
            :options="fieldOptions.week"
            placeholder="请选择一个选项"
            :blur="10"
            :opacity="0.25"
            :radius="10"
            @update:modelValue="updateExpression"
        />
      </div>
    </div>

    <div class="result-section">
      <div class="expression-group">
        <glass-morphism-input
            v-model="cronExpression"
            placeholder="请输入搜索内容..."
            :blur="5"
            :opacity="0.2"
            suffixButton
            buttonText="复制"
            buttonType="success"
            @button-click="copyExpression"
            @input="validateExpression"
        />
      </div>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-else class="description">{{ expressionDescription }}</div>

      <div class="next-runs">
        <h3>未来10次运行时间</h3>
        <div class="time-list">
          <div
              v-for="(time, index) in nextExecutionTimes"
              :key="index"
              class="time-item"
          >
            {{ time }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background: var(--n-color);
  border-radius: 12px;
  box-shadow: 0 2px 10px var(--n-box-shadow);

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--n-text-color);
  }
}

.quick-select {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--n-color-modal);
  border-radius: 8px;

  h3 {
    margin-bottom: 10px;
    color: var(--n-text-color);
  }

  .quick-select-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.cron-builder {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;

  // 设置每个字段组的固定宽度
  .field-group {
    min-width: 160px;
    width: calc((100% - 60px) / 6);
    flex-shrink: 1;
    padding: 12px;
    background: var(--n-color-modal);
    border-radius: 8px;

    .field-label {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--n-text-color);
      font-size: var(--n-font-size-small);
    }

    .field-description {
      font-size: var(--n-font-size-tiny);
      color: var(--n-text-color-3);
      margin-bottom: 8px;
    }
  }

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--n-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--n-border-color);
    border-radius: 3px;

    &:hover {
      background: var(--n-text-color-3);
    }
  }
}

.result-section {
  margin-top: 30px;
  padding: 20px;
  background: var(--n-color-modal);
  border-radius: 8px;

  .expression-group {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
  }

  .error {
    color: var(--n-error-color);
    margin-top: 5px;
    font-size: var(--n-font-size-small);
  }

  .description {
    margin: 15px 0;
    padding: 10px;
    background: var(--n-color);
    border-radius: 4px;
    color: var(--n-text-color);
  }

  .next-runs {
    margin-top: 20px;

    h3 {
      margin-bottom: 10px;
      color: var(--n-text-color);
    }

    .time-list {
      .time-item {
        padding: 8px;
        color: var(--n-text-color);
        border-bottom: 1px solid var(--n-border-color);

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .cron-builder {
    flex-wrap: wrap;
    gap: 8px;

    .field-group {
      width: calc((100% - 8px) / 2);
      min-width: 140px;
      padding: 10px;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--n-color);
  border-radius: 12px;
  z-index: 100;

  p {
    margin-top: 16px;
    color: var(--n-text-color);
  }
}
</style>
