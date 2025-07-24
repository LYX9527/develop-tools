<script setup lang="ts">
import { ref, provide, onMounted, watch } from 'vue';
import { gsap } from 'gsap';

export type TabVariant = 'underline' | 'pills' | 'bordered';

const props = defineProps<{
  modelValue?: number | string;
  variant?: TabVariant;
  animated?: boolean;
  vertical?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void;
  (e: 'change', value: number | string): void;
}>();

// Default to first tab if no modelValue is provided
const activeTab = ref(props.modelValue ?? 0);
const tabItems = ref<any[]>([]);
const tabsRef = ref<HTMLElement | null>(null);
const indicatorRef = ref<HTMLElement | null>(null);
const animating = ref(false);

// Register a tab item
const registerTab = (tab: any) => {
  tabItems.value.push(tab);
  return tabItems.value.length - 1;
};

// Unregister a tab item
const unregisterTab = (id: number) => {
  tabItems.value = tabItems.value.filter((_, index) => index !== id);
};

// Activate a tab
const activateTab = (id: number | string) => {
  if (animating.value) return;

  const previousTab = activeTab.value;
  activeTab.value = id;

  emit('update:modelValue', id);
  emit('change', id);

  if (props.animated && indicatorRef.value && tabsRef.value) {
    animateIndicator(previousTab, id);
  }
};

// Animate the indicator
const animateIndicator = (from: number | string, to: number | string) => {
  if (!indicatorRef.value || !tabsRef.value) return;

  animating.value = true;

  const fromIndex = typeof from === 'number' ? from : tabItems.value.findIndex(tab => tab.id === from);
  const toIndex = typeof to === 'number' ? to : tabItems.value.findIndex(tab => tab.id === to);

  if (fromIndex === -1 || toIndex === -1) {
    animating.value = false;
    return;
  }

  const tabButtons = tabsRef.value.querySelectorAll('.tab-button');
  if (!tabButtons[fromIndex] || !tabButtons[toIndex]) {
    animating.value = false;
    return;
  }

  const fromButton = tabButtons[fromIndex] as HTMLElement;
  const toButton = tabButtons[toIndex] as HTMLElement;

  const fromRect = fromButton.getBoundingClientRect();
  const toRect = toButton.getBoundingClientRect();
  const tabsRect = tabsRef.value.getBoundingClientRect();

  let fromPos, toPos, fromSize, toSize;

  if (props.vertical) {
    fromPos = fromRect.top - tabsRect.top;
    toPos = toRect.top - tabsRect.top;
    fromSize = fromRect.height;
    toSize = toRect.height;
  } else {
    fromPos = fromRect.left - tabsRect.left;
    toPos = toRect.left - tabsRect.left;
    fromSize = fromRect.width;
    toSize = toRect.width;
  }

  gsap.fromTo(
    indicatorRef.value,
    {
      [props.vertical ? 'top' : 'left']: fromPos,
      [props.vertical ? 'height' : 'width']: fromSize,
    },
    {
      [props.vertical ? 'top' : 'left']: toPos,
      [props.vertical ? 'height' : 'width']: toSize,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        animating.value = false;
      }
    }
  );
};

// Update indicator position when tabs change
const updateIndicator = () => {
  if (!indicatorRef.value || !tabsRef.value) return;

  const activeIndex = typeof activeTab.value === 'number'
    ? activeTab.value
    : tabItems.value.findIndex(tab => tab.id === activeTab.value);

  if (activeIndex === -1) return;

  const tabButtons = tabsRef.value.querySelectorAll('.tab-button');
  if (!tabButtons[activeIndex]) return;

  const activeButton = tabButtons[activeIndex] as HTMLElement;
  const tabsRect = tabsRef.value.getBoundingClientRect();
  const activeRect = activeButton.getBoundingClientRect();

  if (props.vertical) {
    indicatorRef.value.style.top = `${activeRect.top - tabsRect.top}px`;
    indicatorRef.value.style.height = `${activeRect.height}px`;
  } else {
    indicatorRef.value.style.left = `${activeRect.left - tabsRect.left}px`;
    indicatorRef.value.style.width = `${activeRect.width}px`;
  }
};

