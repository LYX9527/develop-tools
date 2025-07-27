<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import {getGithubUsername, tools} from '@/tools'

const router = useRouter()
const route = useRoute()

// 工具数据 - 使用导入的工具信息

// 分类数据
const categories = [
  {id: 'all', name: '全部', count: tools.length},
  {id: 'text', name: '文本处理', count: tools.filter(t => t.category === 'text').length},
  {id: 'encode', name: '编码转换', count: tools.filter(t => t.category === 'encode').length},
  {id: 'generator', name: '生成器', count: tools.filter(t => t.category === 'generator').length},
  {id: 'converter', name: '转换器', count: tools.filter(t => t.category === 'converter').length},
  {id: 'design', name: '设计工具', count: tools.filter(t => t.category === 'design').length},
  {id: 'image', name: '图片处理', count: tools.filter(t => t.category === 'image').length},
  {id: 'security', name: '安全工具', count: tools.filter(t => t.category === 'security').length},
  {id: 'upload', name: '文件上传', count: tools.filter(t => t.category === 'upload').length},
  {id: 'utility', name: '实用工具', count: tools.filter(t => t.category === 'utility').length}
]

// 响应式状态
const searchQuery = ref('')
const activeCategory = ref('all')
const toolCards = ref<HTMLElement[]>([])
const isPageLoaded = ref(false)
const isAnimating = ref(false)
const isFirstVisit = ref(true)

// 检查是否为首次访问（通过sessionStorage判断）
const checkFirstVisit = () => {
  const hasVisited = sessionStorage.getItem('home-visited')
  if (hasVisited) {
    isFirstVisit.value = false
    isPageLoaded.value = true
  } else {
    sessionStorage.setItem('home-visited', 'true')
    isFirstVisit.value = true
  }
}

// 重置首次访问状态（开发调试用）
const resetFirstVisit = () => {
  sessionStorage.removeItem('home-visited')
  isFirstVisit.value = true
  isPageLoaded.value = false
}

// 搜索建议
const searchSuggestions = [
  '时间戳', 'base64', 'json', '二维码', '密码', '颜色', '正则', 'hash',
  '图片', '水印', 'ascii', '进制', '货币', 'yaml', 's3', '短链接'
]

// 获取随机搜索建议
const getRandomSuggestion = () => {
  return searchSuggestions[Math.floor(Math.random() * searchSuggestions.length)]
}

// 优化的滚动处理
const handleScroll = () => {
  if (!isPageLoaded.value || isAnimating.value) {
    return
  }
  // 这里可以添加滚动相关的逻辑
}

// 节流函数
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

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
    result = result.filter(tool => {
      // 搜索工具名称
      const nameMatch = tool.name.toLowerCase().includes(query)
      // 搜索工具描述
      const descriptionMatch = tool.description.toLowerCase().includes(query)
      // 搜索工具标签（如果存在）
      const tagsMatch = tool.tags && Array.isArray(tool.tags) ?
          tool.tags.some(tag => String(tag).toLowerCase().includes(query)) : false
      // 搜索作者信息（如果存在）
      const authorMatch = tool.author ? tool.author.toLowerCase().includes(query) : false
      // 搜索分类信息
      const categoryMatch = categories.find(cat => cat.id === tool.category)?.name.toLowerCase().includes(query) || false

      return nameMatch || descriptionMatch || tagsMatch || authorMatch || categoryMatch
    })
  }

  return result
})

// 方法
const navigateToTool = (route: string) => {
  router.push(route)
}

const setCategory = (categoryId: string) => {
  if (isAnimating.value) return

  activeCategory.value = categoryId
  isAnimating.value = true

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
        ease: "back.out(1.7)",
        onComplete: () => {
          isAnimating.value = false
        }
      }
    )
  })
}

// 监听路由变化，同步搜索框内容
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    searchQuery.value = newSearch
  } else if (!newSearch) {
    searchQuery.value = ''
  }
}, {immediate: true})

