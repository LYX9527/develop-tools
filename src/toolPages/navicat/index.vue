<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CryptoJS from 'crypto-js'
import GlassMorphismInput from '@/components/GlassMorphismInput.vue'
import GlassMorphismSelect from '@/components/GlassMorphismSelect.vue'

// 状态定义
const encryptedPassword = ref('')
const decryptedPassword = ref('')
const version = ref(12)
const errorMessage = ref('')
const connections = ref<any[]>([])
const dragActive = ref(false)
const activeTab = ref(0)

const versionOptions = [
  { label: 'Navicat 11', value: 11 },
  { label: 'Navicat 12/15+', value: 12 }
]

// 辅助函数：XOR 两个字符串
function xorBytes(s1: CryptoJS.lib.WordArray, s2: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  const result = CryptoJS.lib.WordArray.create();
  for (let i = 0; i < s1.words.length; i++) {
    result.words[i] = s1.words[i] ^ s2.words[i];
  }
  result.sigBytes = s1.sigBytes;
  return result;
}

// 解密Navicat 12/15版本的密码
function decryptTwelve(encryptedHex: string): string {
  try {
    // 16进制转字节数组
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex.toLowerCase());

    // 固定密钥和IV
    const key = CryptoJS.enc.Utf8.parse('libcckeylibcckey');
    const iv = CryptoJS.enc.Utf8.parse('libcciv libcciv ');

    // AES-128-CBC 解密
    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext },
        key,
        {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('解密Navicat 12/15密码失败:', e);
    throw new Error('解密失败，请检查输入格式是否正确');
  }
}

// 解密Navicat 11版本的密码（注：由于浏览器限制，此功能可能需要后端支持）
function decryptEleven(encryptedHex: string): string {
  // 注：Blowfish算法在前端实现有限制，这里仅作为示例
  errorMessage.value = "Navicat 11版本解密需要完整的Blowfish-ECB支持，当前版本仅支持Navicat 12/15+";
  return "暂不支持Navicat 11解密";
}

// 解密密码
function decrypt() {
  if (!encryptedPassword.value) {
    decryptedPassword.value = '';
    errorMessage.value = '';
    return;
  }

  try {
    errorMessage.value = '';

    if (version.value === 12) {
      decryptedPassword.value = decryptTwelve(encryptedPassword.value);
    } else if (version.value === 11) {
      decryptedPassword.value = decryptEleven(encryptedPassword.value);
    } else {
      throw new Error('不支持的Navicat版本');
    }
  } catch (error) {
    console.error('解密失败:', error);
    decryptedPassword.value = '';
    errorMessage.value = error instanceof Error ? error.message : '解密失败，请检查输入和版本';
  }
}

// 处理输入变化
function handleInputChange() {
  if (encryptedPassword.value) {
    decrypt();
  } else {
    decryptedPassword.value = '';
    errorMessage.value = '';
  }
}

// 解析NCX文件
function parseNcxFile(content: string) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    const connectionElements = xmlDoc.getElementsByTagName("Connection");
    const parsedConnections = [];

    for (let i = 0; i < connectionElements.length; i++) {
      const conn = connectionElements[i];
      const connObj: any = {
        name: conn.getAttribute("ConnectionName") || "未命名",
        type: conn.getAttribute("ConnType") || "未知",
        host: conn.getAttribute("Host") || "",
        port: conn.getAttribute("Port") || "",
        user: conn.getAttribute("UserName") || ""
      };

      // 检查是否有密码属性 - 注意实际NCX文件可能以不同方式存储密码
      const password = conn.getAttribute("Password");
      const encryptedPwd = conn.getAttribute("EncryptedPassword");

      if (password) {
        connObj.encryptedPassword = password;
        try {
          connObj.decryptedPassword = version.value === 12
              ? decryptTwelve(password)
              : decryptEleven(password);
        } catch (e) {
          connObj.decryptedPassword = "解密失败";
        }
      } else if (encryptedPwd) {
        connObj.encryptedPassword = encryptedPwd;
        try {
          connObj.decryptedPassword = version.value === 12
              ? decryptTwelve(encryptedPwd)
              : decryptEleven(encryptedPwd);
        } catch (e) {
          connObj.decryptedPassword = "解密失败";
        }
      } else {
        connObj.encryptedPassword = "未找到";
        connObj.decryptedPassword = "未找到";
      }

      parsedConnections.push(connObj);
    }

    connections.value = parsedConnections;

    if (parsedConnections.length === 0) {
      errorMessage.value = "在NCX文件中未找到连接信息";
    } else if (!parsedConnections.some(conn => conn.encryptedPassword && conn.encryptedPassword !== "未找到")) {
      errorMessage.value = "在NCX文件中未找到加密密码。注意：标准NCX文件通常不直接存储密码信息，密码可能存储在其他位置。";
    } else {
      errorMessage.value = "";
    }
  } catch (e) {
    console.error("解析NCX文件失败:", e);
    errorMessage.value = "解析NCX文件失败，请确保文件格式正确";
    connections.value = [];
  }
}

