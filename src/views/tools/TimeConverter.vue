<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {gsap} from 'gsap'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()
const activeTab = ref('now')

// 当前时间显示
const currentTime = ref({
  standard: '', // 标准时间
  local: '',    // 本地时间
  utc: '',      // UTC时间
  timestamp: '', // 秒级时间戳
  milliseconds: '', // 毫秒级时间戳
  date: '',     // 日期格式
  time: '',     // 时间格式
  custom: ''    // 自定义格式
})

// 更新当前时间的所有格式
function updateCurrentTime() {
  const now = new Date()
  currentTime.value = {
    standard: now.toISOString(),
    local: now.toLocaleString(),
    utc: now.toUTCString(),
    timestamp: Math.floor(now.getTime() / 1000).toString(),
    milliseconds: now.getTime().toString(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    custom: now.toISOString().slice(0, 19).replace('T', ' ')
  }
}

// 复制指定格式的时间
function copyTime(format: keyof typeof currentTime.value) {
  const text = currentTime.value[format]
  navigator.clipboard.writeText(text)
      .then(() => toast.success('复制成功'))
      .catch(() => toast.error('复制失败'))
}

// 时间戳转换相关
const timestampInput = ref('')
const datetimeInput = ref('')

// 时间戳转日期时间
function timestampToDatetime() {
  try {
    const timestamp = parseInt(timestampInput.value)
    // 判断是否为毫秒级时间戳
    const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
    datetimeInput.value = date.toISOString().slice(0, 19).replace('T', ' ')
  } catch (error) {
    toast.error('请输入有效的时间戳')
  }
}

// 日期时间转时间戳
function datetimeToTimestamp() {
  try {
    const date = new Date(datetimeInput.value)
    timestampInput.value = Math.floor(date.getTime() / 1000).toString()
  } catch (error) {
    toast.error('请输入有效的日期时间')
  }
}

// 获取当前时间
function getNowTime() {
  const now = new Date()
  timestampInput.value = Math.floor(now.getTime() / 1000).toString()
  datetimeInput.value = now.toISOString().slice(0, 19).replace('T', ' ')
}

// 清空输入
function clearInput() {
  timestampInput.value = ''
  datetimeInput.value = ''
}

// 每秒更新当前时间
let timer: number

// 动画
onMounted(() => {
  updateCurrentTime()
  timer = setInterval(updateCurrentTime, 1000)

  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
          时间转换工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          Unix时间戳与日期格式互转工具，支持毫秒/秒级时间戳转换
        </p>
      </div>

      <!-- 标签页 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" animated variant="underline">
            <TabItem id="now" label="当前时间">
              <!-- 当前时间面板 -->
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标准时间</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.standard"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('standard')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">本地时间</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.local"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('local')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">UTC时间</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.utc"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('utc')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">秒级时间戳</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.timestamp"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('timestamp')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">毫秒级时间戳</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.milliseconds"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('milliseconds')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">日期格式</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.date"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('date')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">时间格式</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.time"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('time')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>

                  <div class="format-item md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">自定义格式</label>
                    <div class="flex space-x-2">
                      <Input
                        :model-value="currentTime.custom"
                        class="flex-1 font-mono text-sm"
                        readonly
                      />
                      <Button size="sm" variant="ghost" @click="copyTime('custom')">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabItem>

            <TabItem id="convert" label="时间转换">
              <!-- 时间转换面板 -->
              <div class="space-y-6">
                <div class="input-group">
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">时间戳</label>
                    <Button size="sm" variant="ghost" @click="copyTime('timestamp')">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      复制当前
                    </Button>
                  </div>
                  <div class="flex space-x-2">
                    <Input
                      v-model="timestampInput"
                      class="flex-1 font-mono"
                      placeholder="请输入时间戳..."
                    />
                    <Button variant="primary" @click="timestampToDatetime">
                      转换为日期时间
                    </Button>
                  </div>
                </div>

                <div class="input-group">
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">日期时间</label>
                    <Button size="sm" variant="ghost" @click="copyTime('custom')">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      复制当前
                    </Button>
                  </div>
                  <div class="flex space-x-2">
                    <Input
                      v-model="datetimeInput"
                      class="flex-1 font-mono"
                      placeholder="请输入日期时间..."
                    />
                    <Button variant="primary" @click="datetimeToTimestamp">
                      转换为时间戳
                    </Button>
                  </div>
                </div>

                <div class="flex justify-center space-x-4">
                  <Button variant="primary" @click="getNowTime">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    获取当前时间
                  </Button>
                  <Button variant="danger" @click="clearInput">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    清空
                  </Button>
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
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">功能特性</h4>
            <ul class="space-y-2">
              <li>• 实时显示当前时间多种格式</li>
              <li>• 支持秒级和毫秒级时间戳</li>
              <li>• 时间戳与日期时间互转</li>
              <li>• 一键复制各种时间格式</li>
              <li>• 自动识别时间戳类型</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">使用技巧</h4>
            <ul class="space-y-2">
              <li>• 时间戳支持秒级(10位)和毫秒级(13位)</li>
              <li>• 日期时间格式：YYYY-MM-DD HH:mm:ss</li>
              <li>• 点击复制按钮快速复制时间</li>
              <li>• 使用"获取当前时间"快速填充</li>
              <li>• 支持UTC和本地时间显示</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>时间格式说明：</strong>
            <br>• 标准时间：ISO 8601格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
            <br>• 本地时间：根据系统时区显示
            <br>• UTC时间：协调世界时
            <br>• 自定义格式：YYYY-MM-DD HH:mm:ss
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

.format-item {
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.format-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.input-group {
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>
