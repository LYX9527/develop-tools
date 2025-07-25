<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const originalText = ref('')
const encodedText = ref('')

// URL编码
const encodeUrl = () => {
  if (!originalText.value.trim()) {
    toast.warning('请输入要编码的文本')
    return
  }
  
  try {
    encodedText.value = encodeURIComponent(originalText.value)
    toast.success('URL编码成功！')
  } catch (error) {
    toast.error('编码失败')
  }
}

// URL解码
const decodeUrl = () => {
  if (!encodedText.value.trim()) {
    toast.warning('请输入要解码的URL文本')
    return
  }
  
  try {
    originalText.value = decodeURIComponent(encodedText.value)
    toast.success('URL解码成功！')
  } catch (error) {
    toast.error('解码失败，请检查URL格式是否正确')
  }
}

// 清空内容
const clearAll = () => {
  originalText.value = ''
  encodedText.value = ''
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
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          URL 编码工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          URL编码和解码工具，处理URL中的特殊字符
        </p>
      </div>

      <!-- 控制面板 -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50">
        <div class="flex flex-wrap items-center gap-4">
          <Button @click="encodeUrl" variant="primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
            </svg>
            编码
          </Button>
          
          <Button @click="decodeUrl" variant="secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
            解码
          </Button>
          
          <Button @click="clearAll" variant="danger">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            清空
          </Button>
        </div>
      </div>

      <!-- 转换区域 -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- 原始文本 -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              原始文本
            </h3>
            <Button 
              v-if="originalText"
              @click="copyToClipboard(originalText)"
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
              v-model="originalText"
              placeholder="在此输入要编码的URL文本..."
              rows="12"
              class="mb-4"
            />
            
            <!-- 字符统计 -->
            <div class="text-sm text-gray-500 dark:text-gray-400">
              字符数: {{ originalText.length }}
            </div>
          </div>
        </div>

        <!-- URL编码结果 -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              URL编码结果
            </h3>
            <Button 
              v-if="encodedText"
              @click="copyToClipboard(encodedText)"
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
              v-model="encodedText"
              placeholder="URL编码结果将显示在这里..."
              rows="12"
              class="font-mono text-sm mb-4"
            />
            
            <!-- 编码统计 -->
            <div class="text-sm text-gray-500 dark:text-gray-400">
              编码长度: {{ encodedText.length }}
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-2">URL编码：</h4>
            <ul class="space-y-1">
              <li>• 将特殊字符转换为%编码格式</li>
              <li>• 适用于URL参数传递</li>
              <li>• 支持中文和特殊符号</li>
              <li>• 确保URL安全传输</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">URL解码：</h4>
            <ul class="space-y-1">
              <li>• 将%编码还原为原始文本</li>
              <li>• 自动处理编码格式</li>
              <li>• 支持批量处理</li>
              <li>• 智能错误检测</li>
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