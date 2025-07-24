<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 5000,
  closable: true,
});

const emit = defineEmits<{
  (e: 'close', id: string): void;
}>();

const toastRef = ref<HTMLElement | null>(null);
const visible = ref(true);
let timeout: number | null = null;

const close = () => {
  if (toastRef.value) {
    gsap.to(toastRef.value, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        visible.value = false;
        emit('close', props.id);
      }
    });
  } else {
    visible.value = false;
    emit('close', props.id);
  }
};

onMounted(() => {
  if (toastRef.value) {
    gsap.fromTo(toastRef.value,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
    );
  }

  if (props.duration > 0) {
    timeout = window.setTimeout(() => {
      close();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});

const getIconByType = () => {
  switch (props.type) {
    case 'success':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>`;
    case 'error':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>`;
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>`;
    case 'info':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>`;
  }
};
</script>

<template>
  <div
    v-if="visible"
    ref="toastRef"
    class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
    :class="[
      {
        'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200': type === 'success',
        'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200': type === 'error',
        'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200': type === 'warning',
        'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200': type === 'info',
      }
    ]"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0" v-html="getIconByType()"></div>
        <div class="ml-3 w-0 flex-1">
          <p v-if="title" class="text-sm font-medium">{{ title }}</p>
          <p class="text-sm">{{ message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            v-if="closable"
            @click="close"
            class="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
