import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue'
const toolInfo:ToolBaseInfo = {
    name: 'Example Tool',
    description: 'This is an example tool.',
    icon:Icon,
    tags:['example'],
}
export default toolInfo;
