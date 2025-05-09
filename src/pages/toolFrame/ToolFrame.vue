<script setup lang="ts">
import {NIcon, NEllipsis, NSpin} from "naive-ui"
import {computed, onMounted, shallowRef, watch} from "vue";
import {Toolbox16Regular} from "@vicons/fluent";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";
import {useNowToolInfoStore} from "@/stores";
import GlassMorphismPanel from "@/components/GlassMorphismPanel.vue";

const nowToolInfo = useNowToolInfoStore()
const toolInfo = computed(() => nowToolInfo.getNowToolInfo)

function openGithub(github: string) {
  window.open(github)
}
</script>

<template>
  <glass-morphism-panel class="tool-frame" radius="0">
    <div class="tool-introduce">
      <div class="tool-info">
        <div class="base-info">
          <div class="tool-icon">
            <n-icon size="50" :component="toolInfo?.icon?toolInfo.icon:Toolbox16Regular"></n-icon>
          </div>
          <div class="tool-name">
            <span v-if="toolInfo!=null">{{ toolInfo?.name }}</span>
            <n-skeleton v-else :width="146" :sharp="false" size="medium"/>
          </div>
          <div class="tool-tags">
            <div v-if="toolInfo!=null" v-for="tag in toolInfo?.tags" class="tag">
              {{ tag }}
            </div>
            <n-skeleton v-else :width="146" :sharp="false" size="small"/>
          </div>
        </div>
        <div class="author-info" v-if="toolInfo!=null">
          <div class="name" v-if="toolInfo?.author">
            {{ toolInfo.author }} : 作者
          </div>
          <div class="github" v-if="toolInfo?.github" @click="openGithub(toolInfo.github)">
            {{ toolInfo.github }} : GitHub
          </div>
          <div class="email" v-if="toolInfo?.email">
            {{ toolInfo.email }} : 邮箱
          </div>
        </div>
        <n-skeleton v-else :width="100" :height="50" :sharp="false" size="small"/>
      </div>
      <p class="description" v-if="toolInfo!=null">{{ toolInfo?.description }}</p>
      <div v-else style="margin-top: 10px">
        <n-skeleton text :repeat="2"/>
      </div>
    </div>
    <router-view></router-view>
  </glass-morphism-panel>
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
        display: flex;
        flex-direction: column;
        gap: 5px;

        .name {
          font-weight: bold;
        }

        .github {
          cursor: pointer;
          transition: 0.2s;
          color: var(--text-color-1);
          text-decoration: none;
        }

        .github:hover {
          color: var(--primary-color);
          text-decoration: underline;
        }

        .email {
          text-decoration: underline;
          font-style: italic;
          cursor: pointer;
          transition: 0.2s;
          user-select: text;
          color: var(--text-color-1);
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
