import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const urlEncoderInfo: ToolBaseInfo = {
    name: 'URL 编码',
    description: 'URL编码和解码工具，处理URL中的特殊字符',
    tags: [ToolTags.ENCODING, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
