import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const textCaseConverterInfo: ToolBaseInfo = {
    name: '命名转换',
    description: '支持驼峰、帕斯卡、下划线等多种命名格式转换',
    tags: [ToolTags.TEXT_PROCESSING, ToolTags.CONVERTER, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 