<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {gsap} from 'gsap'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import {tools as toolsData} from '@/tools'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const isMobileMenuOpen = ref(false)
const searchInputRef = ref<HTMLInputElement>()
const mobileSearchInputRef = ref<HTMLInputElement>()
const spotlightSearchInputRef = ref<HTMLInputElement>()
const isSpotlightOpen = ref(false)
const selectedResultIndex = ref(0)

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase()
  return toolsData.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
  ).slice(0, 5) // 限制显示5个结果
})

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/',
      query: {search: searchQuery.value.trim()}
    })
  } else {
    // 如果搜索内容为空，清空URL参数
    router.push({
      path: '/',
      query: {}
    })
  }
}

// 监听搜索框变化，自动清空URL参数
watch(searchQuery, (newValue, oldValue) => {
  // 当搜索框从有内容变为空时，清空URL参数
  if (oldValue && oldValue.trim() && (!newValue || !newValue.trim())) {
    if (route.query.search) {
      router.push({
        path: '/',
        query: {}
      })
    }
  }
})

// 监听路由变化，同步搜索框内容
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    searchQuery.value = newSearch
  } else if (!newSearch) {
    searchQuery.value = ''
  }
}, {immediate: true})

// 返回首页
const goHome = () => {
  router.push('/')
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  selectedResultIndex.value = 0
  // 立即清空URL参数
  router.push({
    path: '/',
    query: {}
  })
}

// Spotlight搜索控制
const openSpotlight = () => {
  isSpotlightOpen.value = true
  selectedResultIndex.value = 0
  // 延迟聚焦，等待动画完成
  setTimeout(() => {
    spotlightSearchInputRef.value?.focus()
    // 添加GSAP动画
    gsap.fromTo('.spotlight-container',
        {
          scale: 0.8,
          opacity: 0,
          y: -100,
          rotationX: -15
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
    )
  }, 50)
}

const closeSpotlight = () => {
  // 添加关闭动画
  gsap.to('.spotlight-container', {
    scale: 0.9,
    opacity: 0,
    y: -50,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      isSpotlightOpen.value = false
      spotlightSearchInputRef.value?.blur()
      // 重置选中索引
      selectedResultIndex.value = 0
    }
  })
}

const handleSpotlightSearch = () => {
  if (searchQuery.value.trim()) {
    // 如果有搜索结果，跳转到选中的结果
    if (searchResults.value.length > 0) {
      const selectedTool = searchResults.value[selectedResultIndex.value] || searchResults.value[0]
      navigateToTool(selectedTool.route)
    } else {
      // 否则执行普通搜索
      handleSearch()
    }
    closeSpotlight()
  }
}

// 处理键盘导航
const handleSpotlightKeyDown = (event: KeyboardEvent) => {
  if (!searchResults.value.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedResultIndex.value = Math.min(selectedResultIndex.value + 1, searchResults.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, 0)
  }
}

// 重置选中索引
watch(searchResults, () => {
  selectedResultIndex.value = 0
})

// 跳转到工具页面
const navigateToTool = (route: string) => {
  router.push(route)
}

// 键盘快捷键
const handleKeyDown = (event: KeyboardEvent) => {
  // 按 '/' 键打开Spotlight搜索
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    // 如果当前焦点不在输入框内
    const activeElement = document.activeElement
    if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      // 如果移动端菜单打开，则聚焦移动端搜索框
      if (isMobileMenuOpen.value) {
        mobileSearchInputRef.value?.focus()
      } else {
        // 桌面端打开Spotlight搜索
        openSpotlight()
      }
    }
  }

  // 按 Escape 键处理
  if (event.key === 'Escape') {
    if (isSpotlightOpen.value) {
      // 如果Spotlight打开，则关闭它
      closeSpotlight()
    } else {
      // 否则处理其他焦点
      searchInputRef.value?.blur()
      mobileSearchInputRef.value?.blur()
      if (isMobileMenuOpen.value) {
        isMobileMenuOpen.value = false
      }
    }
  }
}

