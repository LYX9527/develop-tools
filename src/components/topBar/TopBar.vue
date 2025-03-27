<script setup lang="ts">
import {LogoGithub} from "@vicons/ionicons5"
import {Toolbox16Regular} from "@vicons/fluent"
import {NIcon, NSwitch, NInput, NDropdown, type DropdownOption} from "naive-ui"
import themeSwitchStyle from "@/components/topBar/ThemeSwitchStyle.ts";
import {ThemeMode} from "@/models/Constant.ts";
import {useAppStatusStore} from "@/stores";
import {computed, onMounted, ref, shallowRef, watch, h} from "vue";
import {useRouter} from "vue-router";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";
import {getToolLoadedInfos} from "@/utils/getToolLoadedInfos.ts";

const themeIsDark = ref<boolean>(false)
const headRef = ref<HTMLElement | null>(null)
const toolQuery = ref<string>("")
const appStatus = useAppStatusStore()
const router = useRouter()
let toolList = shallowRef<DropdownOption  []>([])
const toolQueryOptions = computed(() => {
  if (toolQuery.value == "") {
    return []
  }
  return toolList.value.filter((option: any) => {
    return option.label.includes(toolQuery.value)
  }).map((option: any) => {
    return {
      label: option.label,
      value: option.key
    }
  })
})

function openGithub() {
  window.open("https://github.com/LYX9527/develop-tools")
}

function handleSelect(obj: any) {
  toolQuery.value = ""
  router.push({path: `/tool/${obj.value}`})
}

function goHome() {
  router.push({path: "/"})
}

watch(themeIsDark, (newValue) => {
  appStatus.changeThemeMode(newValue ? ThemeMode.Dark : ThemeMode.Light)
})
onMounted(() => {
  themeIsDark.value = appStatus.getThemeMode == ThemeMode.Dark
  getToolLoadedInfos().then((list) => {
    toolList.value = list.map((item: ToolLoadedInfo) => {
      return {
        label: item.name,
        key: item.toolTag,
        icon: () => {
          return h(NIcon, {color: "#007BFFFF"}, {
            default: () => h(item.icon ? item.icon : Toolbox16Regular)
          })
        }
      }
    })
  }).catch((e) => {
    console.log("ToolList加载失败", e)
  })
})
</script>

<template>
  <GlassMorphismPanel radius="0" class="head" :class="{'head-fixed':!appStatus.getScrollAtTopStatus}" ref="headRef">
    <div class="left-box">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo">
      </div>
      <div class="title" @click="goHome">开发工具集</div>
      <div class="query-tool-input">
        <GlassMorphismInput
            v-model="toolQuery"
            placeholder="搜索已有工具..."
            searchable
            :searchOptions="toolQueryOptions"
            @select-option="handleSelect"
            width="100%"
        />
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
      <div class="menu-option" @click="openGithub">
        <n-icon size="22">
          <LogoGithub/>
        </n-icon>
        <p>Github</p>
      </div>
    </div>
  </GlassMorphismPanel>
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
      cursor: pointer;
      font-weight: bold;
      font-size: 20px;
    }

    .query-tool-input {
      margin-left: 20px;
      width: 300px;
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
      transition: 0.2s;
    }
  }
}

.head-fixed {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