// 处理文件拖放
function handleDragOver(e: DragEvent) {
  e.preventDefault();
  dragActive.value = true;
}

function handleDragLeave() {
  dragActive.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  dragActive.value = false;

  if (e.dataTransfer?.files.length) {
    const file = e.dataTransfer.files[0];
    if (file.name.endsWith('.ncx')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseNcxFile(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      errorMessage.value = "请拖放Navicat连接文件(.ncx)";
    }
  }
}

// 处理文件选择
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) {
    const file = input.files[0];
    if (file.name.endsWith('.ncx')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseNcxFile(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      errorMessage.value = "请选择Navicat连接文件(.ncx)";
    }
  }
}

// 添加导出JSON功能
function exportJson() {
  try {
    let jsonData;
    let filename;

    if (activeTab.value === 0 && decryptedPassword.value) {
      // 导出单个密码解密结果
      jsonData = {
        encryptedPassword: encryptedPassword.value,
        decryptedPassword: decryptedPassword.value,
        version: version.value
      };
      filename = 'navicat-password.json';
    } else if (activeTab.value === 1 && connections.value.length > 0) {
      // 导出连接信息
      jsonData = connections.value;
      filename = 'navicat-connections.json';
    } else {
      errorMessage.value = "没有可导出的数据";
      return;
    }

    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(jsonData, null, 2);

    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('导出JSON失败:', error);
    errorMessage.value = '导出失败';
  }
}

// 切换标签页
function switchTab(index: number) {
  activeTab.value = index;
}
</script>

