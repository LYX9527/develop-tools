<div align="center">

```
██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗       ████████╗ ██████╗  ██████╗ ██╗     ███████╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗      ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝         ██║   ██║   ██║██║   ██║██║     ███████╗
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔══██╗         ██║   ██║   ██║██║   ██║██║     ╚════██║
██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║  ██║         ██║   ╚██████╔╝╚██████╔╝███████╗███████║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝         ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
```

# 🛠️ 开发者工具箱 V2

*基于 Vue 3、TypeScript 和 Tailwind CSS 构建的综合性开发工具集合*

<div align="center">

[![English](https://img.shields.io/badge/Language-English-blue.svg)](README.md)
[![中文](https://img.shields.io/badge/Language-中文-red.svg)](README_zh_CN.md)

</div>

</div>

通过这些强大的实用工具，提升您的开发效率。

![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.8-38B2AC?style=flat&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ 功能特性

### 📝 文本工具
- **JSON 格式化** - 格式化和美化 JSON 数据，支持语法高亮、压缩、验证和错误检测
- **文本命名转换** - 支持驼峰、帕斯卡、下划线等多种命名格式转换
- **正则表达式测试** - 测试和验证正则表达式，支持实时匹配和解释
- **JSON/YAML 转换** - 支持 JSON 和 YAML 格式互相转换，支持格式化

### 🔧 编码转换
- **Base64 转换** - 支持 Base64、URL、JWT 等多种编码格式转换
- **进制转换** - 支持二进制、八进制、十进制、十六进制等数字进制转换
- **时间转换** - Unix 时间戳与日期格式互转工具，支持毫秒/秒级时间戳转换
- **人民币大写转换** - 将数字金额转换为人民币大写形式

### 🎨 设计媒体
- **颜色工具** - 颜色选择器、阴影生成器，支持多种阴影效果
- **二维码生成** - 生成各种类型的二维码，支持文本、URL、WiFi 等
- **图标生成器** - 支持生成各种尺寸的圆角图标，一键导出多个规格
- **ASCII 字符画生成器** - 将图片转换为 ASCII 字符画，支持艺术字符生成
- **图片优化** - 压缩和优化图片，支持多种图片格式
- **图片水印** - 为图片添加自定义水印，支持文字样式和位置调整，提供单文字和平铺模式

### 🔐 安全生成
- **密码生成器** - 生成安全随机密码，支持自定义长度和字符类型
- **生成工具** - UUID 生成、哈希计算和文件校验工具集合
- **Navicat 密码解密** - 解密 Navicat 存储的数据库连接密码

### ⚡ 实用工具
- **Cron 表达式** - Cron 表达式生成和验证工具，支持查看未来运行时间
- **S3 文件上传** - 兼容 S3 API 的文件拖拽上传工具，支持 R2、MinIO 等兼容 S3 的存储服务
- **短链接生成** - 生成短链接，支持访问密码保护、自定义后缀和过期时间设置

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm、yarn 或 pnpm

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/LYX9527/develop-tools.git
cd develop-tools

# 安装依赖
npm install
# 或
yarn install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 生产环境构建

```bash
# 构建项目
npm run build
# 或
yarn build
# 或
pnpm build

# 预览生产构建
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 组合式 API
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS v4
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **UI 组件**: 现代化设计的自定义组件

## 📁 项目结构

```
src/
├── views/
│   ├── Home.vue                 # 首页
│   └── tools/                   # 工具组件
│       ├── JsonFormatter.vue
│       ├── Base64Converter.vue
│       ├── ColorPicker.vue
│       └── ... (其他工具)
├── router/
│   └── index.ts                 # 路由配置
├── components/                  # 可复用组件
├── utils/                       # 工具函数
└── types/                       # TypeScript 类型定义
```

## 🤝 参与贡献

我们欢迎所有形式的贡献！以下是参与方式：

1. **Fork** 本仓库
2. **创建** 功能分支 (`git checkout -b feature/amazing-feature`)
3. **提交** 您的更改 (`git commit -m '添加新功能'`)
4. **推送** 到分支 (`git push origin feature/amazing-feature`)
5. **开启** Pull Request

### 开发规范

- 遵循 Vue 3 组合式 API 模式
- 使用 TypeScript 确保类型安全
- 使用 Tailwind CSS 保持响应式设计
- 添加适当的错误处理和用户反馈
- 为新工具提供完整的文档说明

## 📝 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

特别感谢所有为这个项目做出贡献的开发者：

- **Vue.js 团队** - 感谢优秀的 Vue 3 框架
- **Tailwind CSS** - 感谢实用优先的 CSS 框架
- **Vite** - 感谢快速的构建工具
- **所有贡献者** - 感谢您们的宝贵贡献和反馈

### 贡献者

<a href="https://github.com/LYX9527">
  <img src="https://github.com/LYX9527.png" width="50px" alt="LYX9527"/>
</a>
<a href="https://github.com/setruth">
  <img src="https://github.com/setruth.png" width="50px" alt="setruth"/>
</a>
<a href="https://github.com/CncCbz">
  <img src="https://github.com/CncCbz.png" width="50px" alt="CncCbz"/>
</a>
<a href="https://github.com/ZRMYDYCG">
  <img src="https://github.com/ZRMYDYCG.png" width="50px" alt="ZRMYDYCG"/>
</a>
<a href="https://github.com/DuoBaoWa">
  <img src="https://github.com/DuoBaoWa.png" width="50px" alt="DuoBaoWa"/>
</a>

---

⭐ **如果这个项目对您有帮助，请给它一个星标！**

🔗 **在线演示**: [tools.yltfspace.com](https://tools.yltfspace.com)

📧 **联系方式**: [GitHub Issues](https://github.com/LYX9527/develop-tools/issues)

---

## Star History

<a href="https://github.com/LYX9527/develop-tools/stargazers" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=LYX9527/develop-tools&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=LYX9527/develop-tools&type=Timeline" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=LYX9527/develop-tools&type=Timeline" />
  </picture>
</a>

---

*由开发者工具社区用 ❤️ 构建* 
