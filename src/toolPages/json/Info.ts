import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "JSON工具",
    description: "支持JSON格式化、压缩、校验等功能",
    tags: ["JSON", "格式化", "校验"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 