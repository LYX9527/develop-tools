<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change', value: boolean): void;
}>();

const toggleId = computed(() => props.id || `toggle-${Math.random().toString(36).substring(2, 9)}`);

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
  emit('change', target.checked);
};

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        track: 'w-8 h-4',
        thumb: 'h-3 w-3',
        thumbOn: 'translate-x-4',
      };
    case 'lg':
      return {
        track: 'w-14 h-7',
        thumb: 'h-6 w-6',
        thumbOn: 'translate-x-7',
      };
    default: // md
      return {
        track: 'w-11 h-6',
        thumb: 'h-5 w-5',
        thumbOn: 'translate-x-5',
      };
  }
});
</script>

<template>
  <div class="flex items-center">
    <button
      :id="toggleId"
      type="button"
      role="switch"
      :aria-checked="!!modelValue"
      :disabled="disabled"
      @click="emit('update:modelValue', !modelValue)"
      class="relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      :class="[
        sizeClasses.track,
        {
          'bg-primary-600 dark:bg-primary-500': modelValue,
          'bg-gray-200 dark:bg-gray-700': !modelValue,
          'opacity-50 cursor-not-allowed': disabled,
        }
      ]"
    >
      <span class="sr-only">{{ label }}</span>
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 absolute top-1/2 -translate-y-1/2"
        :class="[
          sizeClasses.thumb,
          {
            [sizeClasses.thumbOn]: modelValue,
            'translate-x-0': !modelValue,
            'opacity-90': disabled,
          }
        ]"
      ></span>
    </button>
    <label
      v-if="label"
      :for="toggleId"
      class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    >
      {{ label }}
    </label>
    <slot v-else></slot>
  </div>
</template>
