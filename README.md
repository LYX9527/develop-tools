<div align="center">

```
██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗       ████████╗ ██████╗  ██████╗ ██╗     ███████╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗      ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝         ██║   ██║   ██║██║   ██║██║     ███████╗
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔══██╗         ██║   ██║   ██║██║   ██║██║     ╚════██║
██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║  ██║         ██║   ╚██████╔╝╚██████╔╝███████╗███████║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝         ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
```

# 🛠️ Developer Tools V2

*A comprehensive collection of essential development tools built with Vue 3, TypeScript, and Tailwind CSS*

</div>

Streamline your development workflow with these powerful utilities.

![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.8-38B2AC?style=flat&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 📝 Text Tools
- **JSON Formatter** - Format and beautify JSON data with syntax highlighting, compression, validation and error detection
- **Text Case Converter** - Convert text between various naming conventions (camelCase, PascalCase, snake_case, etc.)
- **Regex Tester** - Test and validate regular expressions with real-time matching and explanation
- **JSON/YAML Converter** - Convert between JSON and YAML formats with formatting support

### 🔧 Encoding & Conversion
- **Base64 Converter** - Support Base64, URL, JWT and other encoding format conversions
- **Base Converter** - Convert numbers between binary, octal, decimal, and hexadecimal
- **Time Converter** - Convert between Unix timestamps and readable date formats, support millisecond/second level conversion
- **Money Converter** - Convert numeric amounts to Chinese RMB text format

### 🎨 Design & Media
- **Color Picker** - Color picker and shadow generator with multiple shadow effects
- **QR Code Generator** - Generate various types of QR codes, support text, URL, WiFi and more
- **Icon Generator** - Create rounded icons in multiple sizes with one-click export of multiple specifications
- **ASCII Art Generator** - Convert images to ASCII character art with artistic character generation
- **Image Optimizer** - Compress and optimize images for web use, support multiple image formats
- **Image Watermark** - Add custom watermarks to images with text styling and position adjustment, provide single text and tiled modes

### 🔐 Security & Generation
- **Password Generator** - Generate secure random passwords with customizable length and character types
- **Hash Generator** - UUID generation, hash calculation and file verification tool collection
- **Navicat Decrypt** - Decrypt Navicat stored database connection passwords

### ⚡ Utilities
- **Cron Generator** - Cron expression generation and validation tool, support viewing future execution times
- **S3 Upload Tool** - Drag-and-drop file upload for S3-compatible services (R2, MinIO, etc.)
- **Short URL Generator** - Create short URLs with password protection, custom suffixes and expiration time settings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/LYX9527/develop-tools.git
cd develop-tools

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Build for Production

```bash
# Build the project
npm run build
# or
yarn build
# or
pnpm build

# Preview production build
npm run preview
# or
yarn preview
# or
pnpm preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **UI Components**: Custom components with modern design

## 📁 Project Structure

```
src/
├── views/
│   ├── Home.vue                 # Homepage
│   └── tools/                   # Tool components
│       ├── JsonFormatter.vue
│       ├── Base64Converter.vue
│       ├── ColorPicker.vue
│       └── ... (other tools)
├── router/
│   └── index.ts                 # Route configuration
├── components/                  # Reusable components
├── utils/                       # Utility functions
└── types/                       # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Maintain responsive design with Tailwind CSS
- Add proper error handling and user feedback
- Include comprehensive documentation for new tools

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to all contributors who have helped make this project better:

- **Vue.js Team** - For the amazing Vue 3 framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vite** - For the fast build tool
- **All Contributors** - For their valuable contributions and feedback

### Contributors

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

⭐ **Star this repository if you find it helpful!**

🔗 **Live Demo**: [tools.yltfspace.com](https://tools.yltfspace.com)

📧 **Contact**: [GitHub Issues](https://github.com/LYX9527/develop-tools/issues)

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

*Built with ❤️ by the Developer Tools Community*
