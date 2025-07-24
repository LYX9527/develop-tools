<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'pill' | 'none';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled || loading"
    @click="handleClick"
    class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    :class="[
      // Rounded variants
      {
        'rounded-sm': rounded === 'sm',
        'rounded-md': !rounded || rounded === 'md',
        'rounded-lg': rounded === 'lg',
        'rounded-full': rounded === 'full',
        'rounded-none': rounded === 'none',
        'rounded-[999px]': rounded === 'pill', // Semi-circular/pill shape with very large radius
      },
      // Size variants
      {
        // Icon button sizes (square with centered content)
        'h-8 w-8 p-0': icon && size === 'sm',
        'h-10 w-10 p-0': icon && (!size || size === 'md'),
        'h-12 w-12 p-0': icon && size === 'lg',

        // Regular button sizes
        'h-8 px-3 text-xs': !icon && size === 'sm',
        'h-10 px-4 text-sm': !icon && (!size || size === 'md'),
        'h-12 px-6 text-base': !icon && size === 'lg',
      },
      // Width

      {
        'w-full': fullWidth,
      },
      // Color variants
      {
        // Primary variant
        'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-gray-900 border border-primary-700 dark:border-primary-800 font-semibold':
          !variant || variant === 'primary',

        // Secondary variant
        'bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 focus-visible:ring-secondary-500 dark:focus-visible:ring-secondary-400 dark:focus-visible:ring-offset-gray-900 border border-secondary-700 dark:border-secondary-800 font-semibold':
          variant === 'secondary',

        // Success variant
        'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 focus-visible:ring-green-500 dark:focus-visible:ring-green-400 dark:focus-visible:ring-offset-gray-900 font-semibold':
          variant === 'success',

        // Danger variant
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-gray-900 font-semibold':
          variant === 'danger',

        // Warning variant
        'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 dark:focus-visible:ring-offset-gray-900 font-semibold':
          variant === 'warning',

        // Info variant
        'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-gray-900 font-semibold':
          variant === 'info',

        // Ghost variant
        'bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900 border border-gray-300 dark:border-gray-700 font-semibold':
          variant === 'ghost',
      }
    ]"
  >
    <div v-if="loading" class="mr-2">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <slot />
  </button>
</template>
