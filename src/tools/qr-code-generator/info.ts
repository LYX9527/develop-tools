import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const qrCodeGeneratorInfo: ToolBaseInfo = {
    name: '二维码生成',
    description: '生成各种类型的二维码，支持文本、URL、WiFi等',
    tags: [ToolTags.GENERATOR, ToolTags.UTILITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
