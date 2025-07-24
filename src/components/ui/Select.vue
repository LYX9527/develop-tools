<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

interface Option {
  value: string | number;
  label: string;
}

const props = defineProps<{
  modelValue?: string | number;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  fullWidth?: boolean;
  id?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
}>();

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substring(2, 9)}`);
const isOpen = ref(false);
const selectedIndex = ref(-1);
const searchQuery = ref('');
const dropdownRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

// Find the index of the currently selected option
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    const index = props.options.findIndex(option => option.value === newValue);
    selectedIndex.value = index;
  } else {
    selectedIndex.value = -1;
  }
}, { immediate: true });

// Get the selected option label
const selectedLabel = computed(() => {
  if (selectedIndex.value >= 0 && selectedIndex.value < props.options.length) {
    return props.options[selectedIndex.value].label;
  }
  return props.placeholder || 'Select an option';
});

// Toggle dropdown
const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // Reset search query when opening
    searchQuery.value = '';
    // Focus the first item if nothing is selected
    if (selectedIndex.value === -1 && props.options.length > 0) {
      selectedIndex.value = 0;
    }
  }
};

// Select an option
const selectOption = (index: number) => {
  if (index >= 0 && index < props.options.length) {
    selectedIndex.value = index;
    const selectedValue = props.options[index].value;
    emit('update:modelValue', selectedValue);
    emit('change', selectedValue);
    isOpen.value = false;
  }
};

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    isOpen.value = true;
    return;
  }

  if (!isOpen.value) return;

  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      isOpen.value = false;
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (selectedIndex.value < props.options.length - 1) {
        selectedIndex.value++;
      } else {
        selectedIndex.value = 0; // Wrap around to the first option
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
      } else {
        selectedIndex.value = props.options.length - 1; // Wrap around to the last option
      }
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      selectOption(selectedIndex.value);
      break;
    default:
      // Handle typing to search
      if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
        searchQuery.value += event.key.toLowerCase();
        // Find the first option that starts with the search query
        const index = props.options.findIndex(option =>
          option.label.toLowerCase().startsWith(searchQuery.value)
        );
        if (index !== -1) {
          selectedIndex.value = index;
        }
        // Reset search query after a delay
        setTimeout(() => {
          searchQuery.value = '';
        }, 1000);
      }
      break;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    dropdownRef.value &&
    triggerRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    !triggerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div :class="{ 'w-full': fullWidth }">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium mb-1 dark:text-gray-200"
    >
      {{ label }}
    </label>
    <div class="relative">
      <!-- Custom select trigger -->
      <button
        ref="triggerRef"
        type="button"
        :id="selectId"
        :disabled="disabled"
        @click="toggleDropdown"
        class="flex items-center justify-between w-full rounded-md border-0 py-1.5 pl-3 pr-3 text-left shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:outline-none transition-colors"
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
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-labelledby="label ? selectId : undefined"
      >
        <span class="block truncate" :class="{ 'text-gray-500 dark:text-gray-400': selectedIndex === -1 }">
          {{ selectedLabel }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto focus:outline-none"
        tabindex="-1"
        role="listbox"
      >
        <ul class="py-1 text-base">
          <li
            v-for="(option, index) in options"
            :key="option.value"
            class="cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors"
            :class="[
              selectedIndex === index
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
            role="option"
            :aria-selected="selectedIndex === index"
            @click="selectOption(index)"
            @mouseover="selectedIndex = index"
          >
            <span class="block truncate" :class="{ 'font-medium': selectedIndex === index, 'font-normal': selectedIndex !== index }">
              {{ option.label }}
            </span>

            <!-- Selected indicator -->
            <span
              v-if="selectedIndex === index"
              class="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600 dark:text-primary-400"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
              </svg>
            </span>
          </li>
        </ul>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </div>
    </div>
  </div>
</template>
