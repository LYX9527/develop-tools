import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "进制转换",
    description: "支持二进制、八进制、十进制、十六进制等数字进制转换",
    tags: ["进制", "转换", "计算"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 