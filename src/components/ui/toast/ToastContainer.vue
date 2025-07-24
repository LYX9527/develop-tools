<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Toast, { ToastProps } from './Toast.vue';

interface ToastItem extends ToastProps {
  id: string;
}

const toasts = ref<ToastItem[]>([]);

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id);
};

// Create a global event bus for toast messages
const TOAST_EVENT = 'toast-event';

type ToastEvent = {
  type: 'add';
  toast: Omit<ToastProps, 'id'>;
} | {
  type: 'clear';
};

const addToast = (toast: Omit<ToastProps, 'id'>) => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  toasts.value.push({ ...toast, id });
};

const clearToasts = () => {
  toasts.value = [];
};

const handleToastEvent = (event: CustomEvent<ToastEvent>) => {
  const { type } = event.detail;

  if (type === 'add') {
    addToast(event.detail.toast);
  } else if (type === 'clear') {
    clearToasts();
  }
};

onMounted(() => {
  window.addEventListener(TOAST_EVENT, handleToastEvent as EventListener);
});

onUnmounted(() => {
  window.removeEventListener(TOAST_EVENT, handleToastEvent as EventListener);
});
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      v-bind="toast"
      @close="removeToast"
    />
  </div>
</template>
