import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const regexTesterInfo: ToolBaseInfo = {
    name: '正则表达式测试',
    description: '测试和验证正则表达式，支持实时匹配和解释',
    tags: [ToolTags.TEXT_PROCESSING, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
