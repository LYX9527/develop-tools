<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useTools} from '@/stores'
import GlassMorphismPanel from '@/components/GlassMorphismPanel.vue'
import {NSpin} from 'naive-ui'
import {Toolbox16Regular} from "@vicons/fluent"
import {NIcon, NEllipsis} from "naive-ui"
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts"

const loadingShow = ref<boolean>(false)
const toolsStore = useTools()
const router = useRouter()
const isLoading = ref(true)

// 拖拽相关状态
const isDragging = ref(false)
const draggedItem = ref<string | null>(null)
const dragOverItem = ref<string | null>(null)

// 初始化存储
onMounted(async () => {
  isLoading.value = true
  await toolsStore.initialize()
  isLoading.value = false
})

// 拖拽功能
const handleDragStart = (e, tool) => {
  isDragging.value = true
  draggedItem.value = toolsStore.getToolId(tool)
  e.dataTransfer.effectAllowed = 'move'
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedItem.value = null
  dragOverItem.value = null
}

const handleDragOver = (e, tool) => {
  e.preventDefault()
  if (!isDragging.value) return

  const id = toolsStore.getToolId(tool)
  if (draggedItem.value !== id) {
    dragOverItem.value = id
  }
}

const handleDrop = (e, _) => {
  e.preventDefault()
  if (!draggedItem.value || !dragOverItem.value) return

  // 更新排序
  toolsStore.updateSortOrder(draggedItem.value, dragOverItem.value)
  handleDragEnd()
}

function selectTool(item: ToolLoadedInfo) {
  // 记录工具使用
  toolsStore.recordToolUsage(item)
  router.push({path: `/tool/${item.toolTag}`})
}

function openGithub(event: Event, github?: string) {
  event.stopPropagation()
  if (github) {
    window.open(github)
  }
}
</script>

<template>
  <div class="loading" v-show="loadingShow">
    <n-spin size="large" stroke="#007BFF">
      <template #description>
        正在加载工具...
      </template>
    </n-spin>
  </div>
  <div class="tools-grid">
    <!-- 无工具时显示提示 -->
    <div v-if="toolsStore.sortedTools.length === 0" class="no-tools">
      <p>暂无可用工具</p>
    </div>
    <GlassMorphismPanel
        :blur="5"
        :opacity="0.2"
        :radius="12"
        :border="true"
        v-for="tool in toolsStore.sortedTools"
        :key="toolsStore.getToolId(tool)"
        class="tool-card"
        :class="{
          'is-dragging': toolsStore.getToolId(tool) === draggedItem,
          'drag-over': toolsStore.getToolId(tool) === dragOverItem,
          'is-pinned': toolsStore.isPinned(tool)
        }"
        draggable="true"
        @dragstart="handleDragStart($event, tool)"
        @dragend="handleDragEnd"
        @dragover="handleDragOver($event, tool)"
        @drop="handleDrop($event, tool)"
        @click="selectTool(tool)"
    >
      <div class="tool-actions">
        <button
            class="action-button favorite-button"
            :class="{ 'active': toolsStore.isFavorite(tool) }"
            @click.stop="toolsStore.toggleFavorite(tool)"
            title="收藏"
        >
          <i class="favorite-icon"></i>
        </button>
        <button
            class="action-button pin-button"
            :class="{ 'active': toolsStore.isPinned(tool) }"
            @click.stop="toolsStore.togglePin(tool)"
            title="固定在首位"
        >
          <i class="pin-icon"></i>
        </button>
      </div>
      <div class="icon">
        <n-icon size="40" :component="tool.icon?tool.icon:Toolbox16Regular"></n-icon>
      </div>
      <div class="title">{{ tool.name }}</div>
      <n-ellipsis class="description" :line-clamp="2">
        {{ tool.description }}
      </n-ellipsis>
      <div class="tags">
        <div v-for="tag in tool.tags" class="tag">
          {{ tag }}
        </div>
      </div>
      <div class="powered-by" @click="(e) => openGithub(e, tool.github)">
        <span class="powered-text">Powered by</span>
        <span class="author">{{ tool.author }}</span>
      </div>
    </GlassMorphismPanel>
  </div>
</template>

<style scoped>
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  grid-gap: 20px;
  padding: 20px 40px;
}

.tool-card {
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 12px;
  padding: 20px 20px 45px;
  border: 1px solid rgba(152, 152, 152, 0.18);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.tool-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 5;
}

.tool-card:hover .tool-actions {
  opacity: 1;
}

.action-button {
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  backdrop-filter: blur(3px);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-button.active {
  color: #007BFF;
  border-color: #007BFF;
  background: rgba(0, 123, 255, 0.1);
}

.is-pinned::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  background: #007BFF;
  clip-path: polygon(0 0, 0 100%, 100% 0);
  z-index: 4;
}

.is-pinned::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  z-index: 4;
}

.icon {
  color: #007BFF;
  height: 40px;
  width: 40px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
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
}

.tag {
  border-radius: 5px;
  border: 1px solid #007BFF;
  padding: 2px 7px;
  font-size: 11px;
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
}

.powered-text {
  color: var(--text-color-3, #999);
}

.author {
  color: #007BFF;
  font-weight: 500;
}

.author:hover {
  text-decoration: underline;
}

.powered-by:hover {
  opacity: 1;
}

.tool-card:active {
  cursor: grabbing;
}

.is-dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.drag-over {
  transform: scale(1.02);
}

.pin-icon, .favorite-icon {
  width: 14px;
  height: 14px;
}

.pin-icon {
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.favorite-icon {
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
