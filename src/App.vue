<script setup lang="ts">

import Home from "@/pages/home/Home.vue";
import {darkTheme, NConfigProvider, zhCN, dateZhCN,NEl} from 'naive-ui'
import {ref} from "vue";
import {ThemeMode} from "@/models/Constant.ts";

const theme = ref<any | null>(null)

function changeTheme(themeMode: ThemeMode) {
  switch (themeMode) {
    case ThemeMode.Light:
      theme.value = null
      break;
    case ThemeMode.Dark:
      theme.value = darkTheme
      break;
  }
}
</script>

<template>
  <n-config-provider style="height: 100%" :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <n-el class="app-view">
      <Home @changeTheme="changeTheme"/>
    </n-el>
  </n-config-provider>

</template>

<style  lang="scss">
.app-view {
  background-color: var(--card-color);
  flex-direction: column;
  display: flex;
  height: 100%;
  width: 100%;
  color: var(--text-color-1);
}

</style>
