import type {ToolBaseInfo, ToolLoadedInfo} from "@/models/ToolInfo.ts";

let toolInfosCache: ToolLoadedInfo[] | null = null;

export const getToolLoadedInfos = async (): Promise<ToolLoadedInfo[]> => {
    if (!toolInfosCache) {
        await initToolLoadedInfos()
    }
    return toolInfosCache!!;
};
export const getToolLoadedInfoByToolTag = async (toolTag: string): Promise<ToolLoadedInfo> => {
    if (!toolInfosCache) {
        await initToolLoadedInfos()
    }
    const toolInfo = toolInfosCache!!.find((tool) => tool.toolTag === toolTag)
    if (toolInfo) {
        return toolInfo
    }
    throw new Error(`找不到${toolTag}`);
};

//闭包避免并发调用初始化重复给缓存赋值
const initToolLoadedInfos = (() => {
    let promise: Promise<void> | null = null;
    return async () => {
        if (promise) {
            return promise;
        }
        return promise = new Promise<void>(async (resolve,_) => {
            try {
                const files = import.meta.glob('@/toolPages/*/Info.ts');
                const toolInfosCacheTemp: ToolLoadedInfo[] = [];
                const promises = Object.entries(files).map(async ([filePath, moduleLoader]) => {
                    const module = await moduleLoader() as { default: ToolBaseInfo };
                    const toolTag = filePath.split('toolPages/').pop()?.split('/Info.ts')[0];
                    if (!toolTag) return;
                    toolInfosCacheTemp.push({...module.default, toolTag});
                });
                await Promise.all(promises);
                toolInfosCache = toolInfosCacheTemp;
                resolve()
            } catch (error) {
                console.error("初始化工具列表失败", error)
            } finally {
                promise = null;
            }
        });
    };
})();
// async function initToolLoadedInfos() {
//     const files = import.meta.glob('@/toolPages/*/Info.ts');
//     toolInfosCache = [];
//     const promises = Object.entries(files).map(async ([filePath, moduleLoader]) => {
//         const module = await moduleLoader() as { default: ToolBaseInfo };
//         const toolTag = filePath.split('toolPages/').pop()?.split('/Info.ts')[0];
//         if (!toolTag) return
//         toolInfosCache!!.push({...module.default, toolTag})
//     });
//     await Promise.all(promises);
// }
