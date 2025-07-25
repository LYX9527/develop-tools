<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

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
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          二维码生成器
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          生成各种格式的二维码，支持文本、链接等
        </p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div class="text-6xl mb-4">📱</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">二维码生成器</h3>
        <p class="text-gray-600 dark:text-gray-300">此工具正在开发中，敬请期待...</p>
      </div>
    </div>
  </div>
</template> 