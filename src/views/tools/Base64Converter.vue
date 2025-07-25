<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

// 标签页管理
const activeTab = ref(0)

// Base64 相关
const base64Input = ref('')
const base64Output = ref('')

// URL 相关
const urlInput = ref('')
const urlOutput = ref('')

// JWT 相关
const jwtInput = ref('')
const jwtOutput = ref('')

// Base64 编码
const base64Encode = () => {
  if (!base64Input.value.trim()) {
    toast.warning('请输入要编码的文本')
    return
  }

  try {
    base64Output.value = btoa(unescape(encodeURIComponent(base64Input.value)))
    toast.success('Base64编码成功！')
  } catch (error) {
    toast.error('Base64编码失败，请检查输入内容')
  }
}

// Base64 解码
const base64Decode = () => {
  if (!base64Output.value && !base64Input.value.trim()) {
    toast.warning('请输入要解码的Base64文本')
    return
  }

  const input = base64Output.value || base64Input.value
  try {
    base64Output.value = decodeURIComponent(escape(atob(input)))
    toast.success('Base64解码成功！')
  } catch (error) {
    toast.error('Base64解码失败，请检查格式是否正确')
  }
}

// URL 编码
const urlEncode = () => {
  if (!urlInput.value.trim()) {
    toast.warning('请输入要编码的URL')
    return
  }

  try {
    urlOutput.value = encodeURIComponent(urlInput.value)
    toast.success('URL编码成功！')
  } catch (error) {
    toast.error('URL编码失败')
  }
}

// URL 解码
const urlDecode = () => {
  if (!urlOutput.value && !urlInput.value.trim()) {
    toast.warning('请输入要解码的URL')
    return
  }

  const input = urlOutput.value || urlInput.value
  try {
    urlOutput.value = decodeURIComponent(input)
    toast.success('URL解码成功！')
  } catch (error) {
    toast.error('URL解码失败，请检查格式是否正确')
  }
}

