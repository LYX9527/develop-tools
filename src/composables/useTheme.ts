import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark';

export function useTheme() {
  const theme = ref<Theme>(
    localStorage.getItem('theme') as Theme ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });

  onMounted(() => {
    // Initialize theme based on localStorage or system preference
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light',
  };
}
