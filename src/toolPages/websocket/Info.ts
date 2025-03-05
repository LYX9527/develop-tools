import type { ToolBaseInfo } from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "WebSocket测试",
    description: "WebSocket连接测试工具，支持实时消息收发",
    tags: ["WebSocket", "测试", "连接"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}

export default toolInfo 