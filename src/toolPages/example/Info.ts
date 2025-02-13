import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue'
const toolInfo:ToolBaseInfo = {
    name: '示例工具',
    description: '用来做开发例子的示例工具',
    icon:Icon,
    tags:['工具','示例'],
}
export default toolInfo;
