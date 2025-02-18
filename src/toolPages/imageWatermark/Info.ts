import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue';
const toolInfo:ToolBaseInfo = {
    name: '图片水印',
    description: '此工具可以对图片添加自定义的水印文字，并且自定义水印的相关的布局和方向',
    icon:Icon,
    tags:['图片','水印',"自定义"],
    author:'Setruth',
}
export default toolInfo;
