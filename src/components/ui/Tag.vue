<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  disabled?: boolean;
  id?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const tagId = computed(() => props.id || `tag-${Math.random().toString(36).substring(2, 9)}`);

const handleClose = (event: MouseEvent) => {
  event.stopPropagation();
  emit('close');
};
</script>

<template>
  <span
    :id="tagId"
    class="inline-flex items-center justify-center font-medium transition-colors"
    :class="[
      // Size variants
      {
        'text-xs px-2 py-0.5 rounded': size === 'sm',
        'text-sm px-2.5 py-0.5 rounded-md': !size || size === 'md',
        'text-base px-3 py-1 rounded-lg': size === 'lg',
      },
      // Color variants
      {
        // Default variant
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !variant || variant === 'default',

        // Primary variant
        'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300': variant === 'primary',

        // Secondary variant
        'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300': variant === 'secondary',

        // Success variant
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': variant === 'success',

        // Danger variant
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': variant === 'danger',

        // Warning variant
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300': variant === 'warning',

        // Info variant
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': variant === 'info',
      },
      // Disabled state
      {
        'opacity-50 cursor-not-allowed': disabled,
      }
    ]"
  >
    <slot />

    <button
      v-if="closable && !disabled"
      type="button"
      @click="handleClose"
      class="ml-1.5 flex-shrink-0 inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
      :class="[
        // Size variants
        {
          'h-3.5 w-3.5': size === 'sm',
          'h-4 w-4': !size || size === 'md',
          'h-5 w-5': size === 'lg',
        },
        // Color variants for focus ring
        {
          'focus:ring-gray-500 focus:ring-offset-gray-100 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900': !variant || variant === 'default',
          'focus:ring-primary-500 focus:ring-offset-primary-100 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-900': variant === 'primary',
          'focus:ring-secondary-500 focus:ring-offset-secondary-100 dark:focus:ring-secondary-400 dark:focus:ring-offset-gray-900': variant === 'secondary',
          'focus:ring-green-500 focus:ring-offset-green-100 dark:focus:ring-green-400 dark:focus:ring-offset-gray-900': variant === 'success',
          'focus:ring-red-500 focus:ring-offset-red-100 dark:focus:ring-red-400 dark:focus:ring-offset-gray-900': variant === 'danger',
          'focus:ring-amber-500 focus:ring-offset-amber-100 dark:focus:ring-amber-400 dark:focus:ring-offset-gray-900': variant === 'warning',
          'focus:ring-blue-500 focus:ring-offset-blue-100 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900': variant === 'info',
        }
      ]"
      aria-label="Remove"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        :class="[
          // Size variants
          {
            'h-2.5 w-2.5': size === 'sm',
            'h-3 w-3': !size || size === 'md',
            'h-3.5 w-3.5': size === 'lg',
          }
        ]"
      >
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </span>
</template>
