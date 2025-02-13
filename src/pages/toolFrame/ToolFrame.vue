<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {NIcon, NEllipsis, NSpin} from "naive-ui"
import {onMounted, shallowRef} from "vue";
import {getToolLoadedInfoByToolTag} from "@/utils/getToolLoadedInfos.ts";
import {Toolbox16Regular} from "@vicons/fluent";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";

const route = useRoute()
const toolInfo = shallowRef<ToolLoadedInfo>()
onMounted(() => {
  const toolTag = route.fullPath.split("/tool/")[1]
  getToolLoadedInfoByToolTag(toolTag).then((info) => {
    toolInfo.value = info
  }).catch((e) => {
    console.log(`${toolTag}加载失败`, e)
    toolInfo.value={
      name:"(未知的工具)",
      description:"",
      tags:[],
      icon:null,
    }
  })
})
</script>

<template>
  <div class="tool-frame">
    <div class="tool-introduce">
      <div class="base-info">
        <div class="tool-icon">
          <n-icon size="50" :component="toolInfo?.icon?toolInfo.icon:Toolbox16Regular"></n-icon>
        </div>
        <div class="tool-name">
          {{ toolInfo?.name }}
        </div>
        <div class="tool-tags">
          <div v-for="tag in toolInfo?.tags" class="tag">
            {{ tag }}
          </div>
        </div>
      </div>
      <p class="description">描述</p>
    </div>
    <router-view></router-view>

  </div>
</template>

<style scoped lang="scss">
.tool-frame {
  padding: 20px 40px;
  .tool-introduce {
    margin-bottom: 15px;
    border-bottom: 2px solid rgba(136, 136, 136, 0.3);
    padding-bottom: 10px;

    .base-info {
      display: flex;
      align-items: center;
      gap: 5px;
      .tool-icon {
        color: #007BFF;
      }

      .tool-name {
        margin-right: 10px;
        height: fit-content;
        font-size: 2.2em;
        font-weight: bold;
      }

      .tool-tags {
        display: flex;
        gap: 8px;
        align-items: end;

        .tag {
          height: fit-content;
          border-radius: 5px;
          border: 1px solid #007BFF;
          padding: 2px 7px;
          font-size: 12px;
        }
      }
    }

    .description {
      margin-top: 10px;
      font-size: 1.2em;
    }
  }
}
</style>
