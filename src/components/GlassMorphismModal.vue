<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { NButton } from 'naive-ui'

// 定义组件属性
const props = defineProps({
  // 控制模态框显示状态
  show: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 宽度
  width: {
    type: [String, Number],
    default: '500px'
  },
  // 模糊程度
  blur: {
    type: [String, Number],
    default: '10px'
  },
  // 背景透明度
  opacity: {
    type: [String, Number],
    default: 0.7
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 点击遮罩层是否关闭
  closeOnClickMask: {
    type: Boolean,
    default: true
  },
  // 是否将模态框居中
  center: {
    type: Boolean,
    default: true
  },
  // z-index层级
  zIndex: {
    type: Number,
    default: 2000
  },
  // 是否可拖动
  draggable: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['update:show', 'close', 'confirm'])

// 控制动画状态
const isVisible = ref(false)
const isEntering = ref(false)
const isLeaving = ref(false)

// 拖动相关状态
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const startPos = ref({ x: 0, y: 0 })
const modalRef = ref<HTMLElement | null>(null)

// 修复：改进show属性变化的监听方式
watch(() => props.show, (newVal) => {
  if (newVal) {
    showModal()
  } else {
    hideModal()
  }
}, { immediate: true })

// 显示模态框 - 修复动画逻辑
function showModal() {
  isVisible.value = true
  // 使用nextTick确保DOM更新后再添加动画类
  setTimeout(() => {
    isEntering.value = true
    // 动画结束后移除动画类
    setTimeout(() => {
      isEntering.value = false
      document.body.style.overflow = 'hidden' // 阻止背景滚动
    }, 300)
  }, 10)

  // 当模态框显示时重置位置
  if (props.draggable) {
    position.value = { x: 0, y: 0 }
  }
}

// 隐藏模态框
function hideModal() {
  if (!isVisible.value) return
  
  isLeaving.value = true
  setTimeout(() => {
    isLeaving.value = false
    isVisible.value = false
    document.body.style.overflow = '' // 恢复背景滚动
  }, 300)
}

// 关闭事件处理
function handleClose() {
  emit('update:show', false)
  emit('close')
}

// 确认事件处理
function handleConfirm() {
  emit('confirm')
}

// 点击遮罩层
function handleMaskClick(e: Event) {
  // 修复：确保只有直接点击遮罩时才关闭
  if (e.target === e.currentTarget && props.closeOnClickMask) {
    handleClose()
  }
}

// 阻止冒泡，避免点击内容区域触发遮罩点击事件
function handleContentClick(e: Event) {
  e.stopPropagation()
}

// 拖拽相关函数
function handleMouseDown(e: MouseEvent) {
  if (!props.draggable || e.target !== modalRef.value?.querySelector('.modal-header')) return
  
  isDragging.value = true
  startPos.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  
  position.value = {
    x: e.clientX - startPos.value.x,
    y: e.clientY - startPos.value.y
  }
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 键盘事件处理，ESC键关闭模态框
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) {
    handleClose()
  }
}

// 组件挂载和卸载时的事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = '' // 确保组件卸载时恢复背景滚动
})
</script>

<template>
  <Teleport to="body">
    <div
      class="glass-modal-container"
      v-if="isVisible"
      :class="{ 
        'entering': isEntering, 
        'leaving': isLeaving 
      }"
      :style="{ zIndex: zIndex }"
      @click="handleMaskClick"
    >
      <div 
        ref="modalRef"
        class="glass-modal"
        :class="{ 
          'centered': center && !isDragging && position.x === 0 && position.y === 0,
          'draggable': draggable
        }"
        :style="{
          width: typeof width === 'number' ? `${width}px` : width,
          '--blur-amount': typeof blur === 'number' ? `${blur}px` : blur,
          '--bg-opacity': opacity,
          transform: `translate(${position.x}px, ${position.y}px)`
        }"
        @mousedown="handleMouseDown"
      >
        <div class="modal-header" :class="{ 'handle': draggable }">
          <h3 class="modal-title">{{ title }}</h3>
          <n-button v-if="showClose" quaternary circle @click="handleClose">
            <template #icon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </template>
          </n-button>
        </div>
        
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
        
        <div class="modal-footer" v-else-if="$slots.confirm || $slots.cancel">
          <n-button @click="handleClose">
            <slot name="cancel">取消</slot>
          </n-button>
          <n-button type="primary" @click="handleConfirm">
            <slot name="confirm">确认</slot>
          </n-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.glass-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v-bind(zIndex);
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
  // 修复动画问题
  opacity: 1;
  transition: opacity 0.3s var(--n-bezier);
  
  &.entering {
    .glass-modal {
      animation: modalFadeIn 0.3s forwards;
    }
  }
  
  &.leaving {
    opacity: 0;
    
    .glass-modal {
      animation: modalFadeOut 0.3s forwards;
    }
  }
}

.glass-modal {
  position: relative;
  background-color: rgba(var(--n-color-items-base-rgb), v-bind(opacity));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 95%;
  max-height: 90vh;
  // 修复初始状态
  opacity: 1; 
  display: flex;
  flex-direction: column;
  
  // 毛玻璃效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(v-bind('--blur-amount'));
    -webkit-backdrop-filter: blur(v-bind('--blur-amount'));
    z-index: -1;
  }
  
  // 边框效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    pointer-events: none;
  }
  
  &.centered {
    transform: translate(0, 0) !important;
  }
  
  &.draggable {
    .modal-header {
      cursor: move;
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(var(--n-border-color-rgb), 0.1);
    
    &.handle {
      touch-action: none;
      user-select: none;
    }
    
    .modal-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--n-text-color);
    }
  }
  
  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1 1 auto;
    color: var(--n-text-color);
    max-height: calc(90vh - 130px);
    
    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(var(--n-text-color-base-rgb), 0.3);
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(var(--n-text-color-base-rgb), 0.5);
    }
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid rgba(var(--n-border-color-rgb), 0.1);
  }
}

// 动画关键帧
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translate(v-bind('position.x') + 'px', v-bind('position.y') + 'px') scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(v-bind('position.x') + 'px', v-bind('position.y') + 'px') scale(1);
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
    transform: translate(v-bind('position.x') + 'px', v-bind('position.y') + 'px') scale(1);
  }
  to {
    opacity: 0;
    transform: translate(v-bind('position.x') + 'px', v-bind('position.y') + 'px') scale(0.95);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .glass-modal-container {
    padding: 10px;
  }
  
  .glass-modal {
    max-width: 100%;
    
    .modal-header {
      padding: 12px 16px;
    }
    
    .modal-body {
      padding: 16px;
      max-height: calc(90vh - 110px);
    }
    
    .modal-footer {
      padding: 12px 16px;
    }
  }
}
</style> 