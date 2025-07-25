<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// 配置选项
const length = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const excludeSimilar = ref(false)
const excludeAmbiguous = ref(false)
const customChars = ref('')

// 生成的密码
const generatedPasswords = ref<string[]>([])
const batchCount = ref(1)

// 字符集定义
const charsets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'il1Lo0O',
  ambiguous: '{}[]()/\\\'"`~,;.<>'
}

// 计算可用字符集
const availableChars = computed(() => {
  let chars = ''
  
  if (includeUppercase.value) chars += charsets.uppercase
  if (includeLowercase.value) chars += charsets.lowercase
  if (includeNumbers.value) chars += charsets.numbers
  if (includeSymbols.value) chars += charsets.symbols
  if (customChars.value) chars += customChars.value
  
  // 排除相似字符
  if (excludeSimilar.value) {
    chars = chars.split('').filter(char => !charsets.similar.includes(char)).join('')
  }
  
  // 排除模糊字符
  if (excludeAmbiguous.value) {
    chars = chars.split('').filter(char => !charsets.ambiguous.includes(char)).join('')
  }
  
  return [...new Set(chars.split(''))].join('')
})

// 计算密码强度
const passwordStrength = computed(() => {
  const charCount = availableChars.value.length
  const entropy = length.value * Math.log2(charCount)
  
  if (entropy < 28) return { level: '弱', color: 'text-red-500', percentage: 25 }
  if (entropy < 36) return { level: '一般', color: 'text-yellow-500', percentage: 50 }
  if (entropy < 60) return { level: '强', color: 'text-blue-500', percentage: 75 }
  return { level: '很强', color: 'text-green-500', percentage: 100 }
})

