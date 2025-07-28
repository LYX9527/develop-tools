<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

// 响应式数据
const leftText = ref('')
const rightText = ref('')
const showLineNumbers = ref(true)
const ignoreWhitespace = ref(false)
const ignoreCase = ref(false)

// 差异类型枚举
enum DiffType {
  EQUAL = 'equal',
  INSERT = 'insert',
  DELETE = 'delete',
  MODIFY = 'modify'
}

// 差异项接口
interface DiffItem {
  type: DiffType
  content: string
  lineNumber?: number
}

// 处理文本差异的核心算法
const computeTextDiff = (text1: string, text2: string): { left: DiffItem[], right: DiffItem[] } => {
  // 首先按行分割原始文本
  const originalLines1 = text1.split('\n')
  const originalLines2 = text2.split('\n')
  
  // 根据配置选项处理每一行
  const processLine = (line: string): string => {
    let processed = line
    
    if (ignoreCase.value) {
      processed = processed.toLowerCase()
    }
    
    if (ignoreWhitespace.value) {
      // 去掉首尾空白，并将连续的空白字符替换为单个空格
      processed = processed.trim().replace(/\s+/g, ' ')
    }
    
    return processed
  }
  
  const lines1 = originalLines1.map(processLine)
  const lines2 = originalLines2.map(processLine)

  const leftDiff: DiffItem[] = []
  const rightDiff: DiffItem[] = []

  const maxLines = Math.max(lines1.length, lines2.length)

    for (let i = 0; i < maxLines; i++) {
    const processedLine1 = lines1[i] || ''
    const processedLine2 = lines2[i] || ''
    const originalLine1 = originalLines1[i] || ''
    const originalLine2 = originalLines2[i] || ''
    
    if (processedLine1 === processedLine2) {
      // 相同行
      leftDiff.push({
        type: DiffType.EQUAL,
        content: originalLine1,
        lineNumber: i + 1
      })
      rightDiff.push({
        type: DiffType.EQUAL,
        content: originalLine2,
        lineNumber: i + 1
      })
    } else if (!processedLine1 && processedLine2) {
      // 右侧新增
      leftDiff.push({
        type: DiffType.EQUAL,
        content: '',
        lineNumber: i + 1
      })
      rightDiff.push({
        type: DiffType.INSERT,
        content: originalLine2,
        lineNumber: i + 1
      })
    } else if (processedLine1 && !processedLine2) {
      // 左侧删除
      leftDiff.push({
        type: DiffType.DELETE,
        content: originalLine1,
        lineNumber: i + 1
      })
      rightDiff.push({
        type: DiffType.EQUAL,
        content: '',
        lineNumber: i + 1
      })
    } else {
      // 修改行
      leftDiff.push({
        type: DiffType.DELETE,
        content: originalLine1,
        lineNumber: i + 1
      })
      rightDiff.push({
        type: DiffType.INSERT,
        content: originalLine2,
        lineNumber: i + 1
      })
    }
  }

  return { left: leftDiff, right: rightDiff }
}

// 计算差异结果
const diffResult = computed(() => {
  if (!leftText.value && !rightText.value) {
    return { left: [], right: [] }
  }
  return computeTextDiff(leftText.value, rightText.value)
})

// 统计信息
const diffStats = computed(() => {
  const left = diffResult.value.left
  const right = diffResult.value.right

  const additions = right.filter(item => item.type === DiffType.INSERT).length
  const deletions = left.filter(item => item.type === DiffType.DELETE).length
  const modifications = left.filter(item => item.type === DiffType.DELETE &&
    right.find(r => r.lineNumber === item.lineNumber && r.type === DiffType.INSERT)).length

  return {
    additions,
    deletions,
    modifications: modifications
  }
})

// 清空所有内容
const clearAll = () => {
  leftText.value = ''
  rightText.value = ''
  toast.success('已清空所有内容')
}

// 交换左右内容
const swapTexts = () => {
  const temp = leftText.value
  leftText.value = rightText.value
  rightText.value = temp
  toast.success('已交换左右文本内容')
}

// 复制结果
const copyResult = async () => {
  const result = `=== 文本对比结果 ===
新增: ${diffStats.value.additions} 行
删除: ${diffStats.value.deletions} 行
修改: ${diffStats.value.modifications} 行

=== 左侧文本 ===
${leftText.value}

=== 右侧文本 ===
${rightText.value}`

  try {
    await navigator.clipboard.writeText(result)
    toast.success('对比结果已复制到剪贴板')
  } catch (err) {
    toast.error('复制失败，请手动复制')
  }
}

// 示例数据
const loadExample = () => {
  leftText.value = `{
  "x": 5,
  "f": 236,
  "n": 2.1,
  "a": 22.2,
  "b": 0.51,
  "q0": 4.7,
  "z": 30,
  "dt": 1,
  "i0": 25,
  "fc1": 1,
  "fc2": 0.5,
  "r81": 0.6,
  "r82": 1,
  "r83": 0.4,
  "useRainType": 0,
  "j": 5.84,
  "n": [
}`

  rightText.value = `{
  "x": 5,
  "f": 236,
  "n": 2.1,
  "a": 22.18213904545828,
  "b": 0.51,
  "q0": 4.72,
  "z": 30,
  "dt": 1,
  "i0": 25,
  "fc1": 1,
  "fc2": 0.5,
  "r81": 0.6,
  "r82": 1,
  "r83": 0.4,
  "useRainType": 0,
  "l": 40,
  "j": 5.84,
  "rateDataList": [
}`

  toast.success('已加载示例数据')
}