// Watch for changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== activeTab.value) {
    activateTab(newValue);
  }
});

// Watch for changes to tabItems
watch(tabItems, () => {
  if (props.animated) {
    // Wait for DOM update
    setTimeout(updateIndicator, 0);
  }
}, { deep: true });

// Provide context to tab items
provide('tabContext', {
  activeTab,
  registerTab,
  unregisterTab,
  activateTab
});

onMounted(() => {
  if (props.animated) {
    // Initialize indicator position
    setTimeout(updateIndicator, 0);

    // Update indicator position on window resize
    window.addEventListener('resize', updateIndicator);
  }
});
</script>

<template>
  <div
    class="tab-container"
    :class="{ 'flex': true, 'flex-col': !vertical, 'flex-row': vertical }"
  >
    <!-- Tab buttons -->
    <div
      ref="tabsRef"
      class="tab-buttons relative"
      :class="[
        {
          'flex-shrink-0': true,
          'flex flex-row border-b border-gray-200 dark:border-gray-700': !vertical && variant !== 'pills',
          'flex flex-col border-r border-gray-200 dark:border-gray-700': vertical && variant !== 'pills',
          'flex flex-row space-x-2': !vertical && variant === 'pills',
          'flex flex-col space-y-2': vertical && variant === 'pills',
        }
      ]"
    >
      <button
        v-for="(tab, index) in tabItems"
        :key="index"
        class="tab-button"
        :class="[
          {
            'px-4 py-2 font-medium text-sm focus:outline-none transition-colors': true,

            // Underline variant
            'hover:text-gray-700 dark:hover:text-gray-300': variant === 'underline',
            'text-primary-600 dark:text-primary-400': variant === 'underline' && (activeTab === index || activeTab === tab.id),
            'text-gray-500 dark:text-gray-400': variant === 'underline' && activeTab !== index && activeTab !== tab.id,

            // Pills variant
            'rounded-md': variant === 'pills',
            'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300': variant === 'pills' && (activeTab === index || activeTab === tab.id),
            'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700': variant === 'pills' && activeTab !== index && activeTab !== tab.id,

            // Bordered variant
            'border-b-2 -mb-px': variant === 'bordered' && !vertical,
            'border-r-2 -mr-px': variant === 'bordered' && vertical,
            'border-primary-600 dark:border-primary-400': variant === 'bordered' && (activeTab === index || activeTab === tab.id),
            'border-transparent': variant === 'bordered' && activeTab !== index && activeTab !== tab.id,
            'text-primary-600 dark:text-primary-400': variant === 'bordered' && (activeTab === index || activeTab === tab.id),
            'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300': variant === 'bordered' && activeTab !== index && activeTab !== tab.id,
          }
        ]"
        @click="activateTab(tab.id !== undefined ? tab.id : index)"
      >
        {{ tab.label }}
      </button>

      <!-- Animated indicator for underline variant -->
      <div
        v-if="animated && variant === 'underline'"
        ref="indicatorRef"
        class="absolute bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-out"
        :class="[
          {
            'h-0.5 bottom-0': !vertical,
            'w-0.5 right-0': vertical,
          }
        ]"
      ></div>
    </div>

    <!-- Tab content -->
    <div
      class="tab-content"
      :class="[
        {
          'flex-grow': true,
          'pt-4': !vertical && variant !== 'pills',
          'pl-4': vertical && variant !== 'pills',
          'mt-2': !vertical && variant === 'pills',
          'ml-2': vertical && variant === 'pills',
        }
      ]"
    >
      <slot></slot>
    </div>
  </div>
</template>
