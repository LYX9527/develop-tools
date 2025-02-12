<script setup lang="ts">
import {LogoGithub, ShareSocialOutline} from "@vicons/ionicons5"
import {DocumentSearch16Regular} from "@vicons/fluent";
import {NIcon, NSwitch, NInput} from "naive-ui"
import themeSwitchStyle from "@/components/topBar/ThemeSwitchStyle.ts";
import {ThemeMode} from "@/models/Constant.ts";
import {useAppStatusStore} from "@/stores";
import {ref, watch} from "vue";

const themeIsDark = ref<boolean>(false)
const headRef = ref<HTMLElement | null>(null)
const toolQuery = ref<string>("")
const appStatus = useAppStatusStore()
watch(themeIsDark, (newValue) => {
  appStatus.changeThemeMode(newValue ? ThemeMode.Dark : ThemeMode.Light)
})
</script>

<template>
  <div class="head" :class="{'head-fixed':!appStatus.getScrollAtTopStatus}" ref="headRef">
    <div class="left-box">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo">
      </div>
      <div class="title">开发工具集</div>
      <div class="query-tool-input">
        <n-input clearable placeholder="输入工具名搜素" v-model:value="toolQuery" :style="{ width: '80%' }">
          <template #suffix>
            <n-icon :component="DocumentSearch16Regular"/>
          </template>
        </n-input>
      </div>
    </div>
    <div class="right-box">
      <n-switch :rail-style="themeSwitchStyle" v-model:value="themeIsDark" size="medium">
        <template #icon>
          <span v-if="themeIsDark">🌒</span>
          <span v-else>☀️</span>
        </template>
        <template #checked>
          深色
        </template>
        <template #unchecked>
          浅色
        </template>
      </n-switch>
      <div class="menu-option">
        <n-icon size="22">
          <LogoGithub/>
        </n-icon>
        <p>Github</p>
      </div>
      <div class="menu-option">
        <n-icon size="22">
          <ShareSocialOutline/>
        </n-icon>
        <p>网站分享</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.head {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(152, 152, 152, 0.18);
  padding: 20px 20px;
  justify-content: space-between;
  transition: box-shadow 0.3s ease;

  .left-box {
    display: flex;
    align-items: center;
    gap: 10px;

    .logo {
      display: flex;
      height: 30px;
      width: 30px;
    }

    .title {
      font-weight: bold;
      font-size: 20px;
    }

    .query-tool-input {
      margin-left: 20px;
    }
  }

  .right-box {
    gap: 12px;
    display: flex;
    align-items: center;

    .menu-option {
      gap: 5px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}

.head-fixed {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
