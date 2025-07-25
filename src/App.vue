<script setup lang="ts">
import {useTheme} from './composables/useTheme'

// 初始化主题
const {theme} = useTheme()
</script>

<template>
  <div id="app" :class="theme">
    <Layout/>

    <!-- Toast Container (全局) -->
    <ToastContainer/>
  </div>
</template>
