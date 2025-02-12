<script setup lang="ts">

import {darkTheme, NConfigProvider, zhCN, dateZhCN, NEl} from 'naive-ui'
import TopBar from "@/components/topBar/TopBar.vue";
import ToolList from "@/pages/toolList/ToolList.vue";
import {useAppStatusStore} from "@/stores";
import {ref} from "vue";
import {ThemeMode} from "@/models/Constant.ts";

const appStatus = useAppStatusStore()
const contentRef = ref<HTMLElement | null>(null)
let scrollBeforeIsTop = true

function contentScroll(e: any) {
  const nowScrollY = contentRef.value?.scrollTop ?? 0
  if (!scrollBeforeIsTop && nowScrollY == 0) {
    scrollBeforeIsTop = true
    appStatus.changeScrollAtTopStatus(true)
  }
  if (scrollBeforeIsTop && nowScrollY != 0){
    scrollBeforeIsTop=false
    appStatus.changeScrollAtTopStatus(false)
  }
}
</script>

<template>
  <n-config-provider style="height: 100%" :theme="appStatus.getThemeMode==ThemeMode.Light?null:darkTheme"
                     :locale="zhCN" :date-locale="dateZhCN">
    <n-el class="app-view">
      <TopBar></TopBar>
      <div ref="contentRef" class="content" @scroll="contentScroll">
        <ToolList/>
      </div>
    </n-el>
  </n-config-provider>

</template>

<style lang="scss">
.app-view {
  background-color: var(--card-color);
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
