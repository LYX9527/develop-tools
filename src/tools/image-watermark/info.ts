import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const imageWatermarkInfo: ToolBaseInfo = {
    name: '图片水印',
    description: '为图片添加自定义水印，支持文字样式和位置调整，提供单文字和平铺模式',
    tags: [ToolTags.IMAGE, ToolTags.GENERATOR],
    icon: Icon,
    author: 'Setruth',
    github: 'https://github.com/Setruth'
}
