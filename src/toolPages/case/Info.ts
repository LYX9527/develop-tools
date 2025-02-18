import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "命名转换",
    description: "支持多种命名格式转换，包括驼峰、帕斯卡、下划线等命名规范",
    tags: ["命名", "转换", "格式化"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
