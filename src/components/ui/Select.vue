<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, Teleport, watch} from 'vue';

interface Option {
  value: string | number;
  label: string;
}

const props = defineProps<{
  modelValue?: string | number;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  fullWidth?: boolean;
  id?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
}>();

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substring(2, 9)}`);
const isOpen = ref(false);
const selectedIndex = ref(-1);
const searchQuery = ref('');
const dropdownRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

// 下拉菜单位置状态
const dropdownPosition = ref({
  top: 0,
  left: 0,
  width: 0
});

// 防抖标识
let positionUpdateRAF: number | null = null;
let scrollTimeout: number | null = null;
let positionCheckInterval: number | null = null;

// Find the index of the currently selected option
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    const index = props.options.findIndex(option => option.value === newValue);
    selectedIndex.value = index;
  } else {
    selectedIndex.value = -1;
  }
}, { immediate: true });

// 监听下拉菜单开关状态
watch(isOpen, (newValue) => {
  if (newValue) {
    // 打开时启动位置检查间隔
    positionCheckInterval = window.setInterval(() => {
      if (isOpen.value && triggerRef.value) {
        calculateDropdownPosition();
      }
    }, 16); // ~60fps 的更新频率
  } else {
    // 关闭时清理间隔
    if (positionCheckInterval) {
      clearInterval(positionCheckInterval);
      positionCheckInterval = null;
    }
  }
});

// Get the selected option label
const selectedLabel = computed(() => {
  if (selectedIndex.value >= 0 && selectedIndex.value < props.options.length) {
    return props.options[selectedIndex.value].label;
  }
  return props.placeholder || 'Select an option';
});

// 计算下拉菜单位置
const calculateDropdownPosition = () => {
  if (!triggerRef.value) return;

  const rect = triggerRef.value.getBoundingClientRect();

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const dropdownMaxHeight = 240; // max-h-60 = 15rem = 240px
  const spacing = 4;

  // 检查是否有足够的空间在下方显示
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  let top = rect.bottom + spacing;

  // 如果下方空间不足且上方空间更多，则显示在上方
  if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
    top = rect.top - Math.min(dropdownMaxHeight, spaceAbove) - spacing;
  }

  // 确保不超出视窗边界
  let left = rect.left;
  const dropdownWidth = rect.width;

  // 如果右侧超出视窗，调整到左侧
  if (left + dropdownWidth > viewportWidth) {
    left = viewportWidth - dropdownWidth - 8; // 8px 边距
  }

  // 确保不超出左侧边界
  if (left < 8) {
    left = 8;
  }

  dropdownPosition.value = {
    top: Math.max(8, Math.min(top, viewportHeight - 8)), // 确保在视窗内
    left,
    width: rect.width
  };
};

// 清理所有定时器的辅助函数
const cleanupTimers = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }

  if (positionUpdateRAF) {
    cancelAnimationFrame(positionUpdateRAF);
    positionUpdateRAF = null;
  }

  if (positionCheckInterval) {
    clearInterval(positionCheckInterval);
    positionCheckInterval = null;
  }
};

// Toggle dropdown
const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // Reset search query when opening
    searchQuery.value = '';
    // Focus the first item if nothing is selected
    if (selectedIndex.value === -1 && props.options.length > 0) {
      selectedIndex.value = 0;
    }
    // 计算位置
    nextTick(() => {
      calculateDropdownPosition();
    });
  } else {
    // 关闭时清理定时器
    cleanupTimers();
  }
};

// Select an option
const selectOption = (index: number) => {
  if (index >= 0 && index < props.options.length) {
    selectedIndex.value = index;
    const selectedValue = props.options[index].value;
    emit('update:modelValue', selectedValue);
    emit('change', selectedValue);
    isOpen.value = false;

    // 关闭时清理定时器
    cleanupTimers();
  }
};

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    isOpen.value = true;
    return;
  }

  if (!isOpen.value) return;

  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      isOpen.value = false;
      // 关闭时清理定时器
      cleanupTimers();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (selectedIndex.value < props.options.length - 1) {
        selectedIndex.value++;
      } else {
        selectedIndex.value = 0; // Wrap around to the first option
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
      } else {
        selectedIndex.value = props.options.length - 1; // Wrap around to the last option
      }
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      selectOption(selectedIndex.value);
      break;
    default:
      // Handle typing to search
      if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
        searchQuery.value += event.key.toLowerCase();
        // Find the first option that starts with the search query
        const index = props.options.findIndex(option =>
          option.label.toLowerCase().startsWith(searchQuery.value)
        );
        if (index !== -1) {
          selectedIndex.value = index;
        }
        // Reset search query after a delay
        setTimeout(() => {
          searchQuery.value = '';
        }, 1000);
      }
      break;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    dropdownRef.value &&
    triggerRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    !triggerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
    // 关闭时清理定时器
    cleanupTimers();
  }
};

// 检查触发元素是否仍然可见
const isElementVisible = () => {
  if (!triggerRef.value) return false;

  const rect = triggerRef.value.getBoundingClientRect();
  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// 处理滚动和窗口大小变化
const handleScroll = () => {
  if (!isOpen.value) return;

  // 清除之前的超时
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }

  // 立即检查可见性和更新位置
  if (!isElementVisible()) {
    isOpen.value = false;
    // 清理所有定时器
    cleanupTimers();
  } else {
    // 直接更新位置，无延迟
    calculateDropdownPosition();
  }
};

const handleResize = () => {
  if (isOpen.value) {
    calculateDropdownPosition();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
  // 捕获所有可能的滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  window.addEventListener('resize', handleResize);
  // 添加更多可能影响位置的事件
  window.addEventListener('orientationchange', handleResize);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('scroll', handleScroll, { capture: true });
  document.removeEventListener('scroll', handleScroll, { capture: true });
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleResize);

  // 清理定时器和动画帧
  cleanupTimers();
});
</script>

<template>
  <div :class="{ 'w-full': fullWidth }">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium mb-1 dark:text-gray-200"
    >
      {{ label }}
    </label>
    <div class="relative">
      <!-- Custom select trigger -->
      <button
        ref="triggerRef"
        type="button"
        :id="selectId"
        :disabled="disabled"
        @click="toggleDropdown"
        class="flex items-center justify-between w-full rounded-md border-0 py-1.5 pl-3 pr-3 text-left shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:outline-none transition-colors"
        :class="[
          {
            'w-full': fullWidth,
            'opacity-50 cursor-not-allowed': disabled,
            'text-gray-900 bg-white ring-gray-300 placeholder:text-gray-400 focus:ring-primary-600': !error && !success,
            'text-red-900 bg-red-50 ring-red-500 placeholder:text-red-400 focus:ring-red-500': error,
            'text-green-900 bg-green-50 ring-green-500 placeholder:text-green-400 focus:ring-green-500': !error && success,

            // Dark mode
            'dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500 dark:focus:ring-primary-500': !error && !success,
            'dark:bg-red-900/10 dark:text-red-400 dark:ring-red-500 dark:placeholder:text-red-300 dark:focus:ring-red-500': error,
            'dark:bg-green-900/10 dark:text-green-400 dark:ring-green-500 dark:placeholder:text-green-300 dark:focus:ring-green-500': !error && success,
          }
        ]"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-labelledby="label ? selectId : undefined"
      >
        <span class="block truncate" :class="{ 'text-gray-500 dark:text-gray-400': selectedIndex === -1 }">
          {{ selectedLabel }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>



      <!-- Error message -->
      <div v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </div>
    </div>

    <!-- Dropdown menu using Teleport -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :style="{
          top: dropdownPosition.top + 'px',
          left: dropdownPosition.left + 'px',
          width: dropdownPosition.width + 'px'
        }"
        class="fixed z-[9999] rounded-md bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto focus:outline-none border border-gray-200 dark:border-gray-700"
        tabindex="-1"
        role="listbox"
      >
        <ul class="py-1 text-base">
          <li
            v-for="(option, index) in options"
            :key="option.value"
            class="cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors"
            :class="[
              selectedIndex === index
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
            role="option"
            :aria-selected="selectedIndex === index"
            @click="selectOption(index)"
            @mouseover="selectedIndex = index"
          >
            <span class="block truncate" :class="{ 'font-medium': selectedIndex === index, 'font-normal': selectedIndex !== index }">
              {{ option.label }}
            </span>

            <!-- Selected indicator -->
            <span
              v-if="selectedIndex === index"
              class="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600 dark:text-primary-400"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
              </svg>
            </span>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
