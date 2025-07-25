<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {gsap} from 'gsap'
import CryptoJS from 'crypto-js'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import Upload from '@/components/ui/Upload.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

// 状态定义
const encryptedPassword = ref('')
const decryptedPassword = ref('')
const version = ref(12)
const connections = ref<any[]>([])
const dragActive = ref(false)
const activeTab = ref('password-decrypt')
const uploadedFiles = ref<File[]>([])
const currentFile = ref<File | null>(null)

const versionOptions = [
  { label: 'Navicat 11', value: 11 },
  { label: 'Navicat 12/15+', value: 12 }
]

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  )
})

// 清理资源
onUnmounted(() => {
  currentFile.value = null;
  connections.value = [];
  uploadedFiles.value = [];
})

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

// 解密Navicat 11版本的密码
function decryptEleven(encryptedHex: string): string {
  // 注：Blowfish算法在前端实现有限制，这里仅作为示例
  toast.warning("Navicat 11版本解密需要完整的Blowfish-ECB支持，当前版本仅支持Navicat 12/15+");
  return "暂不支持Navicat 11解密";
}

// 解密密码
function decrypt() {
  if (!encryptedPassword.value.trim()) {
    decryptedPassword.value = '';
    return;
  }

  try {
    if (version.value === 12) {
      decryptedPassword.value = decryptTwelve(encryptedPassword.value);
      toast.success('解密成功');
    } else if (version.value === 11) {
      decryptedPassword.value = decryptEleven(encryptedPassword.value);
    } else {
      throw new Error('不支持的Navicat版本');
    }
  } catch (error) {
    console.error('解密失败:', error);
    decryptedPassword.value = '';
    toast.error(error instanceof Error ? error.message : '解密失败，请检查输入和版本');
  }
}

// 处理输入变化
function handleInputChange() {
  if (encryptedPassword.value.trim()) {
    decrypt();
  } else {
    decryptedPassword.value = '';
  }
}

// 解析NCX文件
function parseNcxFile(content: string) {
  // 清空之前的连接信息，防止重复添加
  connections.value = [];

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

      // 检查是否有密码属性
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
      toast.warning("在NCX文件中未找到连接信息");
    } else if (!parsedConnections.some(conn => conn.encryptedPassword && conn.encryptedPassword !== "未找到")) {
      toast.warning("在NCX文件中未找到加密密码。注意：标准NCX文件通常不直接存储密码信息，密码可能存储在其他位置。");
    } else {
      toast.success(`成功解析${parsedConnections.length}个连接`);
    }
  } catch (e) {
    console.error("解析NCX文件失败:", e);
    toast.error("解析NCX文件失败，请确保文件格式正确");
    connections.value = [];
  }
}

// 处理文件上传
function handleFileUpload(files: File[]) {
  const file = files[0];
  if (!file) return;

  // 防止重复处理同一个文件
  if (currentFile.value === file) return;
  currentFile.value = file;

  if (!file.name.endsWith('.ncx')) {
    toast.error('请选择Navicat连接文件(.ncx)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target?.result) {
      parseNcxFile(event.target.result as string);
    }
  };
  reader.readAsText(file);
}

// 处理上传错误
function handleUploadError(message: string) {
  toast.error(message);
}

