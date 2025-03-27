import {defineStore} from "pinia";
import {computed, ref, shallowRef, watch, onMounted} from "vue";
import {ThemeMode} from "@/models/Constant.ts";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";
import { stringToUUID } from '@/hooks/Utils'
import { getToolLoadedInfos } from "@/utils/getToolLoadedInfos";

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

interface ToolInfo {
  name: string;
  route: string;
  description: string;
  icon?: string;
  category?: string;
  tags?: string[];
}

interface UserToolsPreferences {
  pinned: string[];
  sortOrder: string[];
  favorites: string[];
  lastUsed: { id: string, timestamp: number }[];
}

// 工具存储
export const useTools = defineStore('tools', {
  state: () => ({
    tools: [], // 初始为空数组，将在初始化时加载
    preferences: {
      pinned: [],
      sortOrder: [],
      favorites: [],
      lastUsed: [],
    } as UserToolsPreferences
  }),
  
  getters: {
    // 获取工具的唯一ID
    getToolId: (state) => (tool: ToolInfo) => {
      return stringToUUID(tool.name, 'tool')
    },
    
    // 获取排序后的工具列表
    sortedTools: (state) => {
      // 创建工具的副本
      const allTools = [...state.tools]
      
      // 生成未在用户排序中的工具ID集合
      const userSortIds = new Set(state.preferences.sortOrder)
      const unsortedTools = allTools.filter(tool => !userSortIds.has(state.getToolId(tool)))
      
      // 首先按用户排序构建结果列表
      const result = state.preferences.sortOrder
        .map(id => allTools.find(tool => state.getToolId(tool) === id))
        .filter(Boolean) // 过滤掉不存在的
      
      // 然后添加未排序的工具
      result.push(...unsortedTools)
      
      // 最后将已固定的工具移到前面
      return result.sort((a, b) => {
        const aId = state.getToolId(a)
        const bId = state.getToolId(b)
        
        const aIsPinned = state.preferences.pinned.includes(aId)
        const bIsPinned = state.preferences.pinned.includes(bId)
        
        if (aIsPinned && !bIsPinned) return -1
        if (!aIsPinned && bIsPinned) return 1
        return 0
      })
    },
    
    // 检查工具是否被固定
    isPinned: (state) => (tool: ToolInfo) => {
      return state.preferences.pinned.includes(state.getToolId(tool))
    },
    
    // 检查工具是否是收藏
    isFavorite: (state) => (tool: ToolInfo) => {
      return state.preferences.favorites.includes(state.getToolId(tool))
    }
  },
  
  actions: {
    // 初始化，从localStorage加载用户偏好设置和工具列表
    async initialize() {
      try {
        // 加载工具列表
        this.tools = await getToolLoadedInfos();
        
        // 加载用户偏好设置
        const savedPrefs = localStorage.getItem('user_tools_preferences')
        if (savedPrefs) {
          this.preferences = JSON.parse(savedPrefs)
        }
      } catch (e) {
        console.error('初始化工具列表失败:', e)
      }
    },
    
    // 保存用户偏好设置到localStorage
    savePreferences() {
      try {
        localStorage.setItem('user_tools_preferences', JSON.stringify(this.preferences))
      } catch (e) {
        console.error('Failed to save user tool preferences', e)
      }
    },
    
    // 切换工具的固定状态
    togglePin(tool: ToolInfo) {
      const toolId = this.getToolId(tool)
      const index = this.preferences.pinned.indexOf(toolId)
      
      if (index === -1) {
        // 添加到固定列表
        this.preferences.pinned.push(toolId)
      } else {
        // 从固定列表移除
        this.preferences.pinned.splice(index, 1)
      }
      
      this.savePreferences()
    },
    
    // 切换工具的收藏状态
    toggleFavorite(tool: ToolInfo) {
      const toolId = this.getToolId(tool)
      const index = this.preferences.favorites.indexOf(toolId)
      
      if (index === -1) {
        // 添加到收藏列表
        this.preferences.favorites.push(toolId)
      } else {
        // 从收藏列表移除
        this.preferences.favorites.splice(index, 1)
      }
      
      this.savePreferences()
    },
    
    // 更新工具排序
    updateSortOrder(fromId: string, toId: string) {
      // 如果拖拽的ID不在排序中，添加所有工具到排序
      if (!this.preferences.sortOrder.includes(fromId)) {
        this.preferences.sortOrder = this.tools.map(tool => this.getToolId(tool))
      }
      
      const fromIndex = this.preferences.sortOrder.indexOf(fromId)
      const toIndex = this.preferences.sortOrder.indexOf(toId)
      
      // 从数组中移出并插入新位置
      if (fromIndex !== -1 && toIndex !== -1) {
        this.preferences.sortOrder.splice(fromIndex, 1)
        this.preferences.sortOrder.splice(toIndex, 0, fromId)
        this.savePreferences()
      }
    },
    
    // 记录工具使用
    recordToolUsage(tool: ToolInfo) {
      const toolId = this.getToolId(tool)
      
      // 移除旧记录
      const index = this.preferences.lastUsed.findIndex(item => item.id === toolId)
      if (index !== -1) {
        this.preferences.lastUsed.splice(index, 1)
      }
      
      // 添加新记录
      this.preferences.lastUsed.push({
        id: toolId,
        timestamp: Date.now()
      })
      
      // 限制最近使用数量
      if (this.preferences.lastUsed.length > 10) {
        this.preferences.lastUsed.shift()
      }
      
      this.savePreferences()
    }
  }
})
