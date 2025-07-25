<script setup lang="ts">
import {useTheme} from '@/composables/useTheme.ts';
import {onMounted, ref} from 'vue';
import {gsap} from 'gsap';

const {theme, toggleTheme} = useTheme();
const toggleRef = ref<HTMLElement | null>(null);

onMounted(() => {
  // Add a subtle animation when toggling
  if (toggleRef.value) {
    gsap.to(toggleRef.value, {
      rotate: 360,
      duration: 0.5,
      ease: 'power2.inOut',
      paused: true,
    });
  }
});

const handleToggle = () => {
  toggleTheme();
  if (toggleRef.value) {
    gsap.to(toggleRef.value, {
      rotate: theme.value === 'dark' ? 360 : 0,
      duration: 0.5,
      ease: 'power2.inOut',
    });
  }
};
</script>

<template>
  <button
      @click="handleToggle"
      class="p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      :class="[
      theme === 'dark'
        ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    ]"
      aria-label="Toggle theme"
  >
    <div ref="toggleRef" class="w-5 h-5 flex items-center justify-center">
      <!-- Sun icon for light mode -->
      <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
           fill="currentColor">
        <path fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"/>
      </svg>
      <!-- Moon icon for dark mode -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
      </svg>
    </div>
  </button>
</template>
