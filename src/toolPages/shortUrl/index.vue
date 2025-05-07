<template>
  <div class="short-url-container">
    <div class="tabs">
      <div class="tab-header">
        <div
            class="tab-item"
            :class="{ 'active': activeTab === 'create' }"
            @click="activeTab = 'create'"
        >生成短链接</div>
        <div class="tab-divider"></div>
        <div
            class="tab-item"
            :class="{ 'active': activeTab === 'list' }"
            @click="activeTab = 'list'"
        >短链接管理</div>
      </div>

      <div class="tab-content">
        <!-- 生成短链接面板 -->
        <div v-show="activeTab === 'create'" class="form-container">
          <div class="form-item">
            <div class="label">请输入需缩短的网址:</div>
            <GlassMorphismInput
                v-model:modelValue="formState.originalUrl"
                placeholder="https://example.com"
            />
          </div>

          <div class="form-item">
            <div class="label">短网址有效期:</div>
            <GlassMorphismSelect
                v-model:modelValue="formState.expiryType"
                :options="expiryOptions"
                width="100%"
            />
          </div>

          <div class="form-item">
            <div class="label">访问密码:</div>
            <GlassMorphismInput
                v-model:modelValue="formState.accessCode"
                type="password"
                placeholder="可选，4-16位字母或数字"
                :disabled="!usePassword"
            />
            <n-checkbox v-model:checked="usePassword" class="mt-2">设置访问密码</n-checkbox>
          </div>

          <div class="form-item">
            <div class="label">自定义后缀:</div>
            <GlassMorphismInput
                v-model:modelValue="formState.customSuffix"
                placeholder="可选，字母数字组合"
                :disabled="!useCustomSuffix"
            />
            <n-checkbox v-model:checked="useCustomSuffix" class="mt-2">使用自定义后缀</n-checkbox>
          </div>

          <div class="form-action">
            <n-button type="primary" :loading="loading" @click="generateShortUrl" class="action-button">
              生成短网址
            </n-button>
          </div>

          <div v-if="generatedUrl" class="result-container">
            <div class="result-header">
              <n-icon size="24" color="#18a058">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"/>
                </svg>
              </n-icon>
              <span>生成成功!</span>
            </div>

            <div class="url-result">
              <span class="label">原始网址:</span>
              <div class="url-box">
                <span class="url">{{ formState.originalUrl }}</span>
              </div>
            </div>

            <div class="url-result">
              <span class="label">短网址:</span>
              <div class="url-box">
                <span class="url">{{ generatedUrl }}</span>
                <n-button text type="primary" @click="copyUrl" class="copy-button">
                  <template #icon>
                    <n-icon>
                      <CopyOutline/>
                    </n-icon>
                  </template>
                  复制
                </n-button>
              </div>
            </div>

            <div v-if="usePassword" class="url-result">
              <span class="label">访问密码:</span>
              <div class="url-box password-box">
                <span class="password">{{ formState.accessCode }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 短链接管理面板 -->
        <div v-show="activeTab === 'list'" class="management-container">
          <GlassMorphismTable
            :columns="columns"
            :data="shortUrls"
            :loading="tableLoading"
            :pagination="{ pageSize: 10 }"
            @cell-copy="handleCellCopy"
          />
        </div>
      </div>
    </div>

    <div class="notes">
      <p>注意:</p>
      <ul>
        <li>自定义后缀具有更好的可读性，但可能已被占用</li>
        <li>添加密码保护可以增加链接的安全性</li>
        <li>过期的链接将无法继续访问</li>
        <li>请勿使用短链接传播违规内容</li>
      </ul>
    </div>

    <!-- 添加删除确认对话框 -->
    <GlassMorphismDialog
      v-model:show="showDeleteDialog"
      title="确认删除"
      width="400"
    >
      <div class="delete-confirm-content">
        <p>删除后此短链接将无法访问，是否确认删除？</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button class="glass-btn cancel-btn" @click="showDeleteDialog = false">取消</button>
          <button class="glass-btn confirm-btn" @click="confirmDelete">确认删除</button>
        </div>
      </template>
    </GlassMorphismDialog>
  </div>
</template>

<script setup lang="ts">
import {computed, h, onMounted, reactive, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useMessage} from 'naive-ui';
import dayjs from 'dayjs';
import {CopyOutline} from '@vicons/ionicons5';
import GlassMorphismInput from '@/components/GlassMorphismInput.vue';
import GlassMorphismSelect from '@/components/GlassMorphismSelect.vue';
import GlassMorphismTable from '@/components/GlassMorphismTable.vue';
import GlassMorphismDialog from '@/components/GlassMorphismDialog.vue';

// 获取API基础URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') === '' ? '' :
    (import.meta.env.VITE_API_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_API_BASE_URL.slice(0, -1)
        : import.meta.env.VITE_API_BASE_URL);

// 获取或创建客户端ID
const getClientId = () => {
  let clientId = localStorage.getItem('shortUrlClientId');
  if (!clientId) {
    clientId = generateClientId();
    localStorage.setItem('shortUrlClientId', clientId);
  }
  return clientId;
};

// 生成客户端唯一标识
const generateClientId = () => {
  const timestamp = new Date().getTime().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

const route = useRoute();
const message = useMessage();

const activeTab = ref('create');
const usePassword = ref(false);
const useCustomSuffix = ref(false);
const loading = ref(false);
const accessLoading = ref(false);
const tableLoading = ref(false);
const generatedUrl = ref('');
const shortUrls = ref<any[]>([]);

// 有效期选项
const expiryOptions = [
  {label: '永久有效', value: 'forever'},
  {label: '一天', value: 'day'},
  {label: '一周', value: 'week'},
  {label: '一个月', value: 'month'}
];


// 获取短链接ID
const shortId = computed(() => {
  if (route.path.includes('/shortUrl/access/')) {
    const parts = route.path.split('/access/');
    return parts[parts.length - 1];
  } else if (route.path.includes('/tool/shortUrl/access/')) {
    const parts = route.path.split('/access/');
    return parts[parts.length - 1];
  }
  return '';
});

const formState = reactive({
  originalUrl: '',
  expiryType: 'forever',
  accessCode: '',
  customSuffix: ''
});

const accessForm = reactive({
  accessCode: '',
  shortId: ''
});

// 表格列定义
const columns = [
  {
    title: '短链接',
    key: 'shortUrl',
    ellipsis: true,
    width: '25%',
    copyable: true,
    render: (row) => {
      return h('div', { class: 'url-cell' }, [
        h('span', { class: 'url-text', title: row.shortUrl }, row.shortUrl)
      ]);
    }
  },
  {
    title: '原始链接',
    key: 'originalUrl',
    ellipsis: true,
    width: '25%',
    copyable: true
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: '15%'
  },
  {
    title: '过期时间',
    key: 'expiryDate',
    width: '10%',
    render: (row) => {
      return h('span', {}, row.expiryDate ? formatDate(row.expiryDate) : '永久有效');
    }
  },
  {
    title: '密码保护',
    key: 'hasPassword',
    width: '15%',
    align: 'center',
    render: (row) => {
      if (!row.hasPassword) {
        return h('span', { class: 'status-tag tag-success' }, '无密码');
      }

      return h('div', { class: 'inline-flex-center' }, [
        row.showPassword
          ? h('span', { class: 'password-text-inline' }, row.accessCode)
          : h('span', { class: 'status-tag tag-info' }, '需要密码'),
        h('span', {
          class: 'eye-button-inline',
          onClick: (e) => {
            e.stopPropagation();
            togglePasswordVisibility(row);
          }
        }, [
          h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            width: '16',
            height: '16',
            fill: '#2080f0'
          }, [
            h('path', {
              d: row.showPassword
                ? 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
                : 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z'
            })
          ])
        ]),
        row.hasPassword && h('span', {
          class: 'copy-button-inline',
          onClick: (e) => {
            e.stopPropagation();
            copyAccessCode(row.accessCode);
          }
        }, [
          h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            width: '16',
            height: '16',
            fill: '#2080f0'
          }, [
            h('path', { d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' })
          ])
        ])
      ]);
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: '10%',
    align: 'center',
    render: (row) => {
      return h('div', { class: 'action-buttons' }, [
        h('span', {
          class: 'delete-btn',
          onClick: (e) => {
            e.stopPropagation();
            handleDelete(row);
          }
        }, [
          h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            width: '16',
            height: '16',
            fill: '#ff4d4f'
          }, [
            h('path', { d: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' })
          ]),
          '删除'
        ])
      ]);
    }
  }
];

// 格式化日期
const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
};

