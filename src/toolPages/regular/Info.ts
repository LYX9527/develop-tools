import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "正则表达式工具",
    description: "支持正则表达式测试、常用正则匹配",
    tags: ["正则", "匹配", "测试"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
