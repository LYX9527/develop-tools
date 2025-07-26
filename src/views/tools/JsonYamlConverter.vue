<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import {useToast} from '@/composables/useToast'
import jsyaml from 'js-yaml'

const toast = useToast()

const jsonContent = ref('')
const yamlContent = ref('')
const jsonError = ref('')
const yamlError = ref('')

// JSON 转 YAML
function jsonToYaml() {
  try {
    const jsonStr = jsonContent.value
    if (!jsonStr.trim()) {
      toast.warning('请输入JSON数据')
      return
    }
    const jsonObj = JSON.parse(jsonStr)
    const yamlStr = jsyaml.dump(jsonObj, {
      lineWidth: -1,  // 禁用折行
      noRefs: true,   // 禁用引用
      quotingType: '"' // 使用双引号
    })
    yamlContent.value = yamlStr
    jsonError.value = ''
  } catch (err: any) {
    jsonError.value = '无效的JSON格式: ' + err.message
  }
}

// YAML 转 JSON
function yamlToJson() {
  try {
    const yamlStr = yamlContent.value
    if (!yamlStr.trim()) {
      toast.warning('请输入YAML数据')
      return
    }
    const jsonObj = jsyaml.load(yamlStr)
    const jsonStr = JSON.stringify(jsonObj, null, 2)
    jsonContent.value = jsonStr
    yamlError.value = ''
  } catch (err: any) {
    yamlError.value = '无效的YAML格式: ' + err.message
  }
}

// 格式化 JSON
function formatJSON() {
  try {
    const jsonStr = jsonContent.value
    if (!jsonStr.trim()) return
    const jsonObj = JSON.parse(jsonStr)
    jsonContent.value = JSON.stringify(jsonObj, null, 2)
    jsonError.value = ''
  } catch (err: any) {
    jsonError.value = '无效的JSON格式: ' + err.message
  }
}

// 格式化 YAML
function formatYAML() {
  try {
    const yamlStr = yamlContent.value
    if (!yamlStr.trim()) return
    const jsonObj = jsyaml.load(yamlStr)
    yamlContent.value = jsyaml.dump(jsonObj, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"'
    })
    yamlError.value = ''
  } catch (err: any) {
    yamlError.value = '无效的YAML格式: ' + err.message
  }
}

// 复制内容
function copyContent(text: string) {
  if (!text.trim()) {
    toast.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(text)
    .then(() => toast.success('已复制到剪贴板'))
    .catch(() => toast.error('复制失败，请手动复制'))
}

// 清空内容
function clearContent(type: 'json' | 'yaml') {
  if (type === 'json') {
    jsonContent.value = ''
    jsonError.value = ''
  } else {
    yamlContent.value = ''
    yamlError.value = ''
  }
}

// 添加示例数据
const exampleData = {
  name: "配置示例",
  version: "1.0.0",
  description: "这是一个包含多种数据类型的示例配置文件，用于演示JSON和YAML的转换效果。",
  settings: {
    enabled: true,
    timeout: 30,
    items: [
      "第一项配置内容",
      "这是一段较长的配置说明文本",
      "another_config_item"
    ],
    database: {
      host: "localhost",
      port: 5432,
      credentials: {
        username: "admin",
        password: "password123"
      }
    }
  }
}

// 初始化示例数据
jsonContent.value = JSON.stringify(exampleData, null, 2)
jsonToYaml()

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          JSON/YAML转换工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          支持JSON和YAML格式互相转换，支持格式化
        </p>
      </div>

      <!-- 编辑器容器 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <div class="editor-container">
            <!-- JSON编辑器 -->
            <div class="editor-section">
              <div class="editor-header">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span class="text-lg font-semibold text-gray-900 dark:text-white">JSON</span>
                </div>
                <div class="button-group">
                  <Button size="sm" variant="primary" @click="formatJSON">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    格式化
                  </Button>
                  <Button size="sm" variant="ghost" @click="copyContent(jsonContent)">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    复制
                  </Button>
                  <Button size="sm" variant="ghost" @click="clearContent('json')">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    清空
                  </Button>
                </div>
              </div>
              <div class="editor-wrapper">
                <textarea
                  v-model="jsonContent"
                  class="editor-textarea dark:text-amber-50 bg-gray-100 dark:bg-gray-700"
                  placeholder="请输入JSON数据..."
                  rows="15"
                ></textarea>
              </div>
              <div v-if="jsonError" class="error-text">
                <svg class="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                {{ jsonError }}
              </div>
            </div>

            <!-- 转换按钮 -->
            <div class="conversion-buttons">
              <Button class="conversion-btn" size="lg" variant="primary" @click="jsonToYaml">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                JSON → YAML
              </Button>
              <Button class="conversion-btn" size="lg" variant="primary" @click="yamlToJson">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                YAML → JSON
              </Button>
            </div>

            <!-- YAML编辑器 -->
            <div class="editor-section">
              <div class="editor-header">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span class="text-lg font-semibold text-gray-900 dark:text-white">YAML</span>
                </div>
                <div class="button-group">
                  <Button size="sm" variant="primary" @click="formatYAML">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    格式化
                  </Button>
                  <Button size="sm" variant="ghost" @click="copyContent(yamlContent)">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    复制
                  </Button>
                  <Button size="sm" variant="ghost" @click="clearContent('yaml')">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    清空
                  </Button>
                </div>
              </div>
              <div class="editor-wrapper">
                <textarea
                  v-model="yamlContent"
                  class="editor-textarea dark:text-amber-50 bg-gray-100 dark:bg-gray-700"
                  placeholder="请输入YAML数据..."
                  rows="15"
                ></textarea>
              </div>
              <div v-if="yamlError" class="error-text">
                <svg class="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                {{ yamlError }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">功能特性</h4>
            <ul class="space-y-2">
              <li>• JSON和YAML格式互相转换</li>
              <li>• 智能格式化JSON和YAML</li>
              <li>• 实时语法错误检查</li>
              <li>• 一键复制转换结果</li>
              <li>• 支持复杂嵌套数据结构</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用技巧</h4>
            <ul class="space-y-2">
              <li>• 点击转换按钮进行格式转换</li>
              <li>• 使用格式化按钮美化代码</li>
              <li>• 复制按钮快速复制内容</li>
              <li>• 清空按钮快速清除内容</li>
              <li>• 支持大文件转换处理</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>格式说明：</strong>
            <br>• JSON：JavaScript对象表示法，使用大括号和方括号
            <br>• YAML：YAML Ain't Markup Language，使用缩进表示层级
            <br>• 支持的数据类型：字符串、数字、布尔值、数组、对象
            <br>• 自动处理特殊字符和转义序列
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.tool-container {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: start;
}

.editor-section {
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.editor-wrapper {
  flex: 1;
  position: relative;
}

.editor-textarea {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  resize: vertical;
  transition: all 0.3s ease;
}

.editor-textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-textarea::placeholder {
  color: rgba(156, 163, 175, 0.6);
}

.conversion-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  padding: 20px 0;
}

.conversion-btn {
  white-space: nowrap;
  min-width: 140px;
}

.error-text {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .conversion-buttons {
    flex-direction: row;
    justify-content: center;
    padding: 16px 0;
  }

  .conversion-btn {
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .button-group {
    justify-content: center;
  }

  .conversion-buttons {
    flex-direction: column;
  }
}
</style>
