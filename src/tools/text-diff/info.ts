import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const textDiffInfo: ToolBaseInfo = {
    name: '文本对比工具',
    description: '对比两段文本的差异，高亮显示新增、删除和修改的内容',
    tags: [ToolTags.TEXT_PROCESSING, ToolTags.UTILITY, 'diff', 'compare', 'text'],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 