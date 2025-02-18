import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "MD5加密",
    description: "将输入文本转换为MD5加密格式，支持32位和16位大小写输出",
    tags: ["加密", "MD5"],
    author: "duobaowa",
    github: "https://github.com/DuoBaoWa"
}
export default toolInfo;


