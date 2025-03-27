<script setup lang="ts">
import { computed } from 'vue'

// 定义组件属性
const props = defineProps({
  type: {
    type: String,
    default: 'default', // default, primary, success, warning, danger
    validator: (val: string) => ['default', 'primary', 'success', 'warning', 'danger'].includes(val)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (val: string) => ['small', 'medium', 'large'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  blur: {
    type: [String, Number],
    default: '4px'
  },
  opacity: {
    type: [String, Number],
    default: 0.2
  },
  radius: {
    type: [String, Number],
    default: '6px'
  },
  border: {
    type: Boolean,
    default: true
  }
})

// 计算类名
const buttonClass = computed(() => {
  return [
    `glass-btn-${props.type}`,
    `glass-btn-${props.size}`,
    { 'is-disabled': props.disabled }
  ]
})

// 计算样式
const buttonStyle = computed(() => {
  return {
    backdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
    WebkitBackdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
    borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
    border: props.border ? '' : 'none' // 将使用类中的border
  }
})

// 处理点击事件
const handleClick = (e: MouseEvent) => {
  if (props.disabled) return
  emit('click', e)
}

const emit = defineEmits(['click'])
</script>

<template>
  <button 
    class="glass-btn" 
    :class="buttonClass"
    :style="buttonStyle"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.glass-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-weight: 500;
  outline: none;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
}

.glass-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.5) 50%, 
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

/* 尺寸 */
.glass-btn-small {
  height: 28px;
  padding: 0 12px;
  font-size: 14px;
}

.glass-btn-medium {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}

.glass-btn-large {
  height: 42px;
  padding: 0 20px;
  font-size: 16px;
}

/* 类型 */
.glass-btn-default {
  background-color: rgba(255, 255, 255, 0.15);
}

.glass-btn-default:hover:not(.is-disabled) {
  background-color: rgba(255, 255, 255, 0.25);
}

.glass-btn-primary {
  background-color: rgba(24, 144, 255, 0.35);
  border-color: rgba(24, 144, 255, 0.3);
  color: #fff;
}

.glass-btn-primary:hover:not(.is-disabled) {
  background-color: rgba(24, 144, 255, 0.45);
}

.glass-btn-success {
  background-color: rgba(82, 196, 26, 0.35);
  border-color: rgba(82, 196, 26, 0.3);
  color: #fff;
}

.glass-btn-success:hover:not(.is-disabled) {
  background-color: rgba(82, 196, 26, 0.45);
}

.glass-btn-warning {
  background-color: rgba(250, 173, 20, 0.35);
  border-color: rgba(250, 173, 20, 0.3);
  color: #fff;
}

.glass-btn-warning:hover:not(.is-disabled) {
  background-color: rgba(250, 173, 20, 0.45);
}

.glass-btn-danger {
  background-color: rgba(245, 34, 45, 0.35);
  border-color: rgba(245, 34, 45, 0.3);
  color: #fff;
}

.glass-btn-danger:hover:not(.is-disabled) {
  background-color: rgba(245, 34, 45, 0.45);
}

/* 禁用状态 */
.glass-btn.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 点击效果 */
.glass-btn:active:not(.is-disabled) {
  transform: scale(0.98);
}
</style> 