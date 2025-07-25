import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const hashGeneratorInfo: ToolBaseInfo = {
    name: '哈希生成器',
    description: '生成MD5、SHA等哈希值，支持多种哈希算法',
    tags: [ToolTags.SECURITY, ToolTags.GENERATOR],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
