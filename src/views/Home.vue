<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { gsap } from 'gsap'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Tag from '@/components/ui/Tag.vue'

const router = useRouter()
const route = useRoute()

// 工具数据
interface Tool {
  name: string
  title: string
  description: string
  icon: string
  category: string
  route: string
  color: string
}

const tools: Tool[] = [
  {
    name: 'JsonFormatter',
    title: 'JSON 格式化',
    description: '格式化和美化JSON数据',
    icon: '{ }',
    category: 'text',
    route: '/tools/json-formatter',
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Base64Converter',
    title: 'Base64 转换',
    description: 'Base64编码和解码工具',
    icon: '🔤',
    category: 'encode',
    route: '/tools/base64-converter',
    color: 'from-green-500 to-green-600'
  },
  {
    name: 'UrlEncoder',
    title: 'URL 编码',
    description: 'URL编码和解码工具',
    icon: '🔗',
    category: 'encode',
    route: '/tools/url-encoder',
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'ColorPicker',
    title: '颜色选择器',
    description: '颜色选择和转换工具',
    icon: '🎨',
    category: 'design',
    route: '/tools/color-picker',
    color: 'from-pink-500 to-pink-600'
  },
  {
    name: 'QrCodeGenerator',
    title: '二维码生成',
    description: '生成各种格式的二维码',
    icon: '📱',
    category: 'generator',
    route: '/tools/qr-code-generator',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    name: 'PasswordGenerator',
    title: '密码生成器',
    description: '生成安全的随机密码',
    icon: '🔐',
    category: 'generator',
    route: '/tools/password-generator',
    color: 'from-red-500 to-red-600'
  },
  {
    name: 'RegexTester',
    title: '正则表达式测试',
    description: '测试和验证正则表达式',
    icon: '⚡',
    category: 'text',
    route: '/tools/regex-tester',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    name: 'TimestampConverter',
    title: '时间戳转换',
    description: '时间戳和日期格式转换',
    icon: '⏰',
    category: 'converter',
    route: '/tools/timestamp-converter',
    color: 'from-teal-500 to-teal-600'
  },
  {
    name: 'HashGenerator',
    title: '哈希生成器',
    description: '生成MD5、SHA等哈希值',
    icon: '#️⃣',
    category: 'encode',
    route: '/tools/hash-generator',
    color: 'from-orange-500 to-orange-600'
  },
  {
    name: 'ImageOptimizer',
    title: '图片优化',
    description: '压缩和优化图片',
    icon: '🖼️',
    category: 'image',
    route: '/tools/image-optimizer',
    color: 'from-cyan-500 to-cyan-600'
  }
]

// 分类数据
const categories = [
  { id: 'all', name: '全部', count: tools.length },
  { id: 'text', name: '文本处理', count: tools.filter(t => t.category === 'text').length },
  { id: 'encode', name: '编码转换', count: tools.filter(t => t.category === 'encode').length },
  { id: 'generator', name: '生成器', count: tools.filter(t => t.category === 'generator').length },
  { id: 'converter', name: '转换器', count: tools.filter(t => t.category === 'converter').length },
  { id: 'design', name: '设计工具', count: tools.filter(t => t.category === 'design').length },
  { id: 'image', name: '图片处理', count: tools.filter(t => t.category === 'image').length },
]

// 响应式状态
const searchQuery = ref('')
const activeCategory = ref('all')
const toolCards = ref<HTMLElement[]>([])

// 计算属性
const filteredTools = computed(() => {
  let result = tools

  // 分类过滤
  if (activeCategory.value !== 'all') {
    result = result.filter(tool => tool.category === activeCategory.value)
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
    )
  }

  return result
})

// 方法
const navigateToTool = (route: string) => {
  router.push(route)
}

const setCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  
  // 为工具卡片添加重新进入动画
  nextTick(() => {
    gsap.fromTo(toolCards.value, 
      { opacity: 0, y: 20, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }
    )
  })
}

// 监听路由查询参数
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    searchQuery.value = newSearch
  } else {
    // 当搜索参数被清空时，重置搜索框和分类筛选
    const wasSearching = searchQuery.value.trim() !== ''
    searchQuery.value = ''
    
    // 如果之前有搜索内容，现在被清空了，重新触发动画
    if (wasSearching) {
      nextTick(() => {
        gsap.fromTo(toolCards.value, 
          { opacity: 0, y: 20, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)"
          }
        )
      })
    }
  }
}, { immediate: true })

// 监听搜索内容变化，为筛选结果添加动画
let animationTimeout: NodeJS.Timeout
watch(filteredTools, () => {
  // 清除之前的动画定时器
  if (animationTimeout) clearTimeout(animationTimeout)
  
  // 延迟执行动画，避免频繁触发
  animationTimeout = setTimeout(() => {
    nextTick(() => {
      if (toolCards.value.length > 0) {
        gsap.fromTo(toolCards.value, 
          { opacity: 0.3, y: 10, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out"
          }
        )
      }
    })
  }, 100)
})

// 生命周期
onMounted(() => {
  // 标题动画
  gsap.fromTo('.hero-title', 
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
  )
  
  // 副标题动画
  gsap.fromTo('.hero-subtitle', 
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
  )
  
  // 搜索框动画
  gsap.fromTo('.search-section', 
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: "back.out(1.7)" }
  )
  
  // 分类标签动画
  gsap.fromTo('.category-tags .tag-item', 
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.6, delay: 0.9, stagger: 0.1, ease: "power3.out" }
  )
  
  // 工具卡片动画
  gsap.fromTo('.tool-card', 
    { opacity: 0, y: 50, scale: 0.8 },
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: 0.8,
      delay: 1.2,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }
  )
})

