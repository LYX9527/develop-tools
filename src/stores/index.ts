import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ThemeMode} from "@/models/Constant.ts";

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
