<script setup lang="ts">

import {
  darkTheme,
  NConfigProvider,
  zhCN,
  dateZhCN,
  NEl,
  NMessageProvider,
  NNotificationProvider,
  type GlobalThemeOverrides
} from 'naive-ui'
import TopBar from "@/components/topBar/TopBar.vue";
import {useAppStatusStore} from "@/stores";
import {ref, computed} from "vue";
import {ThemeMode} from "@/models/Constant.ts";

const appStatus = useAppStatusStore()
const contentRef = ref<HTMLElement | null>(null)
let scrollBeforeIsTop = true
const themeOverrides: GlobalThemeOverrides = {
  common: {
    "primaryColor": "#007BFFFF",
    "primaryColorHover": "#2B90FCFF",
    "primaryColorPressed": "#0067D5FF",
    "primaryColorSuppl": "#3C78B8FF",
  }
}

function contentScroll(e: any) {
  const nowScrollY = contentRef.value?.scrollTop ?? 0
  if (!scrollBeforeIsTop && nowScrollY == 0) {
    scrollBeforeIsTop = true
    appStatus.changeScrollAtTopStatus(true)
  }
  if (scrollBeforeIsTop && nowScrollY != 0) {
    scrollBeforeIsTop = false
    appStatus.changeScrollAtTopStatus(false)
  }
}


// 添加CSS变量设置
const bgStyle = computed(() => ({
  '--bg-image': `url(/${appStatus.getThemeMode == ThemeMode.Light ? "bg-light.png" : "bg-dark.png"})`
  // '--bg-image': `${appStatus.getThemeMode == ThemeMode.Light ? "bg-light.png" : "dark.jpg"}`
  // '--bg-image': `url(${appStatus.getThemeMode == ThemeMode.Light ? "https://cdn.yltf.xyz/bg- light.png" : "https://cdn.yltf.xyz/bg-dark.png"})`
}))
</script>

<template>
  <n-config-provider style="height: 100%" :theme="appStatus.getThemeMode==ThemeMode.Light?null:darkTheme"
                     :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <n-el class="app-view" :style="bgStyle">
          <TopBar></TopBar>
          <div ref="contentRef" class="content" @scroll="contentScroll">
            <router-view></router-view>
          </div>
        </n-el>
      </n-notification-provider>
    </n-message-provider>

  </n-config-provider>

</template>

<style lang="scss">
.app-view {
  background-image: var(--bg-image);
  //background-color: var(--bg-image);
  background-size: cover;
  flex-direction: column;
  display: flex;
  height: 100%;
  width: 100%;
  color: var(--text-color-1);
}

.content {
  overflow-y: auto;
}
</style>
