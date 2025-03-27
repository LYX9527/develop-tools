<script setup lang="ts">
import {LogoGithub} from "@vicons/ionicons5"
import {Toolbox16Regular} from "@vicons/fluent"
import {DocumentSearch16Regular} from "@vicons/fluent";
import {NIcon, NSwitch, NInput, NDropdown, type DropdownOption} from "naive-ui"
import themeSwitchStyle from "@/components/topBar/ThemeSwitchStyle.ts";
import {ThemeMode} from "@/models/Constant.ts";
import {useAppStatusStore} from "@/stores";
import {computed, onMounted, ref, shallowRef, watch, h} from "vue";
import {useRouter} from "vue-router";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";
import {getToolLoadedInfos} from "@/utils/getToolLoadedInfos.ts";
import GlassMorphismPanel from "@/components/GlassMorphismPanel.vue";
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

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
  })
})

function openGithub() {
  window.open("https://github.com/LYX9527/develop-tools")
}

function handleSelect(key: string) {
  toolQuery.value = ""
  router.push({path: `/tool/${key}`})
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
  <glass-morphism-panel radius="0" class="head" :class="{'head-fixed':!appStatus.getScrollAtTopStatus}" ref="headRef">
    <div class="left-box">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo">
      </div>
      <div class="title" @click="goHome">开发工具集</div>
      <div class="query-tool-input">
<!--        <n-dropdown :show="toolQueryOptions.lenght!=0" :options="toolQueryOptions" @select="handleSelect">-->
<!--          <n-input clearable placeholder="输入工具名搜素" v-model:value="toolQuery"-->
<!--                   :style="{ width: '80%' }">-->
<!--            <template #suffix>-->
<!--              <n-icon :component="DocumentSearch16Regular"/>-->
<!--            </template>-->
<!--          </n-input>-->
        <glass-morphism-input
            v-model="toolQuery"
            placeholder="请输入内容..."
            :blur="5"
            :opacity="0.2"
            :search="handleSelect"
        />
<!--        </n-dropdown>-->
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
  </glass-morphism-panel>
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
