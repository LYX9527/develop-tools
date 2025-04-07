import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "图片转字符画",
    description: "将图片转换为ASCII字符组成的艺术字符画",
    tags: ["图片", "字符画", "ASCII字符"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
