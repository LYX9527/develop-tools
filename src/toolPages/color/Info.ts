import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    name: '颜色工具',
    description: '颜色选择器、阴影生成器，支持多种阴影效果',
    icon: Icon,
    tags: ['颜色', '阴影', "CSS"],
    author: 'LYX9527',
    github: 'https://github.com/LYX9527',
}
export default toolInfo;
