import type {ToolBaseInfo} from "@/models/ToolInfo.ts";
import Icon from "@/toolPages/img/Icon.vue";
const toolInfo: ToolBaseInfo = {
  icon: Icon,
  name: "S3 文件上传",
  description: "兼容 S3 API 的文件拖拽上传工具，支持 R2、MinIO 等兼容 S3 的存储服务",
  tags: ['上传', '存储', 'S3', 'R2', 'AWS'],
  author: "LYX9527",
  github: "https://github.com/LYX9527"
}
export default toolInfo;



