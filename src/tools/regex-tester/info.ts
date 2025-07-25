import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'

export const regexTesterInfo: ToolBaseInfo = {
    name: '正则表达式测试',
    description: '测试和验证正则表达式，支持实时匹配和解释',
    tags: [ToolTags.TEXT_PROCESSING, ToolTags.UTILITY],
    icon: '⚡',
    author: 'RegexMaster',
    github: 'https://github.com/regex-master'
} 