// 加载短链接列表
const loadShortUrls = async () => {
  tableLoading.value = true;

  try {
    const clientId = getClientId();
    const response = await fetch(`${API_BASE_URL}/short-url/list?clientId=${encodeURIComponent(clientId)}`, {
      method: 'GET'
    });
    const data = await response.json();

    if (data.success) {
      // 添加完整的短链接URL和格式化日期
      shortUrls.value = data.urls.map((url: any) => ({
        ...url,
        shortUrl: url.shortUrl || `${window.location.origin}/s/${url.shortId}`,
        createdAt: formatDate(url.createdAt),
        showPassword: false // 添加密码显示控制属性
      }));
    } else {
      message.error(data.message || '获取短链接列表失败');
    }
  } catch (error) {
    console.error('加载短链接列表失败:', error);
    message.error('获取短链接列表失败，请确认服务器是否运行');
  } finally {
    tableLoading.value = false;
  }
};

// 生成短链接
const generateShortUrl = async () => {
  if (!formState.originalUrl) {
    message.error('请输入原始URL');
    return;
  }

  // 添加协议前缀（如果未提供）
  if (!formState.originalUrl.startsWith('http')) {
    formState.originalUrl = 'https://' + formState.originalUrl;
  }

  loading.value = true;

  try {
    const clientId = getClientId();

    const response = await fetch(`${API_BASE_URL}/short-url/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalUrl: formState.originalUrl,
        expiryType: formState.expiryType === 'forever' ? null : formState.expiryType,
        accessCode: usePassword.value ? formState.accessCode : null,
        customSuffix: useCustomSuffix.value ? formState.customSuffix : null,
        clientId: clientId
      })
    });

    const data = await response.json();

    if (data.success) {
      generatedUrl.value = data.shortUrl;
      message.success('短链接创建成功');
      loadShortUrls(); // 刷新列表
    } else {
      message.error(data.message || '创建失败');
    }
  } catch (error: any) {
    console.error('创建短链接失败:', error);
    message.error('创建失败，请确认服务器是否正常运行');
  } finally {
    loading.value = false;
  }
};

// 复制URL到剪贴板
const copyUrl = () => {
  navigator.clipboard.writeText(generatedUrl.value)
      .then(() => {
        message.success('已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 处理单元格复制
const handleCellCopy = (text: string, row: any) => {
  message.success('已复制到剪贴板');
};

// 切换密码可见性
const togglePasswordVisibility = (row) => {
  row.showPassword = !row.showPassword;
  // 关闭其他打开的密码弹窗
  shortUrls.value.forEach(item => {
    if (item !== row) {
      item.showPassword = false;
    }
  });
};

// 复制访问密码
const copyAccessCode = (accessCode) => {
  if (!accessCode) return;

  navigator.clipboard.writeText(accessCode)
    .then(() => {
      message.success('密码已复制到剪贴板');
    })
    .catch(() => {
      message.error('复制失败');
    });
};

// 添加确认对话框相关状态
const showDeleteDialog = ref(false);
const currentDeleteRow = ref(null);

// 修改处理删除短链接的函数
const handleDelete = (row) => {
  currentDeleteRow.value = row;
  showDeleteDialog.value = true;
};

// 添加确认删除的函数
const confirmDelete = async () => {
  if (!currentDeleteRow.value) return;

  try {
    const clientId = getClientId();
    const row = currentDeleteRow.value;

    const response = await fetch(`${API_BASE_URL}/short-url/delete/${row.shortId}?clientId=${encodeURIComponent(clientId)}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      message.success('短链接删除成功');
      loadShortUrls(); // 重新加载列表
    } else {
      message.error(data.message || '删除失败');
    }
  } catch (error) {
    console.error('删除短链接失败:', error);
    message.error('删除失败，请确认服务器是否正常运行');
  } finally {
    showDeleteDialog.value = false;
  }
};

