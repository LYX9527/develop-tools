import type { ToolBaseInfo } from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "实时新闻聚合",
    description: "聚合多个新闻源的最新资讯，一站式获取热点新闻",
    tags: ["新闻", "资讯", "聚合"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}

export default toolInfo;