// 清理定时器
onUnmounted(() => {
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden transition-colors duration-500">
    <!-- 动态背景 -->
    <div class="absolute inset-0">
      <!-- 渐变网格 -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <!-- 动态光效 -->
      <div class="absolute top-0 -left-4 w-72 h-72 bg-blue-400 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-70 animate-blob"></div>
      <div class="absolute top-0 -right-4 w-72 h-72 bg-pink-400 dark:bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-70 animate-blob animation-delay-4000"></div>
    </div>
    
        <!-- Hero Section -->
    <div class="relative z-10 pt-32 pb-20">
      <div class="relative max-w-7xl mx-auto px-8 text-center">
        <!-- 闪光动效 -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-20"></div>
        
        <h1 class="hero-title text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-8 leading-tight">
          开发者工具箱
        </h1>
        <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 mx-auto mb-8 rounded-full"></div>
        <p class="hero-subtitle text-xl md:text-2xl text-gray-700 dark:text-white/80 mb-16 max-w-4xl mx-auto font-light leading-relaxed">
          现代化的开发者在线工具集合 ✨<br/>
          <span class="text-lg text-gray-600 dark:text-white/60">提供高效便捷的开发辅助功能，让编程更有趣</span>
        </p>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div class="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90 text-center mb-8">工具分类</h3>
        <div class="category-tags flex flex-wrap justify-center gap-4">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
            class="tag-item group relative px-8 py-4 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
            :class="[
              activeCategory === category.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-purple-500 text-white shadow-2xl shadow-blue-500/25 dark:shadow-cyan-500/25'
                : 'bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 text-gray-700 dark:text-white/80 hover:bg-white/90 dark:hover:bg-white/20 hover:border-gray-300/50 dark:hover:border-white/30 shadow-xl'
            ]"
          >
            <!-- 光效 -->
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-cyan-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative flex items-center space-x-3">
              <span class="font-semibold text-lg">{{ category.name }}</span>
              <span 
                class="px-3 py-1 text-sm rounded-full font-bold"
                :class="[
                  activeCategory === category.id
                    ? 'bg-white/30 text-white'
                    : 'bg-gray-100/70 dark:bg-white/20 text-gray-600 dark:text-white/70'
                ]"
              >
                {{ category.count }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 工具网格 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div
          v-for="tool in filteredTools"
          :key="tool.name"
          ref="toolCards"
          @click="navigateToTool(tool.route)"
          class="tool-card group relative cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-4"
        >
          <!-- 卡片容器 -->
          <div class="relative bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-cyan-500/25 hover:border-gray-300/50 dark:hover:border-white/40 transition-all duration-500 overflow-hidden">
            <!-- 动态光效背景 -->
            <div 
              class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-3xl"
              :class="tool.color"
            ></div>
            
            <!-- 闪光效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/10 dark:via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <!-- 内容 -->
            <div class="relative z-10">
              <!-- 图标容器 -->
              <div class="flex items-center justify-center mb-6">
                <div class="relative">
                  <!-- 图标背景光环 -->
                  <div 
                    class="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 group-hover:opacity-40 blur-lg transition-all duration-500 transform group-hover:scale-110"
                    :class="tool.color"
                  ></div>
                  <div 
                    class="relative w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl"
                    :class="tool.color"
                  >
                    <span class="text-white font-bold">{{ tool.icon }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 标题 -->
              <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors duration-300">
                {{ tool.title }}
              </h3>
              
              <!-- 描述 -->
              <p class="text-gray-600 dark:text-white/70 text-center text-base leading-relaxed group-hover:text-gray-800 dark:group-hover:text-white/90 transition-colors duration-300">
                {{ tool.description }}
              </p>
              
              <!-- 装饰线条 -->
              <div class="mt-6 flex justify-center">
                <div 
                  class="w-16 h-1 bg-gradient-to-r rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
                  :class="tool.color"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无结果提示 -->
      <div v-if="filteredTools.length === 0" class="relative z-10 text-center py-20">
        <div class="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-3xl p-12 mx-4 shadow-2xl">
          <div class="text-8xl mb-6 opacity-50">🔍</div>
          <h3 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">未找到相关工具</h3>
          <p class="text-gray-600 dark:text-white/70 text-lg">尝试调整搜索条件或选择其他分类</p>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
  </div>
</template>

<style scoped>
/* 动画延迟 */
.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* 流动的光点动画 */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

/* 渐变文字动画 */
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-title {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.tool-card:hover {
  animation: float 2s ease-in-out infinite;
}

/* 脉冲光环 */
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.tool-card:hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-ring 1.5s ease-out infinite;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.05);
}

.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #06b6d4, #8b5cf6);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #2563eb, #7c3aed);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #0891b2, #7c3aed);
}

/* 玻璃质感效果 */
.backdrop-blur-md {
  backdrop-filter: blur(16px);
}

/* 霓虹光效 */
.shadow-blue-500\/25 {
  box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
}

.shadow-cyan-500\/25 {
  box-shadow: 0 25px 50px -12px rgba(6, 182, 212, 0.25);
}

/* 响应式优化 */
@media (max-width: 640px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .tool-card {
    margin-bottom: 1rem;
  }
}
</style> 