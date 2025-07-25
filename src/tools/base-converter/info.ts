import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const baseConverterInfo: ToolBaseInfo = {
    name: '进制转换',
    description: '支持二进制、八进制、十进制、十六进制等数字进制转换',
    tags: [ToolTags.CONVERTER, 'base', 'radix', 'binary', 'hexadecimal'],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 