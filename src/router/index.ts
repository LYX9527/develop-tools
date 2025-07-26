import type {RouteRecordRaw} from 'vue-router'
import {createRouter, createWebHistory} from 'vue-router'

// 首页
import Home from '@/views/Home.vue'

// 开发工具
import JsonFormatter from '@/views/tools/JsonFormatter.vue'
import Base64Converter from '@/views/tools/Base64Converter.vue'
import ColorPicker from '@/views/tools/ColorPicker.vue'
import QrCodeGenerator from '@/views/tools/QrCodeGenerator.vue'
import PasswordGenerator from '@/views/tools/PasswordGenerator.vue'
import RegexTester from '@/views/tools/RegexTester.vue'
import HashGenerator from '@/views/tools/HashGenerator.vue'
import ImageOptimizer from '@/views/tools/ImageOptimizer.vue'
import TextCaseConverter from '@/views/tools/TextCaseConverter.vue'
import CronGenerator from '@/views/tools/CronGenerator.vue'
import IconGenerator from '@/views/tools/IconGenerator.vue'
import AsciiArtGenerator from '@/views/tools/AsciiArtGenerator.vue'
import ImageWatermark from '@/views/tools/ImageWatermark.vue'
import MoneyConverter from '@/views/tools/MoneyConverter.vue'
import NavicatDecrypt from '@/views/tools/NavicatDecrypt.vue'
import S3UploadTool from '@/views/tools/S3UploadTool.vue'
import BaseConverter from '@/views/tools/BaseConverter.vue'
import ShortUrlGenerator from '@/views/tools/ShortUrlGenerator.vue'
import TimeConverter from '@/views/tools/TimeConverter.vue'
import JsonYamlConverter from '@/views/tools/JsonYamlConverter.vue'

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
        path: '/tools/hash-generator',
        name: 'HashGenerator',
        component: HashGenerator,
        meta: {
            title: '哈希生成器',
            category: 'encode',
            description: '生成MD5、SHA等哈希值'
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
            description: '生成各种格式的图标'
        }
    },
    {
        path: '/tools/ascii-art-generator',
        name: 'AsciiArtGenerator',
        component: AsciiArtGenerator,
        meta: {
            title: 'ASCII 艺术生成器',
            category: 'generator',
            description: '将文本转换为ASCII艺术字'
        }
    },
    {
        path: '/tools/image-watermark',
        name: 'ImageWatermark',
        component: ImageWatermark,
        meta: {
            title: '图片水印',
            category: 'image',
            description: '为图片添加文字或图片水印'
        }
    },
    {
        path: '/tools/money-converter',
        name: 'MoneyConverter',
        component: MoneyConverter,
        meta: {
            title: '货币转换器',
            category: 'converter',
            description: '实时货币汇率转换'
        }
    },
    {
        path: '/tools/navicat-decrypt',
        name: 'NavicatDecrypt',
        component: NavicatDecrypt,
        meta: {
            title: 'Navicat 密码解密',
            category: 'security',
            description: '解密Navicat保存的数据库密码'
        }
    },
    {
        path: '/tools/s3-upload',
        name: 'S3Upload',
        component: S3UploadTool,
        meta: {
            title: 'S3 文件上传',
            category: 'upload',
            description: 'AWS S3 文件上传工具'
        }
    },
    {
        path: '/tools/base-converter',
        name: 'BaseConverter',
        component: BaseConverter,
        meta: {
            title: '进制转换器',
            category: 'converter',
            description: '二进制、八进制、十进制、十六进制转换'
        }
    },
    {
        path: '/tools/short-url-generator',
        name: 'ShortUrlGenerator',
        component: ShortUrlGenerator,
        meta: {
            title: '短链接生成器',
            category: 'utility',
            description: '生成短链接和二维码'
        }
    },
    {
        path: '/tools/time-converter',
        name: 'TimeConverter',
        component: TimeConverter,
        meta: {
            title: '时间转换器',
            category: 'converter',
            description: '时间格式转换和计算'
        }
    },
    {
        path: '/tools/json-yaml-converter',
        name: 'JsonYamlConverter',
        component: JsonYamlConverter,
        meta: {
            title: 'JSON/YAML 转换器',
            category: 'converter',
            description: 'JSON 和 YAML 格式互相转换'
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
            return {top: 0}
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
