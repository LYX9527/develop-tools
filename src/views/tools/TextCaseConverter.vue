<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

const inputText = ref('')
const outputFormats = ref({
  upper: '',
  lower: '',
  capitalize: '',
  camelCase: '',
  pascalCase: '',
  snakeCase: '',
  kebabCase: '',
  alternating: ''
})

// 转换函数
const transformers = {
  upper: (text: string) => text.toUpperCase(),
  lower: (text: string) => text.toLowerCase(),
  capitalize: (text: string) => {
    return text.replace(/\b\w/g, c => c.toUpperCase())
  },
  camelCase: (text: string) => {
    return text.toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
  },
  pascalCase: (text: string) => {
    return text.toLowerCase()
        .replace(/(^|\s+)([a-z])/g, (_, space, c) => c.toUpperCase())
        .replace(/\s+/g, '')
  },
  snakeCase: (text: string) => {
    return text.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
  },
  kebabCase: (text: string) => {
    return text.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
  },
  alternating: (text: string) => {
    return text.split('')
        .map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase())
        .join('')
  }
}

// 格式标签映射
const formatLabels = {
  upper: '大写',
  lower: '小写',
  capitalize: '首字母大写',
  camelCase: '驼峰命名',
  pascalCase: '帕斯卡命名',
  snakeCase: '下划线命名',
  kebabCase: '连字符命名',
  alternating: '交替大小写'
}

// 转换所有格式
const transformAll = () => {
  if (!inputText.value.trim()) {
    toast.warning('请输入要转换的文本')
    return
  }

  Object.entries(transformers).forEach(([key, fn]) => {
    outputFormats.value[key as keyof typeof outputFormats.value] = fn(inputText.value)
  })

  toast.success('转换完成！')
}

// 复制结果
const copyResult = async (format: keyof typeof outputFormats.value) => {
  const text = outputFormats.value[format]
  if (!text) {
    toast.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    toast.success('复制成功！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 清空输入
const clearAll = () => {
  inputText.value = ''
  Object.keys(outputFormats.value).forEach(key => {
    outputFormats.value[key as keyof typeof outputFormats.value] = ''
  })
  toast.info('已清空所有内容')
}

// 加载示例
const loadExample = () => {
  inputText.value = 'Hello World Example Text For Case Conversion'
  transformAll()
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
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          文本命名转换工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          支持多种命名格式转换，包括驼峰、帕斯卡、下划线等编程常用命名规范
        </p>
      </div>

      <!-- 控制面板 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <Button @click="transformAll" variant="primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            转换所有格式
          </Button>

          <Button @click="loadExample" variant="info">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            加载示例
          </Button>

          <Button @click="clearAll" variant="danger">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            清空
          </Button>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- 输入区域 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              输入文本
            </h3>
          </div>
          <div class="p-6">
            <TextArea
              v-model="inputText"
              placeholder="在此输入要转换的文本..."
              rows="8"
              class="font-mono text-sm"
              :maxLength="1000"
              :showCounter="true"
            />
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              转换结果
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <!-- 格式转换结果 -->
            <div
              v-for="(format, key) in formatLabels"
              :key="key"
              class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <div class="flex-shrink-0 w-24">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ format }}
                </span>
              </div>
              <div class="flex-1">
                                 <Input
                   :model-value="outputFormats[key as keyof typeof outputFormats]"
                   :placeholder="`${format}格式`"
                   class="font-mono text-sm"
                   disabled
                 />
              </div>
              <Button
                @click="copyResult(key as keyof typeof outputFormats)"
                variant="ghost"
                size="sm"
                :disabled="!outputFormats[key as keyof typeof outputFormats]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">命名格式说明：</h4>
            <ul class="space-y-3">
              <li><span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">驼峰命名</span>：首字母小写，后续单词首字母大写</li>
              <li><span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">帕斯卡命名</span>：每个单词首字母都大写</li>
              <li><span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">下划线命名</span>：单词间用下划线连接</li>
              <li><span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">连字符命名</span>：单词间用连字符连接</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用技巧：</h4>
            <ul class="space-y-3">
              <li>• 支持任意语言文本转换</li>
              <li>• 自动过滤特殊字符</li>
              <li>• 点击复制按钮快速复制结果</li>
              <li>• 支持批量转换多种格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
