import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "短链接生成",
    description: "生成短链接，支持访问密码保护",
    tags: ["短链接", "URL", "加密访问"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 