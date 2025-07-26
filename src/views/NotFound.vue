<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {gsap} from 'gsap'

const router = useRouter()
const containerRef = ref<HTMLElement>()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/')
}

// 动画效果
onMounted(() => {
  const tl = gsap.timeline()

  // 404数字动画
  tl.fromTo('.error-code',
    {
      scale: 0.5,
      opacity: 0,
      rotationY: -180
    },
    {
      scale: 1,
      opacity: 1,
      rotationY: 0,
      duration: 1.2,
      ease: "back.out(1.7)"
    }
  )

  // 标题动画
  .fromTo('.error-title',
    {
      y: 50,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5"
  )

  // 描述文字动画
  .fromTo('.error-description',
    {
      y: 30,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3"
  )

  // 按钮动画
  .fromTo('.error-buttons > *',
    {
      y: 20,
      opacity: 0,
      scale: 0.9
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      stagger: 0.1
    }, "-=0.2"
  )

  // 浮动动画
  gsap.to('.floating-element', {
    y: -20,
    duration: 2,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.3
  })

  // 粒子动画
  gsap.to('.particle', {
    y: -100,
    x: "random(-50, 50)",
    opacity: 0,
    duration: "random(3, 6)",
    ease: "power2.out",
    repeat: -1,
    stagger: {
      amount: 2,
      repeat: -1
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 overflow-hidden relative">
    <!-- 背景粒子效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div v-for="i in 20" :key="i"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: Math.random() * 5 + 's'
           }"
           class="particle absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30">
      </div>
    </div>

    <!-- 背景几何形状 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="floating-element absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-xl"></div>
      <div class="floating-element absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-orange-200/20 dark:from-pink-500/10 dark:to-orange-500/10 rounded-full blur-xl"></div>
      <div class="floating-element absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-xl"></div>
    </div>

    <div ref="containerRef" class="text-center max-w-2xl mx-auto relative z-10">
      <!-- 404 数字 -->
      <div class="error-code mb-8 relative">
        <h1 class="text-[12rem] md:text-[16rem] font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-none relative">
          404
          <!-- 数字光效 -->
          <div class="absolute inset-0 text-[12rem] md:text-[16rem] font-black bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-cyan-400/20 dark:via-purple-400/20 dark:to-pink-400/20 bg-clip-text text-transparent blur-xl">
            404
          </div>
        </h1>
      </div>

      <!-- 标题 -->
      <div class="error-title mb-6">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
          页面走丢了
        </h2>
        <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-400 dark:to-purple-400 mx-auto rounded-full"></div>
      </div>

      <!-- 描述 -->
      <div class="error-description mb-12">
        <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          抱歉，您访问的页面不存在或已被移动
        </p>
        <p class="text-gray-500 dark:text-gray-400">
          让我们帮您找到正确的方向
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="error-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
        <!-- 返回首页按钮 -->
        <button
          class="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-cyan-500 dark:to-purple-500 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          @click="goHome"
        >
          <!-- 按钮光效 -->
          <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

          <div class="relative flex items-center space-x-2">
            <svg class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <span>返回首页</span>
          </div>
        </button>

        <!-- 返回上页按钮 -->
        <button
          class="group px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          @click="goBack"
        >
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <span>返回上页</span>
          </div>
        </button>
      </div>

      <!-- 底部装饰 -->
      <div class="mt-16 flex justify-center space-x-2">
        <div v-for="i in 3" :key="i"
             :class="`animate-pulse`"
             :style="{ animationDelay: i * 0.2 + 's' }"
             class="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60">
        </div>
      </div>
    </div>

    <!-- 装饰性图标 -->
    <div class="absolute bottom-10 right-10 opacity-20 dark:opacity-10">
      <svg class="w-32 h-32 text-gray-400 dark:text-gray-600 floating-element" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* 自定义动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.floating-element {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* 文字发光效果 */
.error-code h1 {
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
}

/* 按钮悬停发光效果 */
.group:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 30px rgba(59, 130, 246, 0.3);
}

.dark .group:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(34, 211, 238, 0.3);
}

/* 粒子动画 */
.particle {
  animation: particleFloat 5s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(50px);
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .error-code h1 {
    font-size: 8rem;
  }

  .floating-element {
    display: none;
  }
}
</style>