<template>
  <div class="navicat-password-container">
    <h1 class="title">Navicat 密码解密工具</h1>

    <div class="description">
      <p>此工具可以解密Navicat保存的数据库连接密码。</p>
      <p>您可以直接输入加密密码进行解密，或者拖放NCX连接文件进行批量解析。</p>
    </div>

    <div class="tabs">
      <div class="tab-header">
        <div
            class="tab-item"
            :class="{ 'active': activeTab === 0 }"
            @click="switchTab(0)"
        >密码解密</div>
        <div class="tab-divider"></div>
        <div
            class="tab-item"
            :class="{ 'active': activeTab === 1 }"
            @click="switchTab(1)"
        >NCX文件解析</div>
      </div>

      <div class="tab-content">
        <!-- 密码解密面板 -->
        <div v-show="activeTab === 0" class="form-container">
          <div class="form-item">
            <div class="label">Navicat版本:</div>
            <GlassMorphismSelect
                v-model="version"
                :options="versionOptions"
                @change="handleInputChange"
                width="97%"
            />
          </div>

          <div class="form-item">
            <div class="label">加密密码:</div>
            <GlassMorphismInput
                v-model="encryptedPassword"
                placeholder="请输入Navicat加密的密码"
                @input="handleInputChange"
            />
          </div>

          <div class="form-item">
            <div class="label">解密结果:</div>
            <GlassMorphismInput
                v-model="decryptedPassword"
                placeholder="解密后的密码将显示在这里"
                readonly
            />
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          </div>

          <div v-if="decryptedPassword" class="action-buttons">
            <button class="export-button" @click="exportJson">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              导出JSON
            </button>
          </div>
        </div>

        <!-- NCX文件解析面板 -->
        <div v-show="activeTab === 1" class="ncx-section">
          <div
              class="ncx-drop-area"
              :class="{ 'active': dragActive }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
          >
            <div class="drop-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
            </div>
            <p>拖放NCX文件到这里，或 <label class="file-select-label">
              <input type="file" accept=".ncx" @change="handleFileSelect" />
              选择文件
            </label></p>
          </div>

          <div v-if="connections.length" class="connections-list">
            <div class="connections-header">
              <h3>连接信息</h3>
              <button class="export-button" @click="exportJson">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                导出JSON
              </button>
            </div>

            <div v-for="(conn, index) in connections" :key="index" class="connection-item">
              <div class="connection-header">
                <span class="connection-name">{{ conn.name }}</span>
                <span class="connection-type">{{ conn.type }}</span>
              </div>

              <div class="connection-details">
                <div class="detail-item">
                  <span class="detail-label">主机:</span>
                  <span class="detail-value">{{ conn.host }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">端口:</span>
                  <span class="detail-value">{{ conn.port }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">用户名:</span>
                  <span class="detail-value">{{ conn.user }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">加密密码:</span>
                  <span class="detail-value">{{ conn.encryptedPassword }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">解密密码:</span>
                  <span class="detail-value">{{ conn.decryptedPassword }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="notes">
      <p>注意:</p>
      <ul>
        <li>当前版本主要支持Navicat 12和15+版本的密码解密</li>
        <li>NCX文件通常不直接包含密码信息，密码可能存储在其他位置</li>
        <li>密码解密在浏览器中完成，不会发送到任何服务器</li>
        <li>本工具仅用于正当用途，请勿用于非法活动</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.navicat-password-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--n-text-color, inherit);
}

.description {
  margin-bottom: 30px;
  p {
    margin-bottom: 10px;
    color: var(--n-text-color-2, inherit);
  }
}

.tabs {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.1);
}

.tab-header {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;

  &.active {
    color: #40a9ff;
    border-bottom: 2px solid #40a9ff;
  }
}

.tab-divider {
  width: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.tab-content {
  padding: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--n-text-color, inherit);
  }
}

.ncx-section {
  margin-top: 20px;
}

.ncx-drop-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;

  &.active {
    border-color: #40a9ff;
    background-color: rgba(64, 169, 255, 0.1);
  }

  .drop-icon {
    margin-bottom: 12px;
    color: var(--n-text-color-3, rgba(255, 255, 255, 0.45));
  }

  p {
    color: var(--n-text-color-2, inherit);
  }
}

.file-select-label {
  color: #40a9ff;
  cursor: pointer;

  input[type="file"] {
    display: none;
  }
}

.connections-list {
  margin-top: 20px;

  h3 {
    margin-bottom: 16px;
    font-size: 18px;
  }
}

.connection-item {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

.connection-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.connection-name {
  font-weight: 500;
  font-size: 16px;
}

.connection-type {
  padding: 2px 8px;
  border-radius: 4px;
  background-color: rgba(64, 169, 255, 0.2);
  font-size: 12px;
}

.connection-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-item {
  display: flex;

  .detail-label {
    font-weight: 500;
    width: 80px;
    flex-shrink: 0;
  }

  .detail-value {
    word-break: break-all;
  }
}

.error-message {
  color: #ff4d4f;
  margin-top: 8px;
  font-size: 14px;
}

.notes {
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 20px;

  p {
    font-weight: 500;
    margin-bottom: 8px;
  }

  ul {
    padding-left: 20px;

    li {
      margin-bottom: 5px;
      color: var(--n-text-color-2, inherit);
    }
  }
}

// 响应式样式
@media (max-width: 768px) {
  .navicat-password-container {
    padding: 15px;
  }
}

// 添加导出按钮样式
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(64, 169, 255, 0.2);
  color: #40a9ff;
  border: 1px solid rgba(64, 169, 255, 0.3);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(64, 169, 255, 0.3);
  }

  svg {
    display: inline-block;
    vertical-align: middle;
  }
}

.connections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
  }
}
</style>