// 监听路由变化，处理返回导航
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    // 如果是返回首页，检查访问状态
    checkFirstVisit()
  }
})

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
            {opacity: 0.3, y: 10, scale: 0.95},
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
  // 检查是否首次访问
  checkFirstVisit()
  
  // 添加滚动事件监听（节流处理）
  const throttledScroll = throttle(handleScroll, 16) // 约60fps
  document.addEventListener('scroll', throttledScroll, { passive: true })
  
  // 如果不是首次访问，跳过动画
  if (!isFirstVisit.value) {
    isAnimating.value = false
    return
  }
  
  // 延迟标记页面加载完成，确保DOM完全渲染
  setTimeout(() => {
    isPageLoaded.value = true
  }, 100)
  
  // 只在首次访问时播放动画
  // 标题动画
  gsap.fromTo('.hero-title',
    {opacity: 0, y: -50},
    {opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)"}
  )

  // 副标题动画
  gsap.fromTo('.hero-subtitle',
    {opacity: 0, y: 30},
    {opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out"}
  )

  // 搜索框动画
  gsap.fromTo('.search-section',
    {opacity: 0, scale: 0.8},
    {opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: "back.out(1.7)"}
  )

  // 分类标签动画
  gsap.fromTo('.category-tags .tag-item',
    {opacity: 0, x: -20},
    {opacity: 1, x: 0, duration: 0.6, delay: 0.9, stagger: 0.1, ease: "power3.out"}
  )

  // 工具卡片动画
  gsap.fromTo('.tool-card',
    {opacity: 0, y: 50, scale: 0.8},
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      delay: 1.2,
      stagger: 0.1,
      ease: "back.out(1.7)",
      onComplete: () => {
        // 所有动画完成后标记为非动画状态
        isAnimating.value = false
      }
    }
  )
})

// 清理事件监听器
onUnmounted(() => {
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }

  // 移除滚动事件监听
  const throttledScroll = throttle(handleScroll, 16)
  document.removeEventListener('scroll', throttledScroll)
})
</script>

