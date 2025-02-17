<script setup lang="ts">
import {Toolbox16Regular} from "@vicons/fluent"
import {NIcon, NEllipsis, NSpin} from "naive-ui"
import {onMounted, ref, shallowRef} from "vue";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";
import {useRouter} from "vue-router";
import {getToolLoadedInfos} from "@/utils/getToolLoadedInfos.ts";

const toolList = shallowRef<ToolLoadedInfo[]>([])
const router = useRouter()
const loadingShow = ref<boolean>(false)

function selectTool(item: ToolLoadedInfo) {
  router.push({path: `/tool/${item.toolTag}`})
}

function openGithub(event: Event, github?: string) {
  event.stopPropagation()
  if (github) {
    window.open(github)
  }
}

onMounted(() => {
  loadingShow.value = true
  getToolLoadedInfos().then((list) => {
    toolList.value = list
  }).catch((e) => {
    console.log("ToolList加载失败", e)
  }).finally(() => {
    loadingShow.value = false
  })
})
</script>
<template>
  <div class="loading" v-show="loadingShow">
    <n-spin size="large" stroke="#007BFF">
      <template #description>
        正在加载工具...
      </template>
    </n-spin>
  </div>
  <div class="tool-list">
    <div v-for="item in toolList" class="tool-card" @click="selectTool(item)">
      <div class="icon">
        <n-icon size="40" :component="item.icon?item.icon:Toolbox16Regular"></n-icon>
      </div>
      <div class="title">{{ item.name }}</div>
      <n-ellipsis class="description" :line-clamp="2">
        {{ item.description }}
      </n-ellipsis>
      <div class="tags">
        <div v-for="tag in item.tags" class="tag">
          {{ tag }}
        </div>
      </div>
      <div class="powered-by" @click="(e) => openGithub(e, item.github)">
        <span class="powered-text">Powered by</span>
        <span class="author">{{ item.author }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.tool-list {
  column-count: 5;
  column-gap: 20px;
  padding: 20px 40px;
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
    padding-bottom: 45px;
    border: 1px solid rgba(152, 152, 152, 0.18);
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

      .tag {
        border-radius: 5px;
        border: 1px solid #007BFF;
        padding: 2px 7px;
        font-size: 11px;
      }
    }

    .powered-by {
      position: absolute;
      bottom: 12px;
      right: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0.7;
      transition: opacity 0.3s ease;

      .powered-text {
        color: var(--text-color-3, #999);
      }

      .author {
        color: #007BFF;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      &:hover {
        opacity: 1;
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
