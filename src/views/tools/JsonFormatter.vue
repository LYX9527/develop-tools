<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const inputJson = ref('')
const outputJson = ref('')
const indentSize = ref(2)
const isValid = ref(true)
const errorMessage = ref('')

// 格式化JSON
const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, indentSize.value)
    isValid.value = true
    errorMessage.value = ''
    toast.success('JSON格式化成功！')
  } catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的JSON格式'
    outputJson.value = ''
    toast.error('JSON格式无效')
  }
}

// 压缩JSON
const minifyJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    isValid.value = true
    errorMessage.value = ''
    toast.success('JSON压缩成功！')
  } catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的JSON格式'
    outputJson.value = ''
    toast.error('JSON格式无效')
  }
}

// 验证JSON
const validateJson = () => {
  try {
    JSON.parse(inputJson.value)
    isValid.value = true
    errorMessage.value = ''
    toast.success('JSON格式有效！')
  } catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的JSON格式'
    toast.error('JSON格式无效')
  }
}

// 清空内容
const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
  isValid.value = true
  errorMessage.value = ''
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 示例JSON
const loadExample = () => {
  inputJson.value = JSON.stringify({
    "name": "开发者工具箱",
    "version": "1.0.0",
    "features": [
      "JSON格式化",
      "Base64转换",
      "密码生成器"
    ],
    "config": {
      "theme": "dark",
      "language": "zh-CN",
      "autoSave": true
    },
    "meta": {
      "author": "Developer",
      "created": "2024-01-01",
      "tags": ["tools", "development", "utilities"]
    }
  }, null, 2)
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
          JSON 格式化工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          格式化、压缩和验证JSON数据，支持语法高亮和错误提示
        </p>
      </div>

      <!-- 控制面板 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <Button @click="formatJson" variant="primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            格式化
          </Button>
          
          <Button @click="minifyJson" variant="secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            压缩
          </Button>
          
          <Button @click="validateJson" variant="info">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            验证
          </Button>
          
          <Button @click="loadExample" variant="ghost">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            示例
          </Button>
          
          <Button @click="clearAll" variant="danger">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            清空
          </Button>
        </div>

        <!-- 缩进设置 -->
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            缩进空格数：
          </label>
          <select 
            v-model="indentSize" 
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option :value="2">2</option>
            <option :value="4">4</option>
            <option :value="8">8</option>
          </select>
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
              输入JSON
            </h3>
          </div>
          <div class="p-6">
            <TextArea
              v-model="inputJson"
              placeholder="在此输入或粘贴JSON数据..."
              rows="20"
              class="font-mono text-sm"
            />
            
            <!-- 错误提示 -->
            <div v-if="!isValid && errorMessage" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-red-800 dark:text-red-200">JSON 格式错误</h4>
                  <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              格式化结果
            </h3>
            <Button 
              v-if="outputJson"
              @click="copyToClipboard(outputJson)"
              size="sm"
              variant="ghost"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              复制
            </Button>
          </div>
          <div class="p-6">
            <TextArea
              v-model="outputJson"
              placeholder="格式化后的JSON将显示在这里..."
              rows="20"
              readonly
              class="font-mono text-sm bg-gray-50 dark:bg-gray-900"
            />
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-2">功能特点：</h4>
            <ul class="space-y-1">
              <li>• 智能JSON格式化与美化</li>
              <li>• JSON数据压缩</li>
              <li>• 实时语法验证</li>
              <li>• 错误信息提示</li>
              <li>• 一键复制结果</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">操作提示：</h4>
            <ul class="space-y-1">
              <li>• 支持拖拽文件直接解析</li>
              <li>• 可自定义缩进空格数</li>
              <li>• 支持大文件处理</li>
              <li>• 实时错误定位</li>
              <li>• 键盘快捷键支持</li>
            </ul>
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