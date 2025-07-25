<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import Navbar from './Navbar.vue'

// 页面进入动画
onMounted(() => {
  gsap.fromTo('.main-content',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
  )
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-500">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 主内容区 -->
    <main class="main-content pt-16">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* 确保内容区域有足够的高度 */
.main-content {
  min-height: calc(100vh - 4rem);
}
</style> 