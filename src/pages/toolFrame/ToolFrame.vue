<script setup lang="ts">
import {NIcon, NEllipsis, NSpin} from "naive-ui"
import {computed, onMounted, shallowRef, watch} from "vue";
import {Toolbox16Regular} from "@vicons/fluent";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";
import {useNowToolInfoStore} from "@/stores";

const nowToolInfo = useNowToolInfoStore()
const toolInfo = computed(()=>nowToolInfo.getNowToolInfo)

onMounted(() => {
  // const toolTag = route.fullPath.split("/tool/")[1]
  // getToolLoadedInfoByToolTag(toolTag).then((info) => {
  //   toolInfo.value = info
  // }).catch((e) => {
  //   console.log(`${toolTag}加载失败`, e)
  //   toolInfo.value = {
  //     name: "(未知的工具)",
  //     description: "",
  //     tags: [],
  //     icon: null,
  //   }
  // })
})
</script>

<template>
  <div class="tool-frame">
    <div class="tool-introduce">
      <div class="tool-info">
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
        <div class="author-info">
          <div class="name" v-if="toolInfo?.author">
            {{ toolInfo.author }} : 作者
          </div>
          <div class="email" v-if="toolInfo?.email">
            {{ toolInfo?.email }} : 邮箱
          </div>
        </div>
      </div>
      <p class="description">{{ toolInfo?.description }}</p>
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

    .tool-info {
      display: flex;
      justify-content: space-between;

      .base-info {
        display: flex;
        align-items: center;
        gap: 5px;

        .tool-icon {
          display: flex;
          align-items: center;
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

      .author-info {
        text-align: end;

        .name {
          user-select: text;
          font-weight: bold;
        }

        .email {
          text-decoration: underline;
          font-style: italic;
          user-select: text;
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