<template>
  <div
      class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden transition-colors duration-500"
      :class="{ 
        'loading': !isPageLoaded,
        'instant-show': !isFirstVisit
      }"
  >
    <!-- 动态背景 -->
    <div class="absolute inset-0">
      <!-- 渐变网格 -->
      <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <!-- 动态光效 -->
      <div
          class="absolute top-0 -left-4 w-72 h-72 bg-blue-400 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-70 animate-blob"></div>
      <div
          class="absolute top-0 -right-4 w-72 h-72 bg-pink-400 dark:bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-70 animate-blob animation-delay-2000"></div>
      <div
          class="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 dark:opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Hero Section -->
    <div class="relative z-10 pt-32 pb-20">
      <div class="relative max-w-7xl mx-auto px-8 text-center">
        <!-- 闪光动效 -->
        <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-20"></div>

        <h1 class="hero-title text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-8 leading-tight">
          开发者工具箱
        </h1>
        <div
            class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 mx-auto mb-8 rounded-full"></div>
        <p class="hero-subtitle text-xl md:text-2xl text-gray-700 dark:text-white/80 mb-16 max-w-4xl mx-auto font-light leading-relaxed">
          现代化的开发者在线工具集合 ✨<br/>
          <span class="text-lg text-gray-600 dark:text-white/60">提供高效便捷的开发辅助功能，让编程更有趣</span><br/>
          <span class="text-sm text-gray-500 dark:text-white/50 mt-4 block">
             搜索提示：可按工具名称、功能描述、标签或作者进行搜索
          </span>
        </p>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div
          class="backdrop-blur-md bg-white/60 dark:bg-white/5 border border-gray-200/30 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="group">
            <div
                class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {{ tools.length }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">开发工具</div>
          </div>
          <div class="group">
            <div
                class="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {{ categories.length - 1 }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">工具分类</div>
          </div>
          <div class="group">
            <div
                class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {{ new Set(tools.map(t => t.author).filter(Boolean)).size }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">贡献者</div>
          </div>
          <div class="group">
            <div
                class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {{ filteredTools.length }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">当前显示</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div
          class="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-3xl p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white/90 text-center mb-6">工具分类</h3>
        <div class="category-tags flex flex-wrap justify-center gap-2">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
            :class="[
              activeCategory === category.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-purple-500 text-white shadow-lg'
                : 'bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 text-gray-700 dark:text-white/80 hover:bg-white/90 dark:hover:bg-white/20 shadow-md hover:shadow-lg'
            ]"
            class="tag-item group relative px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 elegant-button"
          >
            <!-- 简洁光效 -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-cyan-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300 gentle-glow"></div>

            <div class="relative flex items-center space-x-1.5">
              <span class="font-medium text-sm transition-all duration-300 group-hover:font-semibold">{{ category.name }}</span>
              <span
                :class="[
                  activeCategory === category.id
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-100/80 dark:bg-white/15 text-gray-600 dark:text-white/70 group-hover:bg-gray-200/80 dark:group-hover:bg-white/20'
                ]"
                class="px-1.5 py-0.5 text-xs rounded-full font-semibold min-w-[20px] text-center transition-all duration-300 count-badge"
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
            class="tool-card group relative cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-4"
            @click="navigateToTool(tool.route)"
        >
          <!-- 卡片容器 -->
          <div
              class="relative bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-cyan-500/25 hover:border-gray-300/50 dark:hover:border-white/40 transition-all duration-500 overflow-hidden h-80 flex flex-col">
            <!-- 动态光效背景 -->
            <div
                :class="tool.color"
                class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-3xl"
            ></div>

            <!-- 闪光效果 -->
            <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/10 dark:via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <!-- 内容 -->
            <div class="relative z-10 flex flex-col h-full justify-between">
              <!-- 上部分：图标和标题 -->
              <div class="flex-shrink-0">
                <!-- 图标容器 -->
                <div class="flex items-center justify-center mb-6">
                  <div class="relative">
                    <!-- 图标背景光环 -->
                    <div
                        :class="tool.color"
                        class="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 group-hover:opacity-40 blur-lg transition-all duration-500 transform group-hover:scale-110"
                    ></div>
                    <div
                        :class="tool.color"
                        class="relative w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl"
                    >
                      <!-- 支持Vue组件图标 -->
                      <component
                          :is="tool.icon"
                          v-if="typeof tool.icon === 'object' && tool.icon !== null"
                          class="w-10 h-10 text-white"
                      />
                      <!-- 支持字符串图标 -->
                      <span
                          v-else
                          class="text-white font-bold"
                      >
                        {{ tool.icon }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 标题 -->
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors duration-300">
                  {{ tool.name }}
                </h3>
              </div>

              <!-- 下部分：描述和 Powered By -->
              <div class="flex-grow flex flex-col justify-end">
                <!-- 描述 -->
                <p class="text-gray-600 dark:text-white/70 text-center text-sm leading-relaxed group-hover:text-gray-800 dark:group-hover:text-white/90 transition-colors duration-300 mb-4 line-clamp-3">
                  {{ tool.description }}
                </p>

                <!-- Powered By GitHub -->
                <div v-if="tool.github" class="text-center">
                <a
                  :href="tool.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-300 group/link"
                  @click.stop
                >
                  <!-- GitHub 图标 -->
                     <svg class="w-4 h-4 opacity-70 group-hover/link:opacity-100 transition-opacity duration-300"
                          fill="currentColor" viewBox="0 0 24 24">
                       <path
                                                       d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span class="font-mono">Powered by {{ getGithubUsername(tool.github) }}</span>
                </a>
              </div>

              <!-- 装饰线条 -->
              <div class="flex justify-center">
                <div
                  class="w-16 h-1 bg-gradient-to-r rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
                  :class="tool.color"
                ></div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div v-if="filteredTools.length === 0" class="relative z-10 text-center py-20">
        <div
            class="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-3xl p-12 mx-4 shadow-2xl">
          <div class="text-8xl mb-6 opacity-50">🔍</div>
          <h3 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">未找到相关工具</h3>
          <p class="text-gray-600 dark:text-white/70 text-lg">尝试调整搜索条件或选择其他分类</p>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div
        class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
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

/* 文本截断 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* 加载状态优化 */
.loading {
  overflow: hidden;
  pointer-events: none;
}

.loading * {
  animation-play-state: paused !important;
  transition: none !important;
}

/* 非首次访问即时显示 */
.instant-show .hero-title,
.instant-show .hero-subtitle,
.instant-show .search-section,
.instant-show .category-tags .tag-item,
.instant-show .tool-card {
  opacity: 1 !important;
  transform: none !important;
}

.instant-show * {
  animation: none !important;
  transition: all 0.3s ease !important;
}

/* 滚动性能优化 */
.tool-card {
  will-change: transform;
  transform: translateZ(0);
}

.elegant-button {
  will-change: transform;
  transform: translateZ(0);
}

/* 减少重绘重排 */
.hero-title, .hero-subtitle {
  will-change: transform, opacity;
}

/* 优雅按钮效果 */
.elegant-button {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.elegant-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateY(-50%);
  transition: left 0.6s ease-in-out;
  z-index: 1;
}

.elegant-button:hover::before {
  left: 100%;
}

.gentle-glow {
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15), transparent 70%);
  transform: scale(1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.elegant-button:hover .gentle-glow {
  transform: scale(1.1);
  opacity: 1 !important;
}

.elegant-button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease-in-out;
}

/* 悬停时的微妙阴影变化 */
.elegant-button:hover {
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(59, 130, 246, 0.1);
}

.dark .elegant-button:hover {
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.3),
              0 4px 6px -2px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(34, 211, 238, 0.2);
}

/* 活跃状态的微妙脉动 */
.elegant-button.active-category {
  animation: gentlePulse 3s ease-in-out infinite;
}

@keyframes gentlePulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
}

/* 文字过渡效果 */
.elegant-button span {
  position: relative;
  z-index: 2;
}

/* 数字标签的微妙动画 */
.elegant-button:hover .count-badge {
  transform: translateY(-1px);
}

.count-badge {
  transition: transform 0.2s ease-out;
}
</style>
