<script setup lang="ts">
import {ref} from 'vue'
import {NInput, NButton, NInputNumber, NCheckbox, useMessage} from 'naive-ui'

const message = useMessage()

// 密码设置
const settings = ref({
  length: 16,
  count: 5,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeChars: '',
  excludeSimilar: false
})

// 生成的密码列表
const passwords = ref<{ value: string, strength: 'weak' | 'medium' | 'strong' }[]>([])

// 字符集
const charsets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+[]{}|;:,.<>?'
}

// 易混淆字符
const similarChars = 'iIlL1oO0'

// 计算可用字符集
const getAvailableChars = () => {
  let chars = ''
  if (settings.value.uppercase) chars += charsets.uppercase
  if (settings.value.lowercase) chars += charsets.lowercase
  if (settings.value.numbers) chars += charsets.numbers
  if (settings.value.symbols) chars += charsets.symbols

  // 排除指定字符
  const excludeChars = settings.value.excludeChars + (settings.value.excludeSimilar ? similarChars : '')
  return chars.split('').filter(char => !excludeChars.includes(char)).join('')
}

// 生成密码
function generatePasswords() {
  const chars = getAvailableChars()
  if (!chars) {
    message.warning('请至少选择一种字符类型')
    return
  }

  passwords.value = Array(settings.value.count).fill(null).map(() => {
    let password = ''
    for (let i = 0; i < settings.value.length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      password += chars[randomIndex]
    }
    return {
      value: password,
      strength: calculateStrength(password)
    }
  })
}

// 计算密码强度
function calculateStrength(password: string): 'weak' | 'medium' | 'strong' {
  const lengthCriteria = password.length >= 12
  const uppercaseCriteria = /[A-Z]/.test(password)
  const lowercaseCriteria = /[a-z]/.test(password)
  const numberCriteria = /[0-9]/.test(password)
  const symbolCriteria = /[!@#$%^&*()_+\[\]{}|;:,.<>?]/.test(password)

  const criteriaMet = [
    lengthCriteria,
    uppercaseCriteria,
    lowercaseCriteria,
    numberCriteria,
    symbolCriteria
  ].filter(Boolean).length

  if (criteriaMet >= 4) return 'strong'
  if (criteriaMet >= 3) return 'medium'
  return 'weak'
}

// 复制密码
function copyPassword(password: string) {
  navigator.clipboard.writeText(password)
      .then(() => message.success('密码已复制到剪贴板'))
      .catch(() => message.error('复制失败'))
}

// 强度说明
const strengthTips = {
  weak: '弱',
  medium: '中',
  strong: '强'
}

// 强度类名
const getStrengthClass = (strength: 'weak' | 'medium' | 'strong') => {
  return {
    'strength-weak': strength === 'weak',
    'strength-medium': strength === 'medium',
    'strength-strong': strength === 'strong'
  }
}
</script>

<template>
  <div class="password-tool">
    <div class="settings-section">
      <div class="setting-group">
        <div class="setting-item">
          <span class="setting-label">密码长度:</span>
          <NInputNumber
              v-model:value="settings.length"
              :min="4"
              :max="64"
              class="setting-input"
          />
        </div>

        <div class="setting-item">
          <span class="setting-label">生成数量:</span>
          <NInputNumber
              v-model:value="settings.count"
              :min="1"
              :max="50"
              class="setting-input"
          />
        </div>
      </div>

      <div class="setting-group">
        <div class="setting-item">
          <NCheckbox v-model:checked="settings.uppercase">包含大写字母 ( {{ charsets.uppercase }} )
          </NCheckbox>
        </div>
        <div class="setting-item">
          <NCheckbox v-model:checked="settings.lowercase">包含小写字母 ( {{ charsets.lowercase }} )</NCheckbox>
        </div>
        <div class="setting-item">
          <NCheckbox v-model:checked="settings.numbers">包含数字 ( {{ charsets.numbers }} )</NCheckbox>
        </div>
        <div class="setting-item">
          <NCheckbox v-model:checked="settings.symbols">包含特殊字符 ( {{ charsets.symbols }} )</NCheckbox>
        </div>
        <div class="setting-item">
          <NCheckbox v-model:checked="settings.excludeSimilar">排除易混淆字符 ( {{ similarChars }} )</NCheckbox>
        </div>
      </div>

      <div class="setting-item">
        <span class="setting-label">排除字符:</span>
        <NInput
            v-model:value="settings.excludeChars"
            placeholder="输入要排除的字符"
            class="setting-input"
        />
      </div>

      <div class="action-buttons">
        <NButton type="primary" @click="generatePasswords">生成密码</NButton>
      </div>
    </div>

    <div class="password-list">
      <div v-for="(password, index) in passwords"
           :key="index"
           class="password-item"
           :class="{ 'odd': index % 2 === 0 }">
        <div class="password-content">
          <div class="password-index">#{{ index + 1 }}</div>
          <div class="password-value">{{ password.value }}</div>
        </div>
        <div class="password-actions">
          <span :class="['strength-indicator', getStrengthClass(password.strength)]">
            强度: {{ strengthTips[password.strength] }}
          </span>
          <NButton size="small" @click="copyPassword(password.value)">复制</NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.password-tool {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .settings-section {
    background-color: var(--n-card-color);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
    display: flex;
    flex-direction: column;
    gap: 20px;

    .setting-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .setting-label {
        font-size: 14px;
        color: var(--n-text-color-3);
        width: 100px;
      }

      .setting-input {
        width: 200px;
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
    }
  }

  .password-list {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .password-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--n-color);
      transition: all 0.3s ease;

      &.odd {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &:hover {
        background-color: var(--n-color-hover);
      }

      .password-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .password-index {
          font-size: 12px;
          color: var(--n-text-color-3);
          width: 30px;
          flex-shrink: 0;
        }

        .password-value {
          font-family: 'Fira Code', monospace;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .password-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;

        .strength-indicator {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          min-width: 60px;
          text-align: center;

          &.strength-weak {
            background-color: var(--error-color);
            color: white;
          }

          &.strength-medium {
            background-color: var(--warning-color);
            color: white;
          }

          &.strength-strong {
            background-color: var(--success-color);
            color: white;
          }
        }
      }
    }
  }
}
</style>
