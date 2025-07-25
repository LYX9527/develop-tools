import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'

export const timestampConverterInfo: ToolBaseInfo = {
    name: '时间戳转换',
    description: '时间戳和日期格式转换，支持多种时间格式',
    tags: [ToolTags.CONVERTER, ToolTags.UTILITY],
    icon: '⏰',
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
