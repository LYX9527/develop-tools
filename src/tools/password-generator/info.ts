import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'
import Icon from './Icon.vue'

export const passwordGeneratorInfo: ToolBaseInfo = {
    name: '密码生成器',
    description: '生成安全随机密码，支持自定义长度和字符类型',
    tags: [ToolTags.GENERATOR, ToolTags.SECURITY],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
}
