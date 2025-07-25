<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {gsap} from 'gsap'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import TextArea from '@/components/ui/TextArea.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import {useToast} from '@/composables/useToast'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const toast = useToast()
const activeTab = ref(0)

// 二维码生成相关
const qrInput = ref('')
const qrResult = ref('')
const qrOptions = ref({
  width: 256,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
})

// 二维码识别相关
const qrFileInput = ref<HTMLInputElement | null>(null)
const qrDecodeResult = ref('')
const qrPreviewUrl = ref('')
const isDragging = ref(false)

// 生成二维码
async function generateQRCode() {
  if (!qrInput.value.trim()) {
    toast.warning('请输入需要生成二维码的内容')
    return
  }

  try {
    qrResult.value = await QRCode.toDataURL(qrInput.value, {
      width: qrOptions.value.width,
      margin: qrOptions.value.margin,
      color: qrOptions.value.color
    })
    toast.success('二维码生成成功！')
  } catch (error) {
    toast.error('二维码生成失败')
    console.error(error)
  }
}

// 下载二维码
function downloadQRCode() {
  if (!qrResult.value) {
    toast.warning('请先生成二维码')
    return
  }

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrResult.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('二维码已下载！')
}

// 复制结果
function copyResult(text: string) {
  if (!text) {
    toast.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(text)
      .then(() => toast.success('已复制到剪贴板'))
      .catch(() => toast.error('复制失败'))
}

// 处理拖放事件
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processQRImage(file)
  } else {
    toast.error('请选择图片文件')
  }
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    processQRImage(file)
  }
}

// 触发文件选择
function triggerFileInput() {
  qrFileInput.value?.click()
}

// 统一处理二维码图片
function processQRImage(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      // 设置预览图
      qrPreviewUrl.value = e.target?.result as string

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        toast.error('无法创建画布上下文')
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        qrDecodeResult.value = code.data
        toast.success('二维码识别成功')
      } else {
        toast.error('未能识别二维码，请确保图片清晰且包含二维码')
      }
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 清空生成结果
function clearGenerate() {
  qrInput.value = ''
  qrResult.value = ''
}

