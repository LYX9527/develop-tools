import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'

export const base64ConverterInfo: ToolBaseInfo = {
    name: 'Base64 转换',
    description: 'Base64编码和解码工具，支持文本和文件转换',
    tags: [ToolTags.ENCODING, ToolTags.CONVERTER],
    icon: '🔤',
    author: 'EncodingMaster',
    github: 'https://github.com/encoding-master'
} 