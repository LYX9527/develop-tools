import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const hashGeneratorInfo: ToolBaseInfo = {
    name: '生成工具',
    description: 'UUID生成、哈希计算和文件校验工具集合',
    tags: [ToolTags.SECURITY, ToolTags.GENERATOR],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
