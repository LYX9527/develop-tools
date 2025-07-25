import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const s3UploadInfo: ToolBaseInfo = {
    name: 'S3 文件上传',
    description: '兼容 S3 API 的文件拖拽上传工具，支持 R2、MinIO 等兼容 S3 的存储服务',
    tags: [ToolTags.UTILITY, 'upload', 'storage', 's3', 'r2'],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 