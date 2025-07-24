<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: boolean | any[];
  value?: any;
  label?: string;
  disabled?: boolean;
  id?: string;
  indeterminate?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | any[]): void;
  (e: 'change', value: boolean | any[]): void;
}>();

const checkboxId = computed(() => props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`);

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return !!props.modelValue;
});

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue];

    if (target.checked) {
      if (!newValue.includes(props.value)) {
        newValue.push(props.value);
      }
    } else {
      const index = newValue.indexOf(props.value);
      if (index !== -1) {
        newValue.splice(index, 1);
      }
    }

    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', target.checked);
    emit('change', target.checked);
  }
};
</script>

<template>
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        :id="checkboxId"
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        :indeterminate="indeterminate"
        @change="handleChange"
        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-colors"
        :class="[
          {
            'opacity-50 cursor-not-allowed': disabled,
            'dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600 dark:focus:ring-primary-500 dark:focus:ring-offset-gray-900': true,
          }
        ]"
      />
    </div>
    <div v-if="label" class="ml-3 text-sm">
      <label :for="checkboxId" class="font-medium text-gray-700 dark:text-gray-200" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
        {{ label }}
      </label>
    </div>
    <slot v-else></slot>
  </div>
</template>