// 生成随机密码
const generatePassword = (targetLength: number = length.value): string => {
  if (availableChars.value.length === 0) {
    toast.error('请至少选择一种字符类型')
    return ''
  }
  
  let password = ''
  const chars = availableChars.value
  
  // 确保包含每种选中的字符类型至少一个
  if (includeUppercase.value && charsets.uppercase.split('').some(c => chars.includes(c))) {
    const upperChars = charsets.uppercase.split('').filter(c => chars.includes(c))
    password += upperChars[Math.floor(Math.random() * upperChars.length)]
  }
  
  if (includeLowercase.value && charsets.lowercase.split('').some(c => chars.includes(c))) {
    const lowerChars = charsets.lowercase.split('').filter(c => chars.includes(c))
    password += lowerChars[Math.floor(Math.random() * lowerChars.length)]
  }
  
  if (includeNumbers.value && charsets.numbers.split('').some(c => chars.includes(c))) {
    const numberChars = charsets.numbers.split('').filter(c => chars.includes(c))
    password += numberChars[Math.floor(Math.random() * numberChars.length)]
  }
  
  if (includeSymbols.value && charsets.symbols.split('').some(c => chars.includes(c))) {
    const symbolChars = charsets.symbols.split('').filter(c => chars.includes(c))
    password += symbolChars[Math.floor(Math.random() * symbolChars.length)]
  }
  
  // 填充剩余长度
  while (password.length < targetLength) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// 生成密码
const generate = () => {
  const passwords = []
  for (let i = 0; i < batchCount.value; i++) {
    passwords.push(generatePassword())
  }
  generatedPasswords.value = passwords
  toast.success(`已生成 ${passwords.length} 个密码！`)
}

// 复制密码
const copyPassword = async (password: string) => {
  try {
    await navigator.clipboard.writeText(password)
    toast.success('密码已复制到剪贴板！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 复制所有密码
const copyAllPasswords = async () => {
  try {
    const allPasswords = generatedPasswords.value.join('\n')
    await navigator.clipboard.writeText(allPasswords)
    toast.success('所有密码已复制到剪贴板！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 清空结果
const clearResults = () => {
  generatedPasswords.value = []
}

// 预设配置
const presets = [
  {
    name: '简单密码',
    config: {
      length: 8,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      excludeAmbiguous: false
    }
  },
  {
    name: '标准密码',
    config: {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
      excludeAmbiguous: false
    }
  },
  {
    name: '高强度密码',
    config: {
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
      excludeAmbiguous: true
    }
  },
  {
    name: 'PIN码',
    config: {
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      excludeAmbiguous: false
    }
  }
]

// 应用预设
const applyPreset = (preset: typeof presets[0]) => {
  length.value = preset.config.length
  includeUppercase.value = preset.config.includeUppercase
  includeLowercase.value = preset.config.includeLowercase
  includeNumbers.value = preset.config.includeNumbers
  includeSymbols.value = preset.config.includeSymbols
  excludeSimilar.value = preset.config.excludeSimilar
  excludeAmbiguous.value = preset.config.excludeAmbiguous
  toast.success(`已应用${preset.name}配置`)
}

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container', 
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
  
  // 自动生成一个密码
  generate()
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
          密码生成器
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          生成安全可靠的随机密码，支持多种自定义选项和强度评估
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- 配置面板 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              密码配置
            </h3>

            <!-- 预设配置 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                快速配置
              </label>
              <div class="grid grid-cols-2 gap-2">
                <Button 
                  v-for="preset in presets"
                  :key="preset.name"
                  @click="applyPreset(preset)"
                  variant="ghost"
                  size="sm"
                  class="text-xs"
                >
                  {{ preset.name }}
                </Button>
              </div>
            </div>

            <!-- 密码长度 -->
            <div class="mb-6">
              <NumberInput
                v-model="length"
                label="密码长度"
                :min="4"
                :max="128"
                :step="1"
              />
            </div>

            <!-- 字符类型选择 -->
            <div class="space-y-4 mb-6">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">包含字符类型</h4>
              
              <Checkbox
                v-model="includeUppercase"
                label="大写字母 (A-Z)"
              />
              
              <Checkbox
                v-model="includeLowercase"
                label="小写字母 (a-z)"
              />
              
              <Checkbox
                v-model="includeNumbers"
                label="数字 (0-9)"
              />
              
              <Checkbox
                v-model="includeSymbols"
                label="特殊符号 (!@#$%^&*)"
              />
            </div>

            <!-- 排除选项 -->
            <div class="space-y-4 mb-6">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">排除选项</h4>
              
              <Checkbox
                v-model="excludeSimilar"
                label="排除相似字符 (il1Lo0O)"
              />
              
              <Checkbox
                v-model="excludeAmbiguous"
                label="排除模糊字符 ({}[]())"
              />
            </div>

            <!-- 自定义字符 -->
            <div class="mb-6">
              <Input
                v-model="customChars"
                label="自定义字符"
                placeholder="添加额外字符..."
              />
            </div>

            <!-- 批量生成数量 -->
            <div class="mb-6">
              <NumberInput
                v-model="batchCount"
                label="生成数量"
                :min="1"
                :max="50"
                :step="1"
              />
            </div>

            <!-- 密码强度 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                密码强度
              </label>
              <div class="flex items-center space-x-3">
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="{
                      'bg-red-500': passwordStrength.level === '弱',
                      'bg-yellow-500': passwordStrength.level === '一般',
                      'bg-blue-500': passwordStrength.level === '强',
                      'bg-green-500': passwordStrength.level === '很强'
                    }"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <span class="text-sm font-medium" :class="passwordStrength.color">
                  {{ passwordStrength.level }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                可用字符: {{ availableChars.length }} 种
              </p>
            </div>

            <!-- 生成按钮 -->
            <Button @click="generate" variant="primary" class="w-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              生成密码
            </Button>
          </div>
        </div>

        <!-- 结果区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 111.414 1.414L13 16H9v-4l8.414-8.414z"></path>
                </svg>
                生成结果 ({{ generatedPasswords.length }})
              </h3>
              <div class="flex space-x-2">
                <Button 
                  v-if="generatedPasswords.length > 1"
                  @click="copyAllPasswords"
                  size="sm"
                  variant="ghost"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  全部复制
                </Button>
                <Button 
                  v-if="generatedPasswords.length > 0"
                  @click="clearResults"
                  size="sm"
                  variant="ghost"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  清空
                </Button>
              </div>
            </div>
            
            <div class="p-6">
              <div v-if="generatedPasswords.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">点击"生成密码"按钮创建安全密码</p>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="(password, index) in generatedPasswords"
                  :key="index"
                  class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div class="flex-1">
                    <code class="text-lg font-mono break-all select-all">{{ password }}</code>
                  </div>
                  <Button 
                    @click="copyPassword(password)"
                    size="sm"
                    variant="ghost"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 使用说明 -->
          <div class="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              安全建议
            </h3>
            <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <h4 class="font-semibold mb-2">密码强度建议：</h4>
                <ul class="space-y-1">
                  <li>• 长度至少12位字符</li>
                  <li>• 包含大小写字母、数字和符号</li>
                  <li>• 避免使用个人信息</li>
                  <li>• 定期更换重要账户密码</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold mb-2">使用注意事项：</h4>
                <ul class="space-y-1">
                  <li>• 不同账户使用不同密码</li>
                  <li>• 使用密码管理器保存</li>
                  <li>• 启用双因素认证</li>
                  <li>• 避免在公共场所输入</li>
                </ul>
              </div>
            </div>
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

/* 密码字体样式 */
code {
  letter-spacing: 0.5px;
}
</style> 