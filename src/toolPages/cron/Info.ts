import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    name: 'Cron表达式',
    description: 'Cron表达式生成和验证工具，支持查看未来运行时间',
    icon: Icon,
    tags: ['定时', '调度', "验证"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