onMounted(() => {
  // 确保有客户端ID
  getClientId();
  // 加载短链接列表
  loadShortUrls();
});
</script>

<style scoped lang="scss">
.short-url-container {
  max-width: 1200px;
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
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}

.tab-header {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &.active {
    color: #2080f0;
    border-bottom: 2px solid #2080f0;
  }

  &:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.05);
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

.form-action {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.action-button {
  padding: 0 32px;
  height: 40px;
  font-size: 16px;
}

.result-container {
  margin-top: 30px;
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #18a058;
  font-size: 18px;
  font-weight: 500;
}

.url-result {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
}

.url-box {
  display: flex;
  align-items: center;
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-top: 6px;
  color: var(--n-text-color, inherit);

  @media (min-width: 640px) {
    margin-left: 10px;
    margin-top: 0;
  }
}

.password-box {
  background-color: rgba(32, 128, 240, 0.05);
  border: 1px solid rgba(32, 128, 240, 0.2);
}

.url {
  flex: 1;
  word-break: break-all;
}

.label {
  width: 150px;
  font-weight: 500;

  @media (min-width: 640px) {
    text-align: left;
  }
}

.password {
  padding: 4px 8px;
  background-color: rgba(32, 128, 240, 0.1);
  border-radius: 4px;
}

.copy-button {
  margin-left: 10px;
}

.management-container {
  overflow: hidden;
}

.access-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.access-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.access-icon {
  margin-bottom: 20px;
}

.access-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--n-text-color, inherit);
}

