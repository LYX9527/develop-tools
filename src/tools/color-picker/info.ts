import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const colorPickerInfo: ToolBaseInfo = {
    name: '颜色选择器',
    description: '颜色选择和转换工具，支持多种颜色格式',
    tags: [ToolTags.DESIGN, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
