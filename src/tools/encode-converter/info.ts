import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const encodeConverterInfo: ToolBaseInfo = {
    name: '编码转换',
    description: '支持Base64、URL、JWT等多种编码格式转换',
    tags: [ToolTags.ENCODING, ToolTags.CONVERTER, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 