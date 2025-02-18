import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "密码生成",
    description: "生成随机密码，支持自定义长度、字符类型和排除字符",
    tags: ["密码", "生成", "随机"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 