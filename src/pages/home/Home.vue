<script setup lang="ts">
import {ImageEdit16Regular, DocumentSearch16Regular} from "@vicons/fluent"
import {NIcon, NEllipsis, NSwitch, NInput,NEl} from "naive-ui"
import {LogoGithub, ShareSocialOutline} from "@vicons/ionicons5"
import themeSwitchStyle from "@/pages/home/ThemeSwitchStyle.ts";
import {ref, watch} from "vue";
import {ThemeMode} from "@/models/Constant.ts";

const emit = defineEmits(['changeTheme']);
const tags = ["图片", "加密", "其他", "批量处理", "http"]
const themeIsDark = ref<boolean>(false)
const toolQuery = ref<string>("")

function randomTag(): string {
  return tags[Math.floor(Math.random() * tags.length)]
}

function randomTagSize(): number {
  return Math.floor(Math.random() * 8)
}

watch(themeIsDark, (newValue) => {
  emit("changeTheme", newValue ? ThemeMode.Dark : ThemeMode.Light)
})
</script>
<template>
  <div class="head">
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
  <div class="tool-list">
    <div v-for="item in 100" class="tool-card">
      <div class="icon">
        <ImageEdit16Regular/>
      </div>
      <div class="title">开发工具</div>
      <n-ellipsis class="description" :line-clamp="2">
        这款卡片是一个强大的开发工具，旨在提升开发者的工作效率。
        它集成了多种实用功能，包括代码片段管理、版本控制、实时预览和快速调试等。
        通过简洁直观的界面，开发者能够轻松访问常用工具，减少在不同环境间切换的时间。
      </n-ellipsis>
      <div class="tags">
        <div v-for="item in randomTagSize()" class="tag">
          {{ randomTag() }}
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.head {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(152, 152, 152, 0.18);
  height: 64px;
  padding: 20px;
  justify-content: space-between;

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

.tool-list {
  overflow-y: auto;
  column-count: 5;
  column-gap: 20px;
  padding: 20px 34px;
  @media (max-width: 1199px) {
    column-count: 4;
  }
  @media (max-width: 999px) {
    column-count: 3;
  }

  @media (max-width: 799px) {
    column-count: 2;
  }

  @media (max-width: 599px) {
    column-count: 1;
  }


  .tool-card {
    overflow: hidden;
    margin-bottom: 20px;
    box-sizing: border-box;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(152, 152, 152, 0.18) ;
    transition: all 0.3s ease;
    position: relative;
    cursor: pointer;
    break-inside: avoid;

    .icon {
      color: #007BFF;
      height: 40px;
      width: 40px;
      margin-bottom: 15px
    }

    .title {
      font-size: 1.2em;
      font-weight: 550;
      margin-bottom: 10px;
    }

    .description {
      font-size: 0.9em;
      margin-bottom: 15px;
    }

    .tags {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      .tag{
        border-radius: 5px;
        border: 1px solid #007BFF;
        padding: 2px 7px;
        font-size: 11px;
      }
    }
  }
}

.tool-card::before {
  overflow: hidden;
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: #007BFF;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tool-card:hover::before {
  opacity: 1;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style>
