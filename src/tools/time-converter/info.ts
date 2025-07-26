import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const timeConverterInfo: ToolBaseInfo = {
    name: '时间转换',
    description: 'Unix时间戳与日期格式互转工具，支持毫秒/秒级时间戳转换',
    tags: [ToolTags.CONVERTER, 'time', 'timestamp', 'date', 'format'],
    icon: Icon,
    author: 'LYX9527',
    github: 'https://github.com/LYX9527'
} 