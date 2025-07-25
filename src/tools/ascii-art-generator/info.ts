import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const asciiArtGeneratorInfo: ToolBaseInfo = {
    name: 'ASCII字符画生成器',
    description: '将图片转换为ASCII字符画，支持艺术字符生成',
    tags: [ToolTags.GENERATOR, ToolTags.IMAGE, ToolTags.TEXT_PROCESSING],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
