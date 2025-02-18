import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "生成工具",
    description: "UUID生成、哈希计算、二维码生成",
    tags: ["UUID", "哈希", "二维码"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