// 组件挂载动画
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
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          文本对比工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          对比两段文本的差异，高亮显示新增、删除和修改的内容
        </p>
      </div>

      <!-- 控制面板 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <Button variant="primary" @click="loadExample">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            加载示例
          </Button>
          <Button variant="success" @click="swapTexts">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            交换内容
          </Button>
          <Button variant="info" @click="copyResult">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            复制结果
          </Button>
          <Button variant="danger" @click="clearAll">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            清空所有
          </Button>
        </div>

        <!-- 配置选项 -->
        <div class="flex flex-wrap gap-6 mb-6">
          <Checkbox
            v-model="showLineNumbers"
            label="显示行号"
          />
          <Checkbox
            v-model="ignoreWhitespace"
            label="忽略空白字符"
          />
          <Checkbox
            v-model="ignoreCase"
            label="忽略大小写"
          />
        </div>

        <!-- 统计信息 -->
        <div class="flex flex-wrap gap-6 text-sm">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 bg-green-500 rounded-full"></span>
            <span class="text-gray-700 dark:text-gray-300 font-medium">新增: {{ diffStats.additions }} 行</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 bg-red-500 rounded-full"></span>
            <span class="text-gray-700 dark:text-gray-300 font-medium">删除: {{ diffStats.deletions }} 行</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span class="text-gray-700 dark:text-gray-300 font-medium">修改: {{ diffStats.modifications }} 行</span>
          </div>
        </div>
      </div>

      <!-- 对比面板 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 左侧输入 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              原始文本
            </h3>
          </div>
          <div class="p-6">
            <TextArea
              v-model="leftText"
              :rows="12"
              class="font-mono text-sm"
              full-width
              placeholder="请输入原始文本..."
              show-counter
            />
          </div>
        </div>

        <!-- 右侧输入 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              对比文本
            </h3>
          </div>
          <div class="p-6">
            <TextArea
              v-model="rightText"
              :rows="12"
              class="font-mono text-sm"
              full-width
              placeholder="请输入对比文本..."
              show-counter
            />
          </div>
        </div>
      </div>

      <!-- 差异结果显示 -->
      <div v-if="diffResult.left.length > 0" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            差异对比结果
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 左侧差异 -->
            <div class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div class="bg-red-50 dark:bg-red-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm font-medium text-red-700 dark:text-red-300 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  删除内容
                </span>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div class="font-mono text-sm">
                  <div
                    v-for="(item, index) in diffResult.left"
                    :key="index"
                    :class="{
                      'bg-red-50 dark:bg-red-900/20': item.type === 'delete',
                      'bg-gray-50 dark:bg-gray-800/30': item.type === 'equal'
                    }"
                    class="flex border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <span v-if="showLineNumbers" class="w-12 text-gray-400 text-right pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 select-none">
                      {{ item.lineNumber }}
                    </span>
                    <span :class="{
                      'text-red-800 dark:text-red-200': item.type === 'delete',
                      'text-gray-700 dark:text-gray-300': item.type === 'equal'
                    }" class="flex-1 px-3 py-2 whitespace-pre-wrap break-all">{{ item.content || '⠀' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧差异 -->
            <div class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div class="bg-green-50 dark:bg-green-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  新增内容
                </span>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div class="font-mono text-sm">
                  <div
                    v-for="(item, index) in diffResult.right"
                    :key="index"
                    :class="{
                      'bg-green-50 dark:bg-green-900/20': item.type === 'insert',
                      'bg-gray-50 dark:bg-gray-800/30': item.type === 'equal'
                    }"
                    class="flex border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <span v-if="showLineNumbers" class="w-12 text-gray-400 text-right pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 select-none">
                      {{ item.lineNumber }}
                    </span>
                    <span :class="{
                      'text-green-800 dark:text-green-200': item.type === 'insert',
                      'text-gray-700 dark:text-gray-300': item.type === 'equal'
                    }" class="flex-1 px-3 py-2 whitespace-pre-wrap break-all">{{ item.content || '⠀' }}</span>
                  </div>
                </div>
              </div>
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
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">功能特点：</h4>
            <ul class="space-y-2">
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                逐行对比文本差异
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                高亮显示新增、删除和修改内容
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                支持忽略大小写和空白字符
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                显示行号辅助定位
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用技巧：</h4>
            <ul class="space-y-2">
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                点击「加载示例」查看效果
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                使用「交换内容」快速调换位置
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                适用于代码、配置文件等文本对比
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                统计信息帮助快速了解差异程度
              </li>
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

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #06b6d4, #8b5cf6);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #2563eb, #7c3aed);
}

/* 等宽字体 */
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
