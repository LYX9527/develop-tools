import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
import {getToolLoadedInfoByToolTag} from "@/utils/getToolLoadedInfos.ts";
import {useNowToolInfoStore} from "@/stores";
import type {ToolLoadedInfo} from "@/models/ToolInfo.ts";

let isInitRouter = false
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'toolList',
        component: () => import('@/pages/toolList/ToolList.vue'),
    },
    {
        path: '/tool/',
        name: "tool",
        component: () => import('@/pages/toolFrame/ToolFrame.vue'),
    },
    {
        path: '/index.html',
        redirect: '/',
    }
]
const toolModules = import.meta.glob('@/toolPages/*/index.vue') as Record<string, () => Promise<any>>;
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

function initRouter() {
    console.group(`🛠️工具路由注册`);
    for (const toolPath in toolModules) {
        const routerTag = toolPath.split('toolPages/').pop()?.split('/index.vue')[0];
        const route: RouteRecordRaw = {
            path: `/tool/${routerTag}`,
            name: `${routerTag}`,
            component: () => import(`@/toolPages/${routerTag}/index.vue`)
        };
        router.addRoute("tool", route)
        console.log(`%c ${routerTag} `, 'background: #007BFFFF; padding: 2px; border-radius: 0 3px 3px 0; color: #fff');
    }
    console.groupEnd();
}

router.beforeEach(async (to, _) => {

    if (to.fullPath.startsWith("/tool/")) {
        const toolTag = to.fullPath.split("/tool/")[1]
        getToolLoadedInfoByToolTag(toolTag).then((toolInfo: ToolLoadedInfo) => {
            useNowToolInfoStore().updateNowToolInfo(toolInfo)
        })
    }
    if (!isInitRouter) {
        initRouter()
        isInitRouter = true
        return {path: to.fullPath}
    }
    return true
})

export default router
