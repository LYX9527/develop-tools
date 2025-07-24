<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  modelValue?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  fullWidth?: boolean;
  id?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}>();

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<template>
  <div :class="{ 'w-full': fullWidth }">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium mb-1 dark:text-gray-200"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="block rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:outline-none transition-colors w-full"
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
      />
      <div v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </div>
    </div>
  </div>
</template>
