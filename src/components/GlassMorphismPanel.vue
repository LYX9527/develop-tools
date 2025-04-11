<script setup lang="ts">
import { computed } from 'vue'

// 定义组件属性
const props = defineProps({
  // 模糊程度
  blur: {
    type: [String, Number],
    default: '10px'
  },
  // 背景透明度
  opacity: {
    type: [String, Number],
    default: 0.5
  },
  // 圆角大小
  radius: {
    type: [String, Number],
    default: '16px'
  },
  // 边框样式
  border: {
    type: Boolean,
    default: true
  },
  // 边框颜色
  borderColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.18)'
  },
  // 阴影效果
  shadow: {
    type: Boolean,
    default: true
  },
  // 内边距
  padding: {
    type: [String, Number],
    default: '20px'
  },
  // 背景色（会与透明度结合）
  backgroundColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.1)'
  }
})

// 计算样式
const panelStyle = computed(() => {
  return {
    backdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
    WebkitBackdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
    backgroundColor: props.backgroundColor.includes('rgba')
      ? props.backgroundColor
      : `${props.backgroundColor}${typeof props.opacity === 'number' ? props.opacity : parseFloat(props.opacity as string)}`,
    borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
    boxShadow: props.shadow ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 'none',
    border: props.border ? `1px solid ${props.borderColor}` : 'none',
    padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding
  }
})
</script>

<template>
  <div class="glass-panel" :style="panelStyle">
    <slot></slot>
  </div>
</template>

<style scoped>
.glass-panel {
  position: relative;

  /* 确保在不支持backdrop-filter的浏览器上也有一定效果 */
  @supports not (backdrop-filter: blur(10px)) {
    background-color: var(--n-card-color, rgba(255, 255, 255, 0.8)) !important;
  }
}

/* 添加内边缘高光效果 */
.glass-panel::before {
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

/* 左侧高光 */
.glass-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}
</style>
