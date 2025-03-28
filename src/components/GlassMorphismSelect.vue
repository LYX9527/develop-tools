<script setup lang="ts">
import {computed, ref, watch, onMounted, onUnmounted} from 'vue'

// 属性定义
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  width: {
    type: [String, Number],
    default: '100%'
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
    default: 8
  },
  labelField: {
    type: String,
    default: 'label'
  },
  valueField: {
    type: String,
    default: 'value'
  }
})

// 事件
const emit = defineEmits(['update:modelValue', 'change'])

// 本地状态
const isOpen = ref(false)
const selectedLabel = ref('')
const selectRef = ref<HTMLElement | null>(null) // 添加这一行，用于引用当前组件的DOM元素


// 计算属性
const selectStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    backdropFilter: `blur(${props.blur}px)`,
    backgroundColor: `rgba(255, 255, 255, ${props.opacity})`,
    borderRadius: `${props.radius}px`
  }
})

const dropdownStyle = computed(() => {
  return {
    backdropFilter: `blur(${props.blur}px)`,
    backgroundColor: `rgba(255, 255, 255, ${props.opacity})`,
    borderRadius: `${props.radius}px`
  }
})

// 方法
function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function closeDropdown() {
  isOpen.value = false
}

function selectOption(option: any) {
  const value = option[props.valueField]
  const label = option[props.labelField]

  emit('update:modelValue', value)
  emit('change', value)
  selectedLabel.value = label
  closeDropdown()
}

function getOptionLabel(option: any): string {
  return option[props.labelField] || option.toString()
}

function getOptionValue(option: any): any {
  return option[props.valueField] !== undefined ? option[props.valueField] : option
}

// 更新选中项的标签
function updateSelectedLabel() {
  if (!props.modelValue) {
    selectedLabel.value = ''
    return
  }

  const selectedOption = props.options.find(option =>
      getOptionValue(option) === props.modelValue
  )

  if (selectedOption) {
    selectedLabel.value = getOptionLabel(selectedOption)
  }
}

// 监听值变化
watch(() => props.modelValue, updateSelectedLabel, {immediate: true})
watch(() => props.options, updateSelectedLabel, {immediate: true})

// 点击外部关闭下拉框
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  // 使用组件自身的ref引用而不是document.querySelector
  if (selectRef.value && !selectRef.value.contains(target)) {
    closeDropdown()
  }
}

// 添加和移除事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  selectedLabel.value = props.modelValue
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="glass-select-container">
    <div
        ref="selectRef"
        class="glass-select"
        :class="{ 'disabled': disabled, 'open': isOpen }"
        :style="selectStyle"
        @click="toggleDropdown"
    >
      <div class="glass-select-value">
        <span v-if="selectedLabel">{{ selectedLabel }}</span>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <div class="glass-select-arrow" :class="{ 'open': isOpen }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    <transition name="dropdown">
      <div v-if="isOpen" class="glass-select-dropdown" :style="dropdownStyle">
        <ul class="glass-select-options">
          <li
              v-for="(option, index) in options"
              :key="index"
              class="glass-select-option"
              :class="{ 'selected': getOptionValue(option) === modelValue }"
              @click.stop="selectOption(option)"
          >
            {{ getOptionLabel(option) }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.glass-select-container {
  position: relative;
  width: 100%;
}

.glass-select {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1px 12px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover:not(.disabled) {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.open {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

.glass-select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--n-text-color, inherit);
}

.placeholder {
  color: var(--n-text-color-3, rgba(255, 255, 255, 0.7));
  font-style: italic;
}

.glass-select-arrow {
  transition: transform 0.3s ease;

  &.open {
    transform: rotate(180deg);
  }
}

.glass-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.glass-select-options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.glass-select-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.selected {
    background-color: rgba(24, 144, 255, 0.3);
    font-weight: 500;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
