import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const colorPickerInfo: ToolBaseInfo = {
    name: '颜色工具',
    description: '颜色选择器、阴影生成器，支持多种阴影效果',
    tags: [ToolTags.DESIGN, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
