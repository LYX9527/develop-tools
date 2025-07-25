import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'

export const hashGeneratorInfo: ToolBaseInfo = {
    name: '哈希生成器',
    description: '生成MD5、SHA等哈希值，支持多种哈希算法',
    tags: [ToolTags.SECURITY, ToolTags.GENERATOR],
    icon: '#️⃣',
    author: 'CryptoTools',
    github: 'https://github.com/crypto-tools'
} 