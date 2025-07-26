import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const jsonYamlConverterInfo: ToolBaseInfo = {
    name: 'JSON/YAML转换',
    description: '支持JSON和YAML格式互相转换，支持格式化',
    tags: [ToolTags.CONVERTER, 'JSON', 'YAML', 'format', 'config'],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 