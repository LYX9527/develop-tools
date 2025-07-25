import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const iconGeneratorInfo: ToolBaseInfo = {
    name: '图标生成器',
    description: '支持生成各种尺寸的圆角图标，一键导出多个规格',
    tags: [ToolTags.GENERATOR, ToolTags.IMAGE],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