.notes {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 30px;
  backdrop-filter: blur(8px);

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

.mt-2 {
  margin-top: 8px;
}

/* 表格相关样式 */


.password-field {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 6px;
  border-radius: 50%;
  background-color: rgba(32, 128, 240, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(32, 128, 240, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(32, 128, 240, 0.1);
}

.eye-button:hover {
  background-color: rgba(32, 128, 240, 0.3);
  transform: scale(1.05);
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: rgba(32, 128, 240, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(32, 128, 240, 0.3);
  border-radius: 6px;
  color: #2080f0;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.password-popup {
  position: absolute;
  right: -20px;
  top: 110%;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 10;
  min-width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.popup-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-text {
  font-family: monospace;
  font-size: 14px;
  color: #333;
  padding: 2px 4px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  flex: 1;
  margin-right: 10px;
}


.password-field-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: nowrap;
  width: 100%;
  line-height: 1;
}


// 添加确认对话框的样式
.delete-confirm-content {
  padding: 10px 0;
  font-size: 14px;
  color: var(--n-text-color, inherit);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.glass-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--n-text-color, inherit);

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
}

.cancel-btn {
  background-color: rgba(255, 255, 255, 0.05);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.confirm-btn {
  background-color: rgba(255, 77, 79, 0.2);
  border: 1px solid rgba(255, 77, 79, 0.3);
  color: #ff4d4f;

  &:hover {
    background-color: rgba(255, 77, 79, 0.3);
  }
}
</style>
<style lang="scss">
.short-url-container {
  .url-cell {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .url-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    border-radius: 12px;
    font-size: 12px;
    text-align: center;
    height: 22px;
    line-height: 1;
  }

  .tag-info {
    background-color: rgba(32, 128, 240, 0.1);
    color: #2080f0;
    border: 1px solid rgba(32, 128, 240, 0.2);
  }

  .tag-success {
    background-color: rgba(24, 160, 88, 0.1);
    color: #18a058;
    border: 1px solid rgba(24, 160, 88, 0.2);
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 8px;
    background-color: rgba(255, 77, 79, 0.2);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 77, 79, 0.3);
    color: #ff4d4f;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(255, 77, 79, 0.3);
      transform: translateY(-2px);
    }
  }

  .password-text-inline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    font-size: 13px;
    color: #2080f0;
    background-color: rgba(32, 128, 240, 0.1);
    border: 1px solid rgba(32, 128, 240, 0.2);
    border-radius: 12px;
    padding: 0 8px;
    height: 22px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 32px);
  }

  .inline-flex-center {
    display: inline-flex !important;
    align-items: center;
    width: 100%;
    gap: 4px;
    white-space: nowrap;
  }

  .eye-button-inline {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
    border-radius: 50%;
    background-color: rgba(32, 128, 240, 0.15);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(32, 128, 240, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    line-height: 1;
  }

  .eye-button-inline:hover {
    background-color: rgba(32, 128, 240, 0.2);
    transform: scale(1.05);
  }
  .copy-button-inline {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
    border-radius: 50%;
    background-color: rgba(32, 128, 240, 0.15);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(32, 128, 240, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    line-height: 1;
    margin-left: 4px;

    &:hover {
      background-color: rgba(32, 128, 240, 0.2);
      transform: scale(1.05);
    }
  }
}
</style>
