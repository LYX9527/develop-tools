import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "Base64图片工具",
    description: "支持图片压缩、转换等功能，支持拖放上传",
    tags: ["图片", "压缩", "Base64"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
