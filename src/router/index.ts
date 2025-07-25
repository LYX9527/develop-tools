import type {RouteRecordRaw} from 'vue-router'
import {createRouter, createWebHistory} from 'vue-router'

// 首页
import Home from '@/views/Home.vue'

// 开发工具
import JsonFormatter from '@/views/tools/JsonFormatter.vue'
import Base64Converter from '@/views/tools/Base64Converter.vue'
import UrlEncoder from '@/views/tools/UrlEncoder.vue'
import ColorPicker from '@/views/tools/ColorPicker.vue'
import QrCodeGenerator from '@/views/tools/QrCodeGenerator.vue'
import PasswordGenerator from '@/views/tools/PasswordGenerator.vue'
import RegexTester from '@/views/tools/RegexTester.vue'
import TimestampConverter from '@/views/tools/TimestampConverter.vue'
import HashGenerator from '@/views/tools/HashGenerator.vue'
import ImageOptimizer from '@/views/tools/ImageOptimizer.vue'
import TextCaseConverter from '@/views/tools/TextCaseConverter.vue'
import CronGenerator from '@/views/tools/CronGenerator.vue'
import IconGenerator from '@/views/tools/IconGenerator.vue'
import AsciiArtGenerator from '@/views/tools/AsciiArtGenerator.vue'
import ImageWatermark from '@/views/tools/ImageWatermark.vue'
import MoneyConverter from '@/views/tools/MoneyConverter.vue'
import NavicatDecrypt from '@/views/tools/NavicatDecrypt.vue'

// 组件库demo
import ComponentDemo from '@/demo/ComponentDemo.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/tools/json-formatter',
    name: 'JsonFormatter',
    component: JsonFormatter,
    meta: {
      title: 'JSON 格式化',
      category: 'text',
      description: '格式化和美化JSON数据'
    }
  },
  {
    path: '/tools/base64-converter',
    name: 'Base64Converter',
    component: Base64Converter,
    meta: {
      title: 'Base64 转换',
      category: 'encode',
      description: 'Base64编码和解码工具'
    }
  },
  {
    path: '/tools/url-encoder',
    name: 'UrlEncoder',
    component: UrlEncoder,
    meta: {
      title: 'URL 编码',
      category: 'encode',
      description: 'URL编码和解码工具'
    }
  },
  {
    path: '/tools/color-picker',
    name: 'ColorPicker',
    component: ColorPicker,
    meta: {
      title: '颜色选择器',
      category: 'design',
      description: '颜色选择和转换工具'
    }
  },
  {
    path: '/tools/qr-code-generator',
    name: 'QrCodeGenerator',
    component: QrCodeGenerator,
    meta: {
      title: '二维码生成',
      category: 'generator',
      description: '生成各种格式的二维码'
    }
  },
  {
    path: '/tools/password-generator',
    name: 'PasswordGenerator',
    component: PasswordGenerator,
    meta: {
      title: '密码生成器',
      category: 'generator',
      description: '生成安全的随机密码'
    }
  },
  {
    path: '/tools/regex-tester',
    name: 'RegexTester',
    component: RegexTester,
    meta: {
      title: '正则表达式测试',
      category: 'text',
      description: '测试和验证正则表达式'
    }
  },
  {
    path: '/tools/timestamp-converter',
    name: 'TimestampConverter',
    component: TimestampConverter,
    meta: {
      title: '时间戳转换',
      category: 'converter',
      description: '时间戳和日期格式转换'
    }
  },
  {
    path: '/tools/hash-generator',
    name: 'HashGenerator',
    component: HashGenerator,
    meta: {
      title: '生成工具',
      category: 'generator',
      description: 'UUID生成、哈希计算、文件校验和RSA加密解密工具集合'
    }
  },
  {
    path: '/tools/image-optimizer',
    name: 'ImageOptimizer',
    component: ImageOptimizer,
    meta: {
      title: '图片优化',
      category: 'image',
      description: '压缩和优化图片'
    }
  },
  {
    path: '/tools/text-case-converter',
    name: 'TextCaseConverter',
    component: TextCaseConverter,
    meta: {
      title: '文本命名转换',
      category: 'text',
      description: '支持多种命名格式转换'
    }
  },
  {
    path: '/tools/cron-generator',
    name: 'CronGenerator',
    component: CronGenerator,
    meta: {
      title: 'Cron 表达式生成器',
      category: 'generator',
      description: '生成符合标准的Cron表达式'
    }
  },
  {
    path: '/tools/icon-generator',
    name: 'IconGenerator',
    component: IconGenerator,
    meta: {
      title: '图标生成器',
      category: 'image',
      description: '支持生成各种尺寸的圆角图标，一键导出多个规格'
    }
  },
  {
    path: '/tools/ascii-art-generator',
    name: 'AsciiArtGenerator',
    component: AsciiArtGenerator,
    meta: {
      title: 'ASCII字符画生成器',
      category: 'generator',
      description: '将图片转换为ASCII字符画，支持艺术字符生成'
    }
  },
  {
    path: '/tools/image-watermark',
    name: 'ImageWatermark',
    component: ImageWatermark,
    meta: {
      title: '图片水印',
      category: 'image',
      description: '为图片添加自定义水印，支持文字样式和位置调整，提供单文字和平铺模式'
    }
  },
  {
    path: '/tools/money-converter',
    name: 'MoneyConverter',
    component: MoneyConverter,
    meta: {
      title: '人民币大写转换',
      category: 'converter',
      description: '将数字金额转换为人民币大写形式，支持最大13位数金额'
    }
  },
  {
    path: '/tools/navicat-decrypt',
    name: 'NavicatDecrypt',
    component: NavicatDecrypt,
    meta: {
      title: 'Navicat密码解密',
      category: 'security',
      description: '解密Navicat存储的数据库连接密码，支持密码解密和NCX文件解析'
    }
  },
  {
    path: '/demo',
    name: 'ComponentDemo',
    component: ComponentDemo,
    meta: {
      title: '组件库演示'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 开发者工具箱`
  } else {
    document.title = '开发者工具箱'
  }
  next()
})

export default router 
