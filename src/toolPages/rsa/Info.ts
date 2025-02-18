import type {ToolBaseInfo} from "@/models/ToolInfo"
import Icon from './Icon.vue'

const toolInfo: ToolBaseInfo = {
    icon: Icon,
    name: "RSA加解密",
    description: "生成RSA公私钥对，支持多种密钥长度",
    tags: ["加密", "解密", "RSA"],
    author: "LYX9527",
    github: "https://github.com/LYX9527"
}
export default toolInfo;