// JWT 解析
const parseJWT = () => {
  if (!jwtInput.value.trim()) {
    toast.warning('请输入要解析的JWT令牌')
    return
  }

  try {
    const parts = jwtInput.value.trim().split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    jwtOutput.value = JSON.stringify({
      header,
      payload
    }, null, 2)
    toast.success('JWT解析成功！')
  } catch (error) {
    toast.error('JWT解析失败，请检查令牌格式是否正确')
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  if (!text) {
    toast.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 清空函数
const clearBase64 = () => {
  base64Input.value = ''
  base64Output.value = ''
}

const clearUrl = () => {
  urlInput.value = ''
  urlOutput.value = ''
}

const clearJwt = () => {
  jwtInput.value = ''
  jwtOutput.value = ''
}

// 示例数据
const loadBase64Example = () => {
  base64Input.value = '欢迎使用开发者工具箱！这是一个功能强大的在线工具集合。'
}

const loadUrlExample = () => {
  urlInput.value = 'https://example.com/search?q=开发者工具&category=编程&sort=最新'
}

const loadJwtExample = () => {
  jwtInput.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
}

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
          编码转换工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          支持Base64、URL、JWT等多种编码格式的编码和解码转换
        </p>
      </div>

      <!-- 标签页内容 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" variant="underline" :animated="true">
            <!-- Base64 转换 -->
            <TabItem label="Base64">
              <div class="space-y-6">
                <div class="grid lg:grid-cols-2 gap-6">
                  <!-- 输入区域 -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">输入文本</h3>
                      <div class="flex space-x-2">
                        <Button @click="loadBase64Example" variant="ghost" size="sm">示例</Button>
                        <Button @click="clearBase64" variant="ghost" size="sm">清空</Button>
                      </div>
                    </div>
                    <TextArea
                      v-model="base64Input"
                      placeholder="在此输入要编码/解码的文本..."
                      rows="8"
                      class="font-mono text-sm"
                    />
                    <div class="flex space-x-2">
                      <Button @click="base64Encode" variant="primary" class="flex-1">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                        </svg>
                        编码
                      </Button>
                      <Button @click="base64Decode" variant="secondary" class="flex-1">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                        解码
                      </Button>
                    </div>
                  </div>

                  <!-- 输出区域 -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">输出结果</h3>
                      <Button @click="copyToClipboard(base64Output)" variant="ghost" size="sm" :disabled="!base64Output">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                    <TextArea
                      v-model="base64Output"
                      placeholder="转换结果将显示在这里..."
                      rows="8"
                      disabled
                      class="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- URL 转换 -->
            <TabItem label="URL">
              <div class="space-y-6">
                <div class="grid lg:grid-cols-2 gap-6">
                  <!-- 输入区域 -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">输入URL</h3>
                      <div class="flex space-x-2">
                        <Button @click="loadUrlExample" variant="ghost" size="sm">示例</Button>
                        <Button @click="clearUrl" variant="ghost" size="sm">清空</Button>
                      </div>
                    </div>
                    <TextArea
                      v-model="urlInput"
                      placeholder="在此输入要编码/解码的URL..."
                      rows="8"
                      class="font-mono text-sm"
                    />
                    <div class="flex space-x-2">
                      <Button @click="urlEncode" variant="primary" class="flex-1">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        编码
                      </Button>
                      <Button @click="urlDecode" variant="secondary" class="flex-1">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        解码
                      </Button>
                    </div>
                  </div>

                  <!-- 输出区域 -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">输出结果</h3>
                      <Button @click="copyToClipboard(urlOutput)" variant="ghost" size="sm" :disabled="!urlOutput">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                    <TextArea
                      v-model="urlOutput"
                      placeholder="转换结果将显示在这里..."
                      rows="8"
                      disabled
                      class="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- JWT 解析 -->
            <TabItem label="JWT">
              <div class="space-y-6">
                <div class="grid lg:grid-cols-2 gap-6">
                  <!-- 输入区域 -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">输入JWT令牌</h3>
                      <div class="flex space-x-2">
                        <Button @click="loadJwtExample" variant="ghost" size="sm">示例</Button>
                        <Button @click="clearJwt" variant="ghost" size="sm">清空</Button>
                      </div>
                    </div>
                    <TextArea
                      v-model="jwtInput"
                      placeholder="在此输入要解析的JWT令牌..."
                      rows="8"
                      class="font-mono text-sm"
                    />
                    <Button @click="parseJWT" variant="primary" class="w-full">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      解析JWT
                    </Button>
                  </div>

                  <!-- 输出区域 -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">解析结果</h3>
                      <Button @click="copyToClipboard(jwtOutput)" variant="ghost" size="sm" :disabled="!jwtOutput">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                    <TextArea
                      v-model="jwtOutput"
                      placeholder="解析结果将以JSON格式显示在这里..."
                      rows="8"
                      disabled
                      class="font-mono text-sm"
                    />

                    <!-- JWT 组成部分说明 -->
                    <div v-if="jwtOutput" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">JWT 结构说明</h4>
                      <div class="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <p><span class="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">Header</span>：包含令牌类型和签名算法</p>
                        <p><span class="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">Payload</span>：包含声明信息（用户数据、过期时间等）</p>
                        <p><span class="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">Signature</span>：用于验证令牌完整性（此工具不显示）</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabItem>
          </Tab>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-3 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">Base64 编码</h4>
            <ul class="space-y-2">
              <li>• 将文本转换为Base64格式</li>
              <li>• 支持中文和特殊字符</li>
              <li>• 常用于数据传输和存储</li>
              <li>• 可逆转换，支持解码还原</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">URL 编码</h4>
            <ul class="space-y-2">
              <li>• 处理URL中的特殊字符</li>
              <li>• 确保URL在浏览器中正确显示</li>
              <li>• 编码空格、中文等字符</li>
              <li>• Web开发必备工具</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">JWT 解析</h4>
            <ul class="space-y-2">
              <li>• 解析JWT令牌的Header和Payload</li>
              <li>• 查看令牌中的用户信息</li>
              <li>• 检查过期时间和权限</li>
              <li>• 调试认证问题的利器</li>
            </ul>
          </div>
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
</style>
