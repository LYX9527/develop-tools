<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import Button from '../Button.vue';

export interface ModalProps {
  modelValue: boolean;
  title?: string;
  hideClose?: boolean;
  persistent?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  maxWidth?: string;
}

const props = withDefaults(defineProps<ModalProps>(), {
  title: '',
  hideClose: false,
  persistent: false,
  size: 'md',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const modalRef = ref<HTMLElement | null>(null);
const backdropRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const close = () => {
  if (props.persistent) return;
  emit('update:modelValue', false);
  emit('close');
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === backdropRef.value && !props.persistent) {
    close();
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !props.persistent && props.modelValue) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';

    // Create a timeline for coordinated animations
    const tl = gsap.timeline();

    if (backdropRef.value) {
      tl.to(backdropRef.value, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      }, 0); // Start at the beginning of the timeline
    }

    if (contentRef.value) {
      tl.fromTo(contentRef.value,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        0 // Start at the beginning of the timeline
      );
    }
  } else {
    // Create a timeline for coordinated closing animations
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
      }
    });

    if (contentRef.value) {
      tl.to(contentRef.value, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        ease: 'power2.in',
      }, 0); // Start at the beginning of the timeline
    }

    if (backdropRef.value) {
      tl.to(backdropRef.value, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, 0); // Start at the beginning of the timeline
    }
  }
});

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      ref="modalRef"
      class="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref="backdropRef"
        class="fixed inset-0 backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 transition-opacity"
        :style="{ opacity: modelValue ? 1 : 0 }"
        @click="handleBackdropClick"
      ></div>

      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div
          ref="contentRef"
          :class="[
            'w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all z-10 border border-gray-200 dark:border-gray-700',
            sizeClasses[size],
            props.maxWidth ? props.maxWidth : '',
          ]"
          :style="{ opacity: modelValue ? 1 : 0 }"
        >
          <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 v-if="title" class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ title }}
            </h3>
            <div v-else>
              <slot name="header"></slot>
            </div>

            <button
              v-if="!hideClose"
              @click="close"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              aria-label="Close"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4 text-gray-800 dark:text-gray-200">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="p-4 border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
