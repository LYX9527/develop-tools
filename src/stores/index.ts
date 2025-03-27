import {defineStore} from "pinia";
import {computed, ref, shallowRef, watch, onMounted} from "vue";
import {ThemeMode} from "@/models/Constant.ts";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";

// 本地存储的键名
const THEME_STORAGE_KEY = 'app-theme-mode';
const AUTO_THEME_KEY = 'app-theme-auto';

export const useAppStatusStore = defineStore('appStatus', () => {
    // 主题模式（默认跟随系统）
    const themeMode = ref(ThemeMode.Light);
    // 是否启用自动跟随系统主题
    const autoTheme = ref(true);
    const scrollAtTop = ref<boolean>(true);

    // 计算属性获取当前主题
    const getThemeMode = computed(() => themeMode.value);
    const getScrollAtTopStatus = computed(() => scrollAtTop.value);
    const getAutoTheme = computed(() => autoTheme.value);

    // 从本地存储读取主题设置
    function loadThemeSettings() {
        try {
            // 读取自动模式设置
            const savedAutoTheme = localStorage.getItem(AUTO_THEME_KEY);
            if (savedAutoTheme !== null) {
                autoTheme.value = savedAutoTheme === 'true';
            }

            // 如果启用自动模式，检测系统主题
            if (autoTheme.value) {
                applySystemTheme();
            } else {
                // 否则读取保存的主题设置
                const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                console.log('Saved theme:', savedTheme);
                
                // 正确的类型转换
                if (savedTheme) {
                    if (savedTheme === 'light') {
                        themeMode.value = ThemeMode.Light;
                    } else if (savedTheme === 'dark') {
                        themeMode.value = ThemeMode.Dark;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading theme settings:', error);
            // 出错时使用默认设置
            applySystemTheme();
        }
    }

    // 应用系统主题
    function applySystemTheme() {
        // 检查系统是否偏好深色模式
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeMode.value = prefersDark ? ThemeMode.Dark : ThemeMode.Light;
    }

    // 切换自动主题模式
    function toggleAutoTheme() {
        autoTheme.value = !autoTheme.value;
        // 保存自动主题设置
        localStorage.setItem(AUTO_THEME_KEY, autoTheme.value.toString());
        
        // 如果开启自动模式，立即应用系统主题
        if (autoTheme.value) {
            applySystemTheme();
        }
    }

    // 手动切换主题
    function changeThemeMode(newMode: ThemeMode) {
        // 如果是手动切换，自动关闭自动模式
        if (autoTheme.value) {
            autoTheme.value = false;
            localStorage.setItem(AUTO_THEME_KEY, 'false');
        }
        
        themeMode.value = newMode;
        // 保存到本地存储，转换为字符串
        localStorage.setItem(THEME_STORAGE_KEY, newMode === ThemeMode.Light ? 'light' : 'dark');
    }

    // 监听系统主题变化
    function setupSystemThemeListener() {
        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 系统主题变化时更新主题（如果启用了自动模式）
        const handleThemeChange = (e: MediaQueryListEvent) => {
            if (autoTheme.value) {
                themeMode.value = e.matches ? ThemeMode.Dark : ThemeMode.Light;
            }
        };
        
        // 添加监听器
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleThemeChange);
        } else {
            // 兼容旧版浏览器
            mediaQuery.addListener(handleThemeChange);
        }
    }
    
    // 初始化主题设置
    loadThemeSettings();
    setupSystemThemeListener();

    const changeScrollAtTopStatus = (newScrollAtTop: boolean) => {
        scrollAtTop.value = newScrollAtTop;
    };

    return {
        getThemeMode,
        getScrollAtTopStatus,
        getAutoTheme,
        changeScrollAtTopStatus,
        changeThemeMode,
        toggleAutoTheme,
        applySystemTheme,
    };
});

export const useNowToolInfoStore = defineStore('nowToolInfo', () => {
    const nowToolInfo = shallowRef<ToolLoadedInfo | null>(null)
    const getNowToolInfo = computed(() => {
        return nowToolInfo.value
    })
    const updateNowToolInfo = (newToolInfo: ToolLoadedInfo) => {
        nowToolInfo.value = newToolInfo
    }

    return {
        getNowToolInfo,
        updateNowToolInfo,
    }
})