// 导出JSON功能
function exportJson() {
  try {
    let jsonData;
    let filename;

    if (activeTab.value === 'password-decrypt' && decryptedPassword.value) {
      // 导出单个密码解密结果
      jsonData = {
        encryptedPassword: encryptedPassword.value,
        decryptedPassword: decryptedPassword.value,
        version: version.value
      };
      filename = 'navicat-password.json';
    } else if (activeTab.value === 'ncx-parser' && connections.value.length > 0) {
      // 导出连接信息
      jsonData = connections.value;
      filename = 'navicat-connections.json';
    } else {
      toast.warning("没有可导出的数据");
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

    toast.success('导出成功');
  } catch (error) {
    console.error('导出JSON失败:', error);
    toast.error('导出失败');
  }
}

// 复制结果
function copyResult() {
  const textToCopy = activeTab.value === 'password-decrypt' ? decryptedPassword.value : JSON.stringify(connections.value, null, 2);

  if (!textToCopy) {
    toast.warning('没有可复制的内容');
    return;
  }

  navigator.clipboard.writeText(textToCopy)
    .then(() => toast.success('已复制到剪贴板'))
    .catch(() => toast.error('复制失败'));
}

// 清空数据
function clearAll() {
  encryptedPassword.value = '';
  decryptedPassword.value = '';
  connections.value = [];
  uploadedFiles.value = [];
  currentFile.value = null;
}

// 示例数据
function loadExample() {
  encryptedPassword.value = '15057D7BA390';
  version.value = 12;
  handleInputChange();
}

// 切换标签页
function handleTabChange(value: string | number) {
  activeTab.value = value as string;
}
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Navicat密码解密工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          解密Navicat存储的数据库连接密码，支持密码解密和NCX文件解析
        </p>
      </div>

      <!-- 标签页组件 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <!-- 控制面板 -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap items-center gap-4">
            <Button variant="primary" @click="decrypt">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15V17M18 10V7C18 4.79086 16.2091 3 14 3H10C7.79086 3 6 4.79086 6 7V10M5 10H19C20.1046 10 21 10.8954 21 12V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V12C3 10.8954 3.89543 10 5 10Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              解密
            </Button>

            <Button variant="secondary" @click="copyResult">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              复制结果
            </Button>

            <Button variant="ghost" @click="exportJson">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 10V18M12 18L9 15M12 18L15 15M4 4H20" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              导出JSON
            </Button>

            <Button variant="ghost" @click="loadExample">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              示例
            </Button>

            <Button variant="danger" @click="clearAll">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              清空
            </Button>
          </div>
        </div>

        <Tab
          :animated="true"
          :model-value="activeTab"
          variant="underline"
          @change="handleTabChange"
        >
          <!-- 密码解密 -->
          <TabItem id="password-decrypt" label="密码解密">
            <div class="p-8 space-y-6">
              <div class="grid lg:grid-cols-2 gap-8">
                <!-- 输入区域 -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <svg class="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15V17M18 10V7C18 4.79086 16.2091 3 14 3H10C7.79086 3 6 4.79086 6 7V10M5 10H19C20.1046 10 21 10.8954 21 12V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V12C3 10.8954 3.89543 10 5 10Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      输入设置
                    </h3>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Navicat版本</label>
                    <Select
                      v-model="version"
                      :options="versionOptions"
                      @change="handleInputChange"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">加密密码</label>
                    <Input
                      v-model="encryptedPassword"
                      placeholder="请输入Navicat加密的密码"
                      @input="handleInputChange"
                    />
                  </div>

                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    <p>• 支持Navicat 12和15+版本</p>
                    <p>• 请输入16进制格式的加密密码</p>
                    <p>• 示例：15057D7BA390</p>
                  </div>
                </div>

                <!-- 输出区域 -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      解密结果
                    </h3>
                    <Button v-if="decryptedPassword" size="sm" variant="ghost" @click="copyResult">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      复制
                    </Button>
                  </div>

                  <Input
                    v-model="decryptedPassword"
                    class="font-mono"
                    placeholder="解密后的密码将显示在这里"
                    readonly
                  />
                </div>
              </div>
            </div>
          </TabItem>

          <!-- NCX文件解析 -->
          <TabItem id="ncx-parser" label="NCX文件解析">
            <div class="p-8 space-y-6">
              <!-- 文件上传区域 -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  上传NCX文件
                </h3>
                <Upload
                  accept=".ncx"
                  label="选择或拖放NCX文件"
                  @error="handleUploadError"
                  @update:modelValue="handleFileUpload"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  请选择Navicat连接文件(.ncx格式)
                </p>
              </div>

              <!-- 连接信息列表 -->
              <div v-if="connections.length > 0" class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 7V4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V7M4 7C4 7.55228 4.44772 8 5 8H19C19.5523 8 20 7.55228 20 7M4 7V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V7M8 11H16M8 15H16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    连接信息 ({{ connections.length }}个)
                  </h3>
                  <Button size="sm" variant="ghost" @click="exportJson">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 10V18M12 18L9 15M12 18L15 15M4 4H20" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    导出
                  </Button>
                </div>

                <div class="space-y-4">
                  <div
                    v-for="(conn, index) in connections"
                    :key="index"
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-lg font-medium text-gray-900 dark:text-white">{{ conn.name }}</h4>
                      <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {{ conn.type }}
                      </span>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                      <div class="flex">
                        <span class="w-20 font-medium text-gray-700 dark:text-gray-300">主机:</span>
                        <span class="text-gray-900 dark:text-white">{{ conn.host || '未设置' }}</span>
                      </div>
                      <div class="flex">
                        <span class="w-20 font-medium text-gray-700 dark:text-gray-300">端口:</span>
                        <span class="text-gray-900 dark:text-white">{{ conn.port || '默认' }}</span>
                      </div>
                      <div class="flex">
                        <span class="w-20 font-medium text-gray-700 dark:text-gray-300">用户名:</span>
                        <span class="text-gray-900 dark:text-white">{{ conn.user || '未设置' }}</span>
                      </div>
                      <div class="flex">
                        <span class="w-20 font-medium text-gray-700 dark:text-gray-300">密码:</span>
                        <span class="text-gray-900 dark:text-white font-mono">{{ conn.decryptedPassword || '未找到' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabItem>
        </Tab>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">密码解密：</h4>
            <ul class="space-y-1">
              <li>• 支持Navicat 12和15+版本</li>
              <li>• 输入16进制格式的加密密码</li>
              <li>• 自动AES-128-CBC解密</li>
              <li>• 一键复制解密结果</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">NCX文件解析：</h4>
            <ul class="space-y-1">
              <li>• 上传Navicat连接文件(.ncx)</li>
              <li>• 批量解析连接信息</li>
              <li>• 自动解密密码字段</li>
              <li>• 导出JSON格式数据</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">注意事项：</h4>
            <ul class="space-y-1">
              <li>• 所有解密在浏览器中完成</li>
              <li>• 不会上传任何数据到服务器</li>
              <li>• 仅限合法用途使用</li>
              <li>• NCX文件可能不包含密码信息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
