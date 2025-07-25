import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const jsonFormatterInfo: ToolBaseInfo = {
    name: 'JSON 格式化',
    description: '格式化和美化JSON数据，支持压缩、验证和错误检测',
    tags: [ToolTags.TEXT_PROCESSING, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
