<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: any;
  value: any;
  label?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();

const radioId = computed(() => props.id || `radio-${Math.random().toString(36).substring(2, 9)}`);

const isChecked = computed(() => props.modelValue === props.value);

const handleChange = () => {
  emit('update:modelValue', props.value);
  emit('change', props.value);
};
</script>

<template>
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        :id="radioId"
        type="radio"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        @change="handleChange"
        class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-colors"
        :class="[
          {
            'opacity-50 cursor-not-allowed': disabled,
            'dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600 dark:focus:ring-primary-500 dark:focus:ring-offset-gray-900': true,
          }
        ]"
      />
    </div>
    <div v-if="label" class="ml-3 text-sm">
      <label :for="radioId" class="font-medium text-gray-700 dark:text-gray-200" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
        {{ label }}
      </label>
    </div>
    <slot v-else></slot>
  </div>
</template>
