import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "Js脚本运行器",
    description: "一个可以运行JavaScript脚本的工具，可以加载本地JavaScript文件，也可以输入JavaScript代码并运行。",
    tags: ["JavaScript", "运行时"],
    author: "一勺",
    github: "https://github.com/ZRMYDYCG"
}

export default toolInfo;