// 清空识别结果
function clearDecode() {
  qrDecodeResult.value = ''
  qrPreviewUrl.value = ''
  if (qrFileInput.value) {
    qrFileInput.value.value = ''
  }
}

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
      {opacity: 0, y: 30},
      {opacity: 1, y: 0, duration: 0.8, ease: "power3.out"}
  )
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          二维码工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          生成和识别二维码，支持多种格式和自定义选项
        </p>
      </div>

      <!-- 标签页内容 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" :animated="true" variant="underline">
            <!-- 生成二维码 -->
            <TabItem label="生成二维码">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 输入和配置区域 -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入内容</label>
                    <TextArea
                        v-model="qrInput"
                        class="resize-none"
                        placeholder="输入需要生成二维码的内容（文本、链接、联系方式等）"
                        rows="6"
                    />
                  </div>

                  <!-- 配置选项 -->
                  <div class="grid grid-cols-2 gap-4">
                    <NumberInput
                        v-model="qrOptions.width"
                        :max="1024"
                        :min="128"
                        :step="32"
                        label="尺寸 (px)"
                    />
                    <NumberInput
                        v-model="qrOptions.margin"
                        :max="20"
                        :min="0"
                        label="边距"
                    />
                  </div>

                  <!-- 颜色配置 -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">前景色</label>
                      <div class="flex items-center space-x-3">
                        <input
                            v-model="qrOptions.color.dark"
                            class="w-12 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                            type="color"
                        />
                        <Input
                            v-model="qrOptions.color.dark"
                            class="font-mono flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景色</label>
                      <div class="flex items-center space-x-3">
                        <input
                            v-model="qrOptions.color.light"
                            class="w-12 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                            type="color"
                        />
                        <Input
                            v-model="qrOptions.color.light"
                            class="font-mono flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex space-x-3">
                    <Button class="flex-1" variant="primary" @click="generateQRCode">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      生成二维码
                    </Button>
                    <Button variant="ghost" @click="clearGenerate">
                      清空
                    </Button>
                  </div>
                </div>

                <!-- 预览区域 -->
                <div class="space-y-6">
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 min-h-80 flex items-center justify-center">
                    <div v-if="qrResult" class="text-center">
                      <img :src="qrResult" alt="Generated QR Code" class="max-w-full h-auto rounded-lg shadow-lg"/>
                    </div>
                    <div v-else class="text-center text-gray-500 dark:text-gray-400">
                      <svg class="w-24 h-24 mx-auto mb-4" t="1753421802171" version="1.1" viewBox="0 0 1024 1024"
                           xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M149.897707 387.566843l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425L393.707231 143.757319C393.707231 94.273016 353.614109 54.179894 304.491005 54.179894L149.897707 54.179894c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099C60.320282 347.473721 100.774603 387.566843 149.897707 387.566843zM136.533333 143.757319c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374l0 154.232099c0 7.223986-6.140388 13.364374-13.364374 13.364374L149.897707 311.353792c-7.223986 0-13.364374-6.140388-13.364374-13.364374L136.533333 143.757319z"
                            fill="#575B66" ></path>
                        <path
                            d="M304.491005 628.486772 149.897707 628.486772c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099c0 49.484303 40.093122 89.577425 89.577425 89.577425l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425l0-154.232099C393.707231 668.579894 353.614109 628.486772 304.491005 628.486772zM317.49418 872.296296c0 7.223986-6.140388 13.364374-13.364374 13.364374L149.897707 885.66067c-7.223986 0-13.364374-6.140388-13.364374-13.364374l0-154.232099c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374L317.49418 872.296296z"
                            fill="#575B66" ></path>
                        <path
                            d="M878.797884 54.179894l-154.232099 0c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099c0 49.484303 40.093122 89.577425 89.577425 89.577425l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425L968.375309 143.757319C968.014109 94.273016 927.920988 54.179894 878.797884 54.179894zM891.801058 297.989418c0 7.223986-6.140388 13.364374-13.364374 13.364374l-154.232099 0c-7.223986 0-13.364374-6.140388-13.364374-13.364374L710.840212 143.757319c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374L891.801058 297.989418z"
                            fill="#575B66" ></path>
                        <path
                            d="M673.997884 552.273721c19.865961 0 36.119929-15.892769 35.75873-36.119929 0-19.865961-15.892769-36.119929-36.119929-36.119929l-126.058554 0L547.578131 338.443739c0-19.865961-15.892769-36.119929-36.119929-35.75873-19.865961 0-36.119929 15.892769-36.119929 36.119929L475.338272 480.395062 96.440212 480.395062c-19.865961 0-36.119929 15.892769-36.119929 36.119929 0 19.865961 15.892769 36.119929 36.119929 36.119929l379.620459 0 0 169.04127c0 19.865961 15.892769 36.119929 36.119929 36.119929s36.119929-15.892769 36.119929-36.119929l0-169.04127L673.997884 552.634921z"
                            fill="#575B66" ></path>
                        <path
                            d="M932.255379 552.273721c19.865961 0 36.119929-15.892769 35.75873-36.119929 0-19.865961-15.892769-36.119929-36.119929-36.119929l-79.825044 0c-19.865961 0-36.119929 15.892769-36.119929 36.119929 0 19.865961 15.892769 36.119929 36.119929 36.119929L932.255379 552.273721z"
                            fill="#575B66" ></path>
                        <path
                            d="M511.8194 166.874074c19.865961 0 36.119929-15.892769 36.119929-36.119929L547.93933 88.855026c0-19.865961-15.892769-36.119929-36.119929-35.75873-19.865961 0-36.119929 15.892769-36.119929 36.119929l0 41.899118C476.06067 150.620106 491.953439 166.874074 511.8194 166.874074z"
                            fill="#575B66" ></path>
                        <path
                            d="M511.8194 849.179541c-19.865961 0-36.119929 15.892769-36.119929 36.119929l0 41.899118c0 19.865961 15.892769 36.119929 36.119929 36.119929s36.119929-15.892769 36.119929-36.119929l0-42.260317C547.93933 865.07231 531.685362 849.179541 511.8194 849.179541z"
                            fill="#575B66" ></path>
                        <path
                            d="M892.884656 871.573898c0 7.223986-6.140388 13.003175-13.003175 13.003175l-38.648325 0 0 75.129453 38.648325 0c48.761905 0 88.493827-39.731922 88.493827-88.493827l0-43.705115-75.129453 0L893.245855 871.573898z"
                            fill="#575B66" ></path>
                        <path
                            d="M879.520282 631.015168l-152.426102 0c-48.761905 0-88.493827 39.731922-88.493827 88.493827l0 152.426102c0 48.761905 39.731922 88.493827 88.493827 88.493827l38.648325 0L765.742504 884.938272l-38.648325 0c-7.223986 0-13.003175-6.140388-13.003175-13.003175l0-152.426102c0-7.223986 6.140388-13.003175 13.003175-13.003175l152.426102 0c7.223986 0 13.003175 6.140388 13.003175 13.003175l0 33.591534L968.014109 753.100529l0-33.591534C968.014109 670.74709 928.282187 631.015168 879.520282 631.015168z"
                            fill="#575B66" ></path>
                      </svg>
                      <p>二维码预览将显示在这里</p>
                    </div>
                  </div>

                  <!-- 下载和复制 -->
                  <div v-if="qrResult" class="flex space-x-3">
                    <Button class="flex-1" variant="primary" @click="downloadQRCode">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2"></path>
                      </svg>
                      下载图片
                    </Button>
                    <Button variant="ghost" @click="copyResult(qrResult)">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2"></path>
                      </svg>
                      复制链接
                    </Button>
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- 识别二维码 -->
            <TabItem label="识别二维码">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 上传区域 -->
                <div class="space-y-6">
                  <!-- 文件上传 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择图片</label>
                    <div
                        :class="isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                        class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                        @click="triggerFileInput"
                        @dragleave="handleDragLeave"
                        @dragover="handleDragOver"
                        @drop="handleDrop"
                    >
                      <input
                          ref="qrFileInput"
                          accept="image/*"
                          class="hidden"
                          type="file"
                          @change="handleFileSelect"
                      />
                      <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2"></path>
                      </svg>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        点击上传或拖拽图片到此处
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        支持 JPG、PNG、GIF 等格式
                      </p>
                    </div>
                  </div>

                  <!-- 图片预览 -->
                  <div v-if="qrPreviewUrl" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">图片预览</label>
                    <img :src="qrPreviewUrl" alt="QR Code Preview" class="max-w-full h-auto rounded-lg"/>
                  </div>

                  <Button class="w-full" variant="ghost" @click="clearDecode">
                    清空识别结果
                  </Button>
                </div>

                <!-- 识别结果 -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">识别结果</label>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 min-h-80">
                      <div v-if="qrDecodeResult" class="space-y-4">
                        <div class="flex items-center space-x-2">
                          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
                                  stroke-width="2"></path>
                          </svg>
                          <span class="text-sm font-medium text-green-600 dark:text-green-400">识别成功</span>
                        </div>
                        <TextArea
                            v-model="qrDecodeResult"
                            class="resize-none"
                            readonly
                            rows="8"
                        />
                        <Button class="w-full" variant="primary" @click="copyResult(qrDecodeResult)">
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"
                                  stroke-width="2"></path>
                          </svg>
                          复制结果
                        </Button>
                      </div>
                      <div v-else
                           class="text-center text-gray-500 dark:text-gray-400 h-full flex flex-col items-center justify-center">
                        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="1"></path>
                        </svg>
                        <p>上传图片后，识别结果将显示在这里</p>
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
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">生成二维码</h4>
            <ul class="space-y-2">
              <li>• 支持文本、链接、联系方式等内容</li>
              <li>• 可自定义尺寸、边距和颜色</li>
              <li>• 支持高分辨率图片下载</li>
              <li>• 实时预览生成效果</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">识别二维码</h4>
            <ul class="space-y-2">
              <li>• 支持拖拽上传和点击选择</li>
              <li>• 兼容多种图片格式</li>
              <li>• 自动识别并提取内容</li>
              <li>• 一键复制识别结果</li>
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
