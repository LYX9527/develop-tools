import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'
export const imageOptimizerInfo: ToolBaseInfo = {
    name: '图片优化',
    description: '压缩和优化图片，支持多种图片格式',
    tags: [ToolTags.IMAGE, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
