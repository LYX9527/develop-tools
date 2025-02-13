import type {ToolBaseInfo, ToolLoadedInfo} from "@/models/ToolInfo.ts";

let toolPagesCache: ToolLoadedInfo[] | null = null;

const getToolLoadedInfos = async (): Promise<ToolLoadedInfo[]> => {
    if (toolPagesCache) {
        return toolPagesCache;
    }
    console.log("加载第一次");

    const files = import.meta.glob('@/toolPages/*/Info.ts');
    const toolInfos: ToolLoadedInfo[] = await Promise.all(
        Object.keys(files).map(async (path) => {
            const module = await files[path]() as { default: ToolBaseInfo };
            const routerTag = path.split('toolPages/').pop()?.split('/Info.ts')[0];
            const toolLoadedInfo: ToolLoadedInfo = {
                ...module.default,
                path: `/${routerTag}`,
            };
            console.log("加载工具信息", toolLoadedInfo);
            return toolLoadedInfo;
        })
    );

    toolPagesCache = toolInfos;
    console.log("工具信息初始化完成", toolInfos);
    return toolPagesCache;
};


export default getToolLoadedInfos;
