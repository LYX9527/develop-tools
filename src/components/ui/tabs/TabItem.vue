<script setup lang="ts">
import {computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {gsap} from 'gsap';

const props = defineProps<{
  label: string;
  id?: string | number;
  disabled?: boolean;
  lazy?: boolean;
}>();

interface TabContext {
  activeTab: any;
  registerTab: (tab: any) => number;
  unregisterTab: (id: number) => void;
  activateTab: (id: number | string) => void;
}

const tabContext = inject<TabContext>('tabContext');
const tabId = ref<number | string | undefined>(props.id);
const contentRef = ref<HTMLElement | null>(null);
const hasBeenActivated = ref(false);

// Register this tab with the parent
onMounted(() => {
  if (tabContext) {
    if (tabId.value === undefined) {
      tabId.value = tabContext.registerTab({
        label: props.label,
        disabled: props.disabled
      });
    } else {
      tabContext.registerTab({
        id: tabId.value,
        label: props.label,
        disabled: props.disabled
      });
    }

    // Check if this tab is active on mount
    if (tabContext.activeTab.value === tabId.value) {
      hasBeenActivated.value = true;
    }
  }
});

// Unregister this tab when unmounted
onBeforeUnmount(() => {
  if (tabContext && typeof tabId.value === 'number') {
    tabContext.unregisterTab(tabId.value);
  }
});

// Determine if this tab is active
const isActive = computed(() => {
  if (!tabContext) return false;
  return tabContext.activeTab.value === tabId.value;
});

// Animate tab content when it becomes active
const animateContent = () => {
  if (!contentRef.value) return;

  gsap.fromTo(
    contentRef.value,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
  );
};

// Watch for changes to isActive
watch(isActive, (newValue) => {
  if (newValue) {
    hasBeenActivated.value = true;
    // Use nextTick to ensure the DOM is updated
    nextTick(() => {
      animateContent();
    });
  }
});
</script>

<template>
  <div
    v-if="!lazy || isActive || hasBeenActivated"
    ref="contentRef"
    class="tab-item"
    :class="{ 'hidden': !isActive }"
  >
    <slot></slot>
  </div>
</template>
