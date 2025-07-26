import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const shortUrlGeneratorInfo: ToolBaseInfo = {
    name: '短链接生成',
    description: '生成短链接，支持访问密码保护、自定义后缀和过期时间设置',
    tags: [ToolTags.UTILITY, 'shorturl', 'url', 'link', 'password'],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 