<script setup lang="ts">
import {computed, useSlots} from 'vue'

// 属性定义
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '500px'
  },
  blur: {
    type: Number,
    default: 8
  },
  opacity: {
    type: Number,
    default: 0.2
  },
  radius: {
    type: Number,
    default: 12
  }
})

// 事件
const emit = defineEmits(['update:show', 'close'])

// 计算属性
const modalStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width
  }
})

const panelStyle = computed(() => {
  return {
    backdropFilter: `blur(${props.blur}px)`,
    backgroundColor: `rgba(255, 255, 255, ${props.opacity})`,
    borderRadius: `${props.radius}px`
  }
})

// 方法
function closeModal() {
  emit('update:show', false)
  emit('close')
}

// 检查插槽
const slots = useSlots()
</script>

<template>
  <transition name="dialog-fade">
    <Teleport to="body">
      <div v-if="show" class="glass-dialog-overlay" @click.self="closeModal">
        <div class="glass-dialog" :style="modalStyle">
          <div class="glass-dialog-content" :style="panelStyle">
            <div class="glass-dialog-header">
              <h3 v-if="title" class="glass-dialog-title">{{ title }}</h3>
              <button class="glass-dialog-close" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="glass-dialog-body">
              <slot></slot>
            </div>
            <div class="glass-dialog-footer" v-if="slots.footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </transition>

</template>

<style scoped lang="scss">
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .glass-dialog {
  transform: translateY(-20px);
}

.dialog-fade-leave-to .glass-dialog {
  transform: translateY(20px);
}

.glass-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.glass-dialog {
  max-width: 90vw;
  max-height: 90vh;
  transition: transform 0.3s ease;
}

.glass-dialog-content {
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
}

.glass-dialog-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--n-text-color, inherit);
}

.glass-dialog-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--n-text-color-3, rgba(255, 255, 255, 0.7));
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--n-text-color, white);
  }
}

.glass-dialog-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.glass-dialog-footer {
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
