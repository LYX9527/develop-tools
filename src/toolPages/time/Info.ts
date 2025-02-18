import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "时间转换",
    description: "Unix时间戳与日期格式互转工具，支持毫秒/秒级时间戳转换",
    tags: ["时间", "转换", "格式化"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