// 动画
onMounted(() => {
  gsap.fromTo('.navbar',
      {y: -100, opacity: 0},
      {y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)"}
  )

  // 搜索框入场动画
  gsap.fromTo('.search-container',
      {scale: 0.9, opacity: 0},
      {scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: "back.out(1.7)"}
  )

  // 移动端搜索框动画
  gsap.fromTo('.search-container-mobile',
      {x: -20, opacity: 0},
      {x: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: "power2.out"}
  )

  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown)
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <nav
      class="navbar fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 shadow-2xl transition-colors duration-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <button
              @click="goHome"
              class="flex items-center space-x-3 group"
          >
            <div
                class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2"></path>
              </svg>
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                开发者工具箱
              </h1>
            </div>
          </button>
        </div>

        <!-- 搜索框 (桌面端) -->
        <div class="hidden md:flex items-center flex-1 max-w-lg mx-8">
          <div class="relative w-full group search-container">
            <!-- 搜索框光效背景 -->
            <div
                class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-cyan-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>

            <!-- 搜索框容器 -->
            <div
                class="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/80 dark:border-white/20 rounded-2xl shadow-lg group-hover:shadow-xl group-focus-within:shadow-2xl group-hover:border-gray-300/80 dark:group-hover:border-white/30 group-focus-within:border-blue-400/50 dark:group-focus-within:border-cyan-400/50 transition-all duration-300">
              <!-- 内部光效 -->
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <!-- 搜索图标 -->
              <div class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <div class="relative">
                  <div
                      class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 rounded-full blur-sm opacity-0 group-focus-within:opacity-60 transition-opacity duration-300"></div>
                  <svg
                      class="relative w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-cyan-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-300 transition-colors duration-300"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              <!-- 输入框 -->
              <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  @keyup.enter="handleSearch"
                  placeholder="搜索工具..."
                  class="w-full pl-12 pr-16 py-3.5 bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:outline-none text-sm font-medium"
              />

              <!-- 清空按钮 -->
              <button
                  v-if="searchQuery.trim()"
                  @click="clearSearch"
                  class="clear-button absolute right-16 top-1/2 transform -translate-y-1/2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-gray-300/80 dark:bg-gray-600/80 hover:bg-gray-400/80 dark:hover:bg-gray-500/80 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-200 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <!-- 快捷键提示 -->
              <div v-if="!searchQuery.trim()"
                   class="absolute right-3 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center">
                <div
                    class="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-100/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-200/50 dark:border-gray-700/50 group-focus-within:hidden">
                  <span class="bg-gray-200/80 dark:bg-gray-700/80 px-1.5 py-0.5 rounded text-xs font-mono">/</span>
                  <span class="text-gray-300 dark:text-gray-600">Spotlight</span>
                </div>
              </div>

              <!-- 搜索按钮 (聚焦时显示) -->
              <button
                  @click="handleSearch"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:hover:from-cyan-400 dark:hover:to-purple-400 text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧按钮 -->
        <div class="flex items-center space-x-4">
          <!-- 博客链接 -->
          <a
              class="hidden sm:flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 group hover:scale-105 active:scale-95"
              href="https://blog.yltfspace.com/"
              rel="noopener noreferrer"
              target="_blank"
              title="访问开发者博客"
          >
            <svg
                class="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:rotate-12"
                version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M512 348.028928c-64.937984 0-124.901376 21.38112-173.221888 57.491456V146.255872c0-27.404288-26.079232-49.620992-58.232832-49.620992-32.147456 0-58.228736 22.216704-58.228736 49.620992V651.204608c0 2.799616 0.28672 5.541888 0.811008 8.214528 11.114496 149.829632 136.2432 267.945984 288.872448 267.945984 160.02048 0 289.681408-129.691648 289.681408-289.66912S672.02048 348.028928 512 348.028928z m0 479.862784c-90.0096 0-165.451776-62.5664-185.174016-146.5856a190.754816 190.754816 0 0 1-5.031936-43.608064c0-28.049408 6.080512-54.677504 16.984064-78.647296 29.93152-65.796096 96.251904-111.54432 173.221888-111.54432 105.070592 0 190.208 85.153792 190.208 190.193664 0 105.035776-85.137408 190.191616-190.208 190.191616z" fill="currentColor"/>
            </svg>
          </a>
          <!-- GitHub 链接 -->
          <a
              href="https://github.com/LYX9527/develop-tools"
              target="_blank"
              rel="noopener noreferrer"
              class="hidden sm:flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 group hover:scale-105 active:scale-95"
              title="查看项目源码"
          >
            <svg
                class="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:rotate-12"
                fill="currentColor" viewBox="0 0 24 24">
              <path
                  d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

          <!-- 主题切换 -->
          <ThemeToggle/>

          <!-- 移动端菜单按钮 -->
          <button
              @click="toggleMobileMenu"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-700 dark:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 移动端菜单 -->
      <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform -translate-y-2"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-2"
      >
        <div v-show="isMobileMenuOpen"
             class="md:hidden border-t border-gray-200/50 dark:border-white/10 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <!-- 移动端搜索 -->
          <div class="mb-4">
            <div class="relative group search-container-mobile">
              <!-- 移动端搜索框光效 -->
              <div
                  class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-cyan-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>

              <!-- 移动端搜索框容器 -->
              <div
                  class="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/80 dark:border-white/20 rounded-2xl shadow-lg group-hover:shadow-xl group-focus-within:shadow-2xl group-hover:border-gray-300/80 dark:group-hover:border-white/30 group-focus-within:border-blue-400/50 dark:group-focus-within:border-cyan-400/50 transition-all duration-300">
                <!-- 内部光效 -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <!-- 搜索图标 -->
                <div class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div class="relative">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 rounded-full blur-sm opacity-0 group-focus-within:opacity-60 transition-opacity duration-300"></div>
                    <svg
                        class="relative w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-cyan-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-300 transition-colors duration-300"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>

                <!-- 输入框 -->
                <input
                    ref="mobileSearchInputRef"
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                    placeholder="搜索工具..."
                    class="w-full pl-12 pr-10 py-3.5 bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:outline-none text-sm font-medium"
                />

                <!-- 移动端清空按钮 -->
                <button
                    v-if="searchQuery.trim()"
                    @click="clearSearch"
                    class="clear-button absolute right-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300/80 dark:bg-gray-600/80 hover:bg-gray-400/80 dark:hover:bg-gray-500/80 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-200"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                          d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 移动端按钮 -->
          <div class="space-y-2">
            <a
                href="https://github.com/liyixing/develop-tools-v2"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300 group hover:scale-105 active:scale-95"
            >
              <svg class="w-5 h-5 group-hover:rotate-12 transition-all duration-300" fill="currentColor"
                   viewBox="0 0 24 24">
                <path
                    d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>查看项目源码</span>
            </a>
          </div>
        </div>
      </Transition>
    </div>
  </nav>

  <!-- Spotlight 搜索模态框 -->
  <Teleport to="body">
    <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div
          v-if="isSpotlightOpen"
          class="fixed inset-0 z-[9999] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          @click="closeSpotlight"
      >
        <!-- Spotlight 搜索框容器 -->
        <div class="flex items-start justify-center pt-32 px-4">
          <Transition
              enter-active-class="transition-all duration-500 ease-out"
              enter-from-class="opacity-0 scale-90 translate-y-[-100px]"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-[-50px]"
          >
            <div
                v-if="isSpotlightOpen"
                class="spotlight-container w-full max-w-2xl"
                @click.stop
            >
              <!-- Spotlight 搜索框 -->
              <div class="relative group">
                <!-- 外部光效 -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 dark:from-cyan-500/30 dark:via-purple-500/30 dark:to-pink-500/30 rounded-3xl blur-2xl opacity-60"></div>

                <!-- 搜索框主体 -->
                <div
                    class="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                  <!-- 内部光效 -->
                  <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>

                  <!-- 搜索内容 -->
                  <div class="relative p-8">
                    <!-- 搜索图标和输入框 -->
                    <div class="flex items-center space-x-6">
                      <!-- 搜索图标 -->
                      <div class="relative">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 rounded-full blur-md opacity-60"></div>
                        <div
                            class="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          </svg>
                        </div>
                      </div>

                      <!-- 输入框 -->
                      <div class="flex-1">
                        <input
                            ref="spotlightSearchInputRef"
                            v-model="searchQuery"
                            @keyup.enter="handleSpotlightSearch"
                            @keyup.escape="closeSpotlight"
                            @keydown="handleSpotlightKeyDown"
                            placeholder="搜索工具..."
                            class="w-full text-2xl font-medium bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                        />
                      </div>

                      <!-- 快捷键提示 -->
                      <div class="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500">
                        <div class="flex items-center space-x-2">
                          <span class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">⏎</span>
                          <span>搜索</span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <span class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">esc</span>
                          <span>关闭</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 搜索结果 -->
              <div v-if="searchQuery.trim()" class="mt-4">
                <div
                    class="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-2xl shadow-xl overflow-hidden">
                  <!-- 搜索结果标题 -->
                  <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div class="flex items-center justify-between">
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        找到 {{ searchResults.length }} 个工具
                      </div>
                      <div v-if="searchResults.length > 0" class="text-xs text-gray-500 dark:text-gray-500">
                        ⏎ 打开第一个结果
                      </div>
                    </div>
                  </div>

                  <!-- 搜索结果列表 -->
                  <div v-if="searchResults.length > 0" class="max-h-80 overflow-y-auto spotlight-results">
                    <div
                        v-for="(tool, index) in searchResults"
                        :key="tool.route"
                        @click="navigateToTool(tool.route); closeSpotlight()"
                        class="spotlight-result-item flex items-center space-x-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                        :class="{
                        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 spotlight-result-selected': index === selectedResultIndex
                      }"
                    >
                      <!-- 工具图标 -->
                      <div
                          class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                        <!-- 支持Vue组件图标 -->
                        <component
                          :is="tool.icon"
                          v-if="typeof tool.icon === 'object' && tool.icon !== null"
                          class="w-6 h-6 text-white"
                        />
                        <!-- 支持字符串图标 -->
                        <span
                          v-else
                          class="text-white font-semibold"
                        >
                          {{ tool.icon }}
                        </span>
                      </div>

                      <!-- 工具信息 -->
                      <div class="flex-1 min-w-0">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {{ tool.name }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {{ tool.description }}
                        </p>
                      </div>

                      <!-- 快捷键提示 -->
                      <div v-if="index === selectedResultIndex"
                           class="spotlight-key-hint text-xs text-gray-400 dark:text-gray-500 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        ⏎
                      </div>
                    </div>
                  </div>

                  <!-- 无结果 -->
                  <div v-else class="px-6 py-8 text-center">
                    <div class="text-gray-400 dark:text-gray-500 mb-2">
                      <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <div class="text-gray-600 dark:text-gray-400 mb-1">未找到相关工具</div>
                    <div class="text-sm text-gray-500 dark:text-gray-500">
                      按 ⏎ 在首页搜索 "{{ searchQuery }}"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 自定义样式 */
.navbar {
  backdrop-filter: blur(8px);
}

/* 搜索框动画效果 */
.group:hover .search-glow {
  animation: searchGlow 2s ease-in-out infinite;
}

.group:focus-within .search-pulse {
  animation: searchPulse 1.5s ease-in-out infinite;
}

@keyframes searchGlow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes searchPulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

/* 搜索框悬停效果 */
.group:hover input::placeholder {
  color: rgb(59 130 246 / 0.7);
}

.dark .group:hover input::placeholder {
  color: rgb(34 211 238 / 0.7);
}

/* 搜索框聚焦效果 */
.group:focus-within input::placeholder {
  color: rgb(59 130 246 / 0.5);
}

.dark .group:focus-within input::placeholder {
  color: rgb(34 211 238 / 0.5);
}

/* 搜索按钮动画 */
@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.group:focus-within button {
  animation: slideInRight 0.3s ease-out;
}

/* 清空按钮动画 */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.clear-button {
  animation: fadeInScale 0.2s ease-out;
}

/* 清空按钮悬停效果 */
.clear-button:hover {
  background-color: rgb(156 163 175 / 0.9);
}

.dark .clear-button:hover {
  background-color: rgb(75 85 99 / 0.9);
}

/* Spotlight搜索动画效果 */
.spotlight-container {
  animation: spotlightEntrance 0.5s ease-out;
}

@keyframes spotlightEntrance {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-100px);
  }
  60% {
    opacity: 1;
    transform: scale(1.02) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Spotlight搜索框脉动效果 */
.spotlight-container .group:hover .absolute {
  animation: spotlightGlow 2s ease-in-out infinite;
}

@keyframes spotlightGlow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Spotlight输入框聚焦效果 */
.spotlight-container input:focus + * {
  animation: focusGlow 0.3s ease-out;
}

@keyframes focusGlow {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 渐变呼吸效果 */
.spotlight-container .relative::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent);
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.02);
  }
}

/* Spotlight搜索结果动画 */
.spotlight-result-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.spotlight-result-item:hover {
  transform: translateX(4px);
}

.spotlight-result-selected {
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.25);
}

/* 搜索结果入场动画 */
@keyframes slideInResult {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spotlight-results {
  animation: slideInResult 0.3s ease-out;
}

/* 键盘快捷键动画 */
@keyframes pulseKey {
  0%, 100% {
    background-color: rgb(219 234 254);
    transform: scale(1);
  }
  50% {
    background-color: rgb(147 197 253);
    transform: scale(1.05);
  }
}

.dark .spotlight-key-hint {
  animation: pulseKey 2s ease-in-out infinite;
}

.spotlight-key-hint {
  animation: pulseKey 2s ease-in-out infinite;
}
</style>
