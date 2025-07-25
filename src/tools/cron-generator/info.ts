import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const cronGeneratorInfo: ToolBaseInfo = {
    name: 'Cron表达式',
    description: 'Cron表达式生成和验证工具，支持查看未来运行时间',
    tags: [ToolTags.GENERATOR, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 