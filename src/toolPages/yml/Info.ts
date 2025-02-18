import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "JSON/YAML转换",
    description: "支持JSON和YAML格式互相转换，支持格式化",
    tags: ["JSON", "YAML", "转换"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 