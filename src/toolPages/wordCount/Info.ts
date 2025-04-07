import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue'
const toolInfo:ToolBaseInfo = {
    name: '方格纸工具',
    description: '生成方格纸背景，支持中英文、标点符号、空格等字符的统计，可以将内容填写到方格纸上预览和导出',
    icon:Icon,
    tags:['工具','方格纸','字数统计','文本分析'],
    author:'CncCbz',
    github:'https://github.com/CncCbz'
}
export default toolInfo;
