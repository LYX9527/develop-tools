import type { ToolBaseInfo } from '@/types/tool'
import { ToolTags } from '@/types/tool'

export const qrCodeGeneratorInfo: ToolBaseInfo = {
    name: '二维码生成',
    description: '生成各种类型的二维码，支持文本、URL、WiFi等',
    tags: [ToolTags.GENERATOR, ToolTags.UTILITY],
    icon: '📱',
    author: 'QRCodePro',
    github: 'https://github.com/qrcode-pro'
} 