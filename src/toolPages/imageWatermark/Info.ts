import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from './Icon.vue';
const toolInfo:ToolBaseInfo = {
    name: '图片水印',
    description: '图片水印工具可以对各种类型图片进行自定义水印添加。提供单文字和平铺模式以及常用自定义文字颜色，大小，偏移和平铺内容边距等操作',
    icon:Icon,
    tags:['图片','水印',"自定义"],
    author:'Setruth',
    github:'https://github.com/Setruth',
}
export default toolInfo;
