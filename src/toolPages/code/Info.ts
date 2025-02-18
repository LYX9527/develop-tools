import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "编码转换",
    description: "支持Base64、URL、JWT等多种编码格式转换",
    tags: ["编码", "解码", "转换"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 