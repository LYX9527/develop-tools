import type {ToolBaseInfo} from '@/types/tool'
import {jsonFormatterInfo} from './json-formatter/info'
import {base64ConverterInfo} from './base64-converter/info'
import {urlEncoderInfo} from './url-encoder/info'
import {colorPickerInfo} from './color-picker/info'
import {qrCodeGeneratorInfo} from './qr-code-generator/info'
import {passwordGeneratorInfo} from './password-generator/info'
import {regexTesterInfo} from './regex-tester/info'
import {timestampConverterInfo} from './timestamp-converter/info'
import {hashGeneratorInfo} from './hash-generator/info'
import {imageOptimizerInfo} from './image-optimizer/info'
import {textCaseConverterInfo} from './text-case-converter/info'
import {cronGeneratorInfo} from './cron-generator/info'
import {iconGeneratorInfo} from './icon-generator/info'
import {asciiArtGeneratorInfo} from './ascii-art-generator/info'
import {imageWatermarkInfo} from './image-watermark/info'
import {moneyConverterInfo} from './money-converter/info'
import {navicatDecryptInfo} from './navicat-decrypt/info'

export interface Tool extends ToolBaseInfo {
  route: string
  category: string
  color: string
}

export const tools: Tool[] = [
  {
    ...jsonFormatterInfo,
    route: '/tools/json-formatter',
    category: 'text',
    color: 'from-blue-500 to-blue-600'
  },
  {
    ...base64ConverterInfo,
    route: '/tools/base64-converter',
    category: 'encode',
    color: 'from-green-500 to-green-600'
  },
  {
    ...urlEncoderInfo,
    route: '/tools/url-encoder',
    category: 'encode',
    color: 'from-purple-500 to-purple-600'
  },
  {
    ...colorPickerInfo,
    route: '/tools/color-picker',
    category: 'design',
    color: 'from-pink-500 to-pink-600'
  },
  {
    ...qrCodeGeneratorInfo,
    route: '/tools/qr-code-generator',
    category: 'generator',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    ...passwordGeneratorInfo,
    route: '/tools/password-generator',
    category: 'generator',
    color: 'from-red-500 to-red-600'
  },
  {
    ...regexTesterInfo,
    route: '/tools/regex-tester',
    category: 'text',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    ...timestampConverterInfo,
    route: '/tools/timestamp-converter',
    category: 'converter',
    color: 'from-teal-500 to-teal-600'
  },
  {
    ...hashGeneratorInfo,
    route: '/tools/hash-generator',
    category: 'encode',
    color: 'from-orange-500 to-orange-600'
  },
  {
    ...imageOptimizerInfo,
    route: '/tools/image-optimizer',
    category: 'image',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    ...textCaseConverterInfo,
    route: '/tools/text-case-converter',
    category: 'text',
    color: 'from-violet-500 to-violet-600'
  },
  {
    ...cronGeneratorInfo,
    route: '/tools/cron-generator',
    category: 'generator',
    color: 'from-green-500 to-green-600'
  },
  {
    ...iconGeneratorInfo,
    route: '/tools/icon-generator',
    category: 'image',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    ...asciiArtGeneratorInfo,
    route: '/tools/ascii-art-generator',
    category: 'generator',
    color: 'from-gray-500 to-gray-600'
  },
  {
    ...imageWatermarkInfo,
    route: '/tools/image-watermark',
    category: 'image',
    color: 'from-pink-500 to-pink-600'
  },
  {
    ...moneyConverterInfo,
    route: '/tools/money-converter',
    category: 'converter',
    color: 'from-green-500 to-emerald-600'
  },
  {
    ...navicatDecryptInfo,
    route: '/tools/navicat-decrypt',
    category: 'security',
    color: 'from-amber-500 to-orange-600'
  }
]

// 从GitHub URL提取用户名
export const getGithubUsername = (githubUrl?: string): string | null => {
  if (!githubUrl) return null
  
  try {
    const url = new URL(githubUrl)
    const pathname = url.pathname
    const username = pathname.split('/')[1]
    return username || null
  } catch {
    return null
  }
} 
