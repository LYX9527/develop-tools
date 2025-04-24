<div align="center">

# 🛠️ Development Tools Collection

English | [简体中文](./README-zh.md)

</div>

A modern collection of development tools integrating various practical development utilities.

## Tool List

### 1. WebSocket Testing Tool 🔌

A real-time communication tool for testing WebSocket connections.

#### Key Features
- Custom WebSocket URL support
- Real-time message sending and receiving
- Automatic protocol completion
- Connection status monitoring

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 2. Password Generator 🔐

Secure random password generation tool.

#### Key Features
- Customizable password length and quantity
- Multiple character type selection
- Password strength indicator
- Exclude confusing characters
- One-click copy function

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 3. JSON Tools 📝

JSON formatting and validation tools.

#### Key Features
- Tree structure display
- Syntax highlighting
- Formatting and compression
- Real-time error prompts
- Support for large data processing

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 4. Generation Tools 🎲

A collection of various generation tools.

#### Key Features
- UUID Generator
- Hash Calculator (MD5/SHA)
- File Verification Tool
- QR Code Generator

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 5. Time Tools ⏰

Collection of time-related tools.

#### Key Features
- Real-time time display
- Timestamp conversion
- Multiple time format support
- Timezone conversion

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 6. Regular Expression Tools 🎯

Regular expression testing and validation tools.

#### Key Features
- Real-time matching test
- Common regex templates
- Match result highlighting
- Regex syntax hints

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 7. Color Tools 🎨
- Color Picker: Support for RGB, HEX, HSL and other color formats
- Color Preview: Real-time color effect preview
- Shadow Generator: Generate CSS shadow code with multi-layer shadow effects
- Color Palette: Create and manage custom color palettes

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 8. YAML Conversion Tools 📄
- JSON to YAML: Convert JSON data to YAML format
- YAML to JSON: Convert YAML data to JSON format
- Syntax Validation: Real-time YAML syntax validation
- Formatting: Automatic YAML code formatting

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 9. Cron Expression Tools ⏰
- Expression Generator: Generate Cron expressions through visual interface
- Expression Parser: Parse Cron expressions and display execution times
- Common Templates: Provide common scheduled task templates
- Time Preview: Preview future execution times

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 10. RSA Tools 🔐
- Key Pair Generation: Generate RSA public and private keys
- Encryption/Decryption: Encrypt and decrypt data using RSA
- Signature Verification: Generate and verify digital signatures
- Key Format Conversion: Support PEM, DER and other format conversions

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 11. HTTP Request Tools 🌐
- Request Building: Support for GET, POST, PUT, DELETE and other HTTP methods
- Header Management: Custom request headers
- Parameter Management: Support for Query and Body parameters
- Response Preview: Formatted response display
- History: Save request history

### 12. RSA Encryption/Decryption Tools
- Support for generating RSA key pairs of different lengths (512/1024/2048/4096 bits)
- Provide public key encryption and private key decryption
- Support key copying and downloading
- Modern user experience with glassmorphism UI components

### 13. MD5 Tools 🔐
- Text Encryption: Calculate MD5 hash of text
- File Verification: Calculate MD5 checksum of files
- Batch Processing: Support batch MD5 calculation
- Result Comparison: Support MD5 value comparison verification

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 14. Grid Paper Tools 📝
- Generate grid paper background
- Support character counting for Chinese, English, punctuation, spaces, etc.
- Content filling preview
- Export functionality

#### Author
- Power By [CncCbz](https://github.com/CncCbz)

### 15. Image to ASCII Art 🖼️
- Convert images to ASCII character art
- Support for multiple character sets
- Real-time preview
- Export ASCII art

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 16. Navicat Tools 🗄️
- Database connection management
- SQL query execution
- Data import/export
- Table structure design

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 17. Image Watermark Tools 🖼️
- Image watermark addition
- Custom watermark styles
- Batch processing
- Export functionality

#### Author
- Power By [Setruth](https://github.com/Setruth)

### 18. S3 Tools ☁️
- S3 file management
- File upload/download
- Permission management
- Batch operations

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

### 19. Icon Tools 🎨
- Icon preview
- Icon export
- Size modification

#### Author
- Power By [LYX9527](https://github.com/LYX9527)

## Tech Stack

- Vue 3 + TypeScript
- Naive UI Component Library
- Pinia State Management
- Integration of various utility libraries: moment, cronstrue, jsencrypt, etc.

## Development Extension

To add new tools, please follow this structure:
1. Create a new tool directory under `src/toolPages`
2. Create `Icon.vue` to define the tool icon
3. Create `index.vue` to implement main functionality
4. Create `Info.ts` to provide tool information, following the `ToolBaseInfo` interface definition

Tool information should include:
- Name
- Description
- Tags
- Icon
- Author information (optional)

## Quick Start

1. Clone the project
```bash
git clone <repository-url>
cd develop-tools
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run in development environment
```bash
npm run dev
# or
yarn dev
```

4. Build for production
```bash
npm run build
# or
yarn build
```

## Environment Configuration

Create `.env`

## Star History

<a href="https://github.com/LYX9527/develop-tools/stargazers" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=LYX9527/develop-tools&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=LYX9527/develop-tools&type=Timeline" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=LYX9527develop-tools&type=Timeline" />
  </picture>
</a>
