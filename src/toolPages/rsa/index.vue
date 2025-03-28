<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NSpace, NTabs, NTabPane, NSelect, useMessage } from 'naive-ui'
import { generateKeyPair, encrypt, decrypt } from './rsa'
import GlassMorphismSelect from "@/components/GlassMorphismSelect.vue";
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

const message = useMessage()
const activeTab = ref('generate')

// 密钥生成
const keySize = ref(2048)
const publicKey = ref('')
const privateKey = ref('')

// 加密解密
const inputText = ref('')
const outputText = ref('')
const currentPublicKey = ref('')
const currentPrivateKey = ref('')

// 生成密钥对
async function generateKeys() {
  try {
    const { publicKey: pubKey, privateKey: privKey } = await generateKeyPair(keySize.value)
    publicKey.value = pubKey
    privateKey.value = privKey
    message.success('密钥对生成成功')
  } catch (error) {
    message.error('密钥对生成失败')
  }
}

// 复制密钥
function copyKey(type: 'public' | 'private') {
  const key = type === 'public' ? publicKey.value : privateKey.value
  if (!key) {
    message.warning('请先生成密钥对')
    return
  }
  navigator.clipboard.writeText(key)
    .then(() => message.success('复制成功'))
    .catch(() => message.error('复制失败'))
}

// 下载密钥文件
function downloadKey(type: 'public' | 'private') {
  const key = type === 'public' ? publicKey.value : privateKey.value
  if (!key) {
    message.warning('请先生成密钥对')
    return
  }

  const blob = new Blob([key], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = type === 'public' ? 'public.pem' : 'private.pem'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  message.success('下载成功')
}

// 加密
async function encryptText() {
  if (!inputText.value) {
    message.warning('请输入要加密的内容')
    return
  }
  if (!currentPublicKey.value) {
    message.warning('请输入公钥')
    return
  }
  try {
    outputText.value = await encrypt(inputText.value, currentPublicKey.value)
    message.success('加密成功')
  } catch (error) {
    message.error('加密失败')
  }
}

// 解密
async function decryptText() {
  if (!inputText.value) {
    message.warning('请输入要解密的内容')
    return
  }
  if (!currentPrivateKey.value) {
    message.warning('请输入私钥')
    return
  }
  try {
    outputText.value = await decrypt(inputText.value, currentPrivateKey.value)
    message.success('解密成功')
  } catch (error) {
    message.error('解密失败')
  }
}

// 清空输入
function clearInput() {
  inputText.value = ''
  outputText.value = ''
}

// 复制结果
function copyResult() {
  if (!outputText.value) {
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(outputText.value)
    .then(() => message.success('复制成功'))
    .catch(() => message.error('复制失败'))
}
</script>

<template>
  <div class="rsa-tool">
    <NTabs v-model:value="activeTab" type="line" animated>
      <NTabPane name="generate" tab="密钥生成">
        <div class="key-section">
          <div class="key-header">
            <span class="section-title">密钥长度:</span>
            <NSpace>
              <glass-morphism-select
                  style="width: 120px;margin-right: 40px"
                  v-model:modelValue="keySize"
                  :options="[
                    { label: '512 位', value: 512 },
                    { label: '1024 位', value: 1024 },
                    { label: '2048 位', value: 2048 },
                    { label: '4096 位', value: 4096 }
                  ]"
              />
              <NButton type="primary" @click="generateKeys">生成密钥对</NButton>
            </NSpace>
          </div>

          <div class="key-group">
            <div class="key-item">
              <div class="key-header">
                <span class="key-label">公钥:</span>
                <div class="key-actions">
                  <NButton size="small" @click="copyKey('public')">复制</NButton>
                  <NButton size="small" @click="downloadKey('public')">下载</NButton>
                </div>
              </div>
              <glass-morphism-input
                  v-model:modelValue="publicKey"
                  textarea
                  readonly
                  rows="10"
              />
            </div>

            <div class="key-item">
              <div class="key-header">
                <span class="key-label">私钥:</span>
                <div class="key-actions">
                  <NButton size="small" @click="copyKey('private')">复制</NButton>
                  <NButton size="small" @click="downloadKey('private')">下载</NButton>
                </div>
              </div>
              <glass-morphism-input
                  v-model:modelValue="privateKey"
                  textarea
                  readonly
                  rows="10"
              />
            </div>
          </div>
        </div>
      </NTabPane>

      <NTabPane name="encrypt" tab="加密">
        <div class="crypto-section">
          <div class="input-group">
            <div class="input-header">
              <span class="section-title">公钥:</span>
            </div>
            <glass-morphism-input
                v-model:modelValue="currentPublicKey"
                textarea
                placeholder="请输入公钥..."
                rows="10"
            />
          </div>

          <div class="input-group">
            <div class="input-header">
              <span class="section-title">待加密内容:</span>
              <NSpace>
                <NButton type="primary" @click="encryptText">加密</NButton>
                <NButton type="error" @click="clearInput">清空</NButton>
              </NSpace>
            </div>
            <glass-morphism-input
                v-model:modelValue="inputText"
                placeholder="请输入要加密的内容..."
                textarea
                rows="10"
            />
          </div>

          <div class="output-group">
            <div class="output-header">
              <span class="section-title">加密结果:</span>
              <NButton size="small" @click="copyResult">复制</NButton>
            </div>
            <glass-morphism-input
                v-model:modelValue="outputText"
                textarea
                readonly
                rows="10"
            />
          </div>
        </div>
      </NTabPane>

      <NTabPane name="decrypt" tab="解密">
        <div class="crypto-section">
          <div class="input-group">
            <div class="input-header">
              <span class="section-title">私钥:</span>
            </div>
            <glass-morphism-input
                v-model:modelValue="currentPrivateKey"
                placeholder=""
                textarea
                rows="10"
            />
          </div>

          <div class="input-group">
            <div class="input-header">
              <span class="section-title">待解密内容:</span>
              <NSpace>
                <NButton type="primary" @click="decryptText">解密</NButton>
                <NButton type="error" @click="clearInput">清空</NButton>
              </NSpace>
            </div>
            <glass-morphism-input
                v-model:modelValue="inputText"
                placeholder="请输入要解密的内容..."
                textarea
                rows="10"
            />
          </div>

          <div class="output-group">
            <div class="output-header">
              <span class="section-title">解密结果:</span>
              <NButton size="small" @click="copyResult">复制</NButton>
            </div>

            <glass-morphism-input
                v-model:modelValue="outputText"
                placeholder="解密结果"
                textarea
                readonly
                rows="10"
            />
          </div>
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.rsa-tool {
  padding: 20px;

  .key-section,
  .crypto-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .key-header,
    .input-header,
    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .section-title,
      .key-label {
        font-size: 14px;
        color: var(--n-text-color-3);
      }
    }

    .key-group {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .key-item {
        background-color: var(--n-color);
        padding: 16px;
        border-radius: 4px;
        border: 1px solid var(--n-border-color);
      }
    }

    .input-group,
    .output-group {
      background-color: var(--n-color);
      padding: 16px;
      border-radius: 4px;
      border: 1px solid var(--n-border-color);
    }

    .key-header {
      .key-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  :deep(.n-input) {
    .n-input__textarea-el {
      font-family: 'Fira Code', monospace;
    }
  }
}
</style>
