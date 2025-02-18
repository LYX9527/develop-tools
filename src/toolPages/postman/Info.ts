import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "HTTP请求测试",
    description: "支持多种请求方法、参数配置、响应预览",
    tags: ["HTTP", "API", "测试"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo; 