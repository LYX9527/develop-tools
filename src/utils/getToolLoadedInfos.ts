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
    const toolInfo=toolInfosCache!!.find((tool) => tool.toolTag === toolTag)
    if (toolInfo){
        return toolInfo
    }
    throw new Error(`找不到${toolTag}`);
};


async function initToolLoadedInfos() {
    const files = import.meta.glob('@/toolPages/*/Info.ts');
    const toolInfosTemp: ToolLoadedInfo[] = []
    for (const filePath in files) {
        const module = await files[filePath]() as { default: ToolBaseInfo };
        const toolTag = filePath.split('toolPages/').pop()?.split('/Info.ts')[0];
        if (toolTag) {
            const toolLoadedInfo: ToolLoadedInfo = {
                ...module.default,
                toolTag,
            };
            toolInfosTemp.push(toolLoadedInfo)
        }
    }
    toolInfosCache = toolInfosTemp
}
