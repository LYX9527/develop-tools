import {defineStore} from "pinia";
import {computed, ref, shallowRef} from "vue";
import {ThemeMode} from "@/models/Constant.ts";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";

export const useAppStatusStore = defineStore('appStatus', () => {
    const themeMode = ref(ThemeMode.Light)
    const scrollAtTop = ref<boolean>(true)
    const getThemeMode = computed(() => themeMode.value)
    const getScrollAtTopStatus = computed(() => scrollAtTop.value)
    const changeThemeMode = (newMode: ThemeMode) => {
        themeMode.value = newMode
    }

    const changeScrollAtTopStatus = (newScrollAtTop: boolean) => {
        scrollAtTop.value = newScrollAtTop
    }

    return {
        getThemeMode,
        getScrollAtTopStatus,
        changeScrollAtTopStatus,
        changeThemeMode,
    }
})

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