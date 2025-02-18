<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NInput, NButton, NSelect, NTabs, NTabPane, useMessage } from 'naive-ui'

const message = useMessage()

// 请求相关状态
const method = ref('GET')
const url = ref('')
const activeTab = ref('params')

// 请求参数
const headers = reactive<Array<{ name: string; value: string }>>([{ name: '', value: '' }])
const params = reactive<Array<{ name: string; value: string }>>([{ name: '', value: '' }])
const formData = reactive<Array<{ name: string; value: string }>>([{ name: '', value: '' }])
const urlEncodedData = reactive<Array<{ name: string; value: string }>>([{ name: '', value: '' }])
const rawBody = ref('')
const bodyType = ref('raw')

// 响应相关状态
const responseStatus = ref('')
const responseTime = ref('')
const responseBody = ref('')
const isSuccess = ref(false)

// 添加新的响应状态相关的 ref
const responseStatusCode = ref(0)
const responseStatusType = ref<'success' | 'error' | 'warning' | 'info'>('info')

// HTTP方法选项
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' }
]

// 获取状态码对应的类型
function getStatusType(status: number): 'success' | 'error' | 'warning' | 'info' {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'info'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'error'
  return 'error'
}

// 获取延迟对应的类型
function getLatencyType(duration: number): 'success' | 'warning' | 'error' {
  if (duration < 300) return 'success'
  if (duration < 1000) return 'warning'
  return 'error'
}

// 添加行
function addRow(type: 'headers' | 'params' | 'formData' | 'urlEncoded') {
  const target = {
    headers,
    params,
    formData,
    urlEncoded: urlEncodedData
  }[type]
  target.push({ name: '', value: '' })
}

// 删除行
function removeRow(type: 'headers' | 'params' | 'formData' | 'urlEncoded', index: number) {
  const target = {
    headers,
    params,
    formData,
    urlEncoded: urlEncodedData
  }[type]
  target.splice(index, 1)
}

// 获取表格数据
function getTableData(data: Array<{ name: string; value: string }>) {
  const result: Record<string, string> = {}
  data.forEach(item => {
    if (item.name) {
      result[item.name] = item.value
    }
  })
  return result
}

// 格式化响应
function formatResponse() {
  try {
    const json = JSON.parse(responseBody.value)
    responseBody.value = JSON.stringify(json, null, 2)
  } catch (e) {
    message.warning('响应内容不是有效的JSON格式')
  }
}

// 压缩响应
function compressResponse() {
  try {
    const json = JSON.parse(responseBody.value)
    responseBody.value = JSON.stringify(json)
  } catch (e) {
    message.warning('响应内容不是有效的JSON格式')
  }
}

// 复制响应
function copyResponse() {
  if (!responseBody.value.trim()) {
    message.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(responseBody.value)
    .then(() => message.success('已复制到剪贴板'))
    .catch(() => message.error('复制失败，请手动复制'))
}

// 发送请求
async function sendRequest() {
  if (!url.value) {
    message.warning('请输入请求URL')
    return
  }

  try {
    // 构建请求URL（添加查询参数）
    const urlObj = new URL(url.value)
    const queryParams = getTableData(params)
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value)
    })

    // 构建请求头
    const headerData = getTableData(headers)

    // 构建请求体
    let body: any = null
    if (!['GET', 'HEAD'].includes(method.value)) {
      switch (bodyType.value) {
        case 'form-data': {
          const formDataObj = new FormData()
          formData.forEach(item => {
            if (item.name) {
              formDataObj.append(item.name, item.value)
            }
          })
          body = formDataObj
          break
        }
        case 'x-www-form-urlencoded': {
          const params = new URLSearchParams()
          urlEncodedData.forEach(item => {
            if (item.name) {
              params.append(item.name, item.value)
            }
          })
          body = params
          headerData['Content-Type'] = 'application/x-www-form-urlencoded'
          break
        }
        case 'raw': {
          body = rawBody.value
          headerData['Content-Type'] = 'application/json'
          break
        }
      }
    }

    // 发送请求
    const startTime = performance.now()
    const response = await fetch(urlObj.toString(), {
      method: method.value,
      headers: headerData,
      body: ['GET', 'HEAD'].includes(method.value) ? null : body
    })
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    const latencyType = getLatencyType(duration)

    // 处理响应
    const statusCode = response.status
    const statusText = response.statusText
    const statusType = getStatusType(statusCode)
    responseStatus.value = `${statusCode} ${statusText}`
    responseTime.value = `${duration}`
    responseLatencyType.value = latencyType
    isSuccess.value = statusType === 'success'
    responseStatusCode.value = statusCode
    responseStatusType.value = statusType

    const responseText = await response.text()
    try {
      // 尝试格式化JSON响应
      const jsonResponse = JSON.parse(responseText)
      responseBody.value = JSON.stringify(jsonResponse, null, 2)
    } catch {
      // 如果不是JSON，直接显示原始响应
      responseBody.value = responseText
    }
  } catch (error: any) {
    responseStatus.value = 'Error'
    responseTime.value = '0ms'
    isSuccess.value = false
    responseStatusCode.value = 0
    responseStatusType.value = 'error'
    responseLatencyType.value = 'error'
    responseBody.value = error.message
    message.error('请求失败: ' + error.message)
  }
}

// 快速请求示例
const quickRequests = {
  'get-example': {
    method: 'GET',
    url: 'https://api.example.com/users',
    headers: [
      { name: 'Accept', value: 'application/json' }
    ]
  },
  'post-example': {
    method: 'POST',
    url: 'https://api.example.com/users',
    headers: [
      { name: 'Content-Type', value: 'application/json' }
    ],
    body: JSON.stringify({
      name: "John Doe",
      email: "john@example.com"
    }, null, 2)
  }
}

// 加载快速请求
function loadQuickRequest(requestId: keyof typeof quickRequests) {
  const request = quickRequests[requestId]
  if (!request) return

  method.value = request.method
  url.value = request.url
  rawBody.value = request.body || ''

  // 清空并重新填充headers
  headers.splice(0, headers.length)
  if (request.headers) {
    headers.push(...request.headers)
  }
}

// 添加延迟类型的 ref
const responseLatencyType = ref<'success' | 'warning' | 'error'>('success')
</script>

<template>
  <div class="postman-tool">
    <div class="request-section">
      <!-- URL行 -->
      <div class="url-line">
        <NSelect
            v-model:value="method"
            :options="methodOptions"
            class="method-select"
        />
        <NInput
            v-model:value="url"
            placeholder="请输入请求URL"
            class="url-input"
        />
        <NButton
            type="primary"
            @click="sendRequest"
            class="send-button"
        >
          发送请求
        </NButton>
      </div>

      <!-- 请求配置标签页 -->
      <NTabs v-model:value="activeTab" type="segment">
        <NTabPane name="params" tab="Params">
          <div class="params-table">
            <div v-for="(param, index) in params" :key="index" class="table-row">
              <NInput v-model:value="param.name" placeholder="参数名" />
              <NInput v-model:value="param.value" placeholder="参数值" />
              <NButton circle tertiary type="error" @click="removeRow('params', index)">×</NButton>
            </div>
            <NButton dashed class="add-button" @click="addRow('params')">添加参数</NButton>
          </div>
        </NTabPane>

        <NTabPane name="headers" tab="Headers">
          <div class="headers-table">
            <div v-for="(header, index) in headers" :key="index" class="table-row">
              <NInput v-model:value="header.name" placeholder="Header名" />
              <NInput v-model:value="header.value" placeholder="Header值" />
              <NButton circle tertiary type="error" @click="removeRow('headers', index)">×</NButton>
            </div>
            <NButton dashed class="add-button" @click="addRow('headers')">添加Header</NButton>
          </div>
        </NTabPane>

        <NTabPane name="body" tab="Body">
          <div class="body-section">
            <div class="body-type">
              <NSelect
                  v-model:value="bodyType"
                  :options="[
                    { label: 'raw', value: 'raw' },
                    { label: 'form-data', value: 'form-data' },
                    { label: 'x-www-form-urlencoded', value: 'x-www-form-urlencoded' }
                  ]"
                  class="body-type-select"
              />
            </div>

            <!-- Raw Body -->
            <div v-if="bodyType === 'raw'" class="raw-body">
              <NInput
                  v-model:value="rawBody"
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 15 }"
                  placeholder="请输入请求体"
              />
            </div>

            <!-- Form Data -->
            <div v-if="bodyType === 'form-data'" class="form-data">
              <div v-for="(item, index) in formData" :key="index" class="table-row">
                <NInput v-model:value="item.name" placeholder="Key" />
                <NInput v-model:value="item.value" placeholder="Value" />
                <NButton circle tertiary type="error" @click="removeRow('formData', index)">×</NButton>
              </div>
              <NButton dashed class="add-button" @click="addRow('formData')">添加字段</NButton>
            </div>

            <!-- URL Encoded -->
            <div v-if="bodyType === 'x-www-form-urlencoded'" class="url-encoded">
              <div v-for="(item, index) in urlEncodedData" :key="index" class="table-row">
                <NInput v-model:value="item.name" placeholder="Key" />
                <NInput v-model:value="item.value" placeholder="Value" />
                <NButton circle tertiary type="error" @click="removeRow('urlEncoded', index)">×</NButton>
              </div>
              <NButton dashed class="add-button" @click="addRow('urlEncoded')">添加字段</NButton>
            </div>
          </div>
        </NTabPane>
      </NTabs>
    </div>

    <!-- 响应部分 -->
    <div class="response-section" v-if="responseStatus">
      <div class="response-header">
        <div class="response-info">
          <div class="status-group">
            <span
                class="status-tag"
                :class="responseStatusType"
            >
              {{ responseStatusCode }}
            </span>
          </div>
          <span 
              class="latency-tag"
              :class="responseLatencyType"
          >
            {{ responseTime }}ms
          </span>
        </div>
        <div class="response-actions">
          <NButton size="small" @click="formatResponse">格式化</NButton>
          <NButton size="small" @click="compressResponse">压缩</NButton>
          <NButton size="small" @click="copyResponse">复制</NButton>
        </div>
      </div>
      <NInput
          v-model:value="responseBody"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 15 }"
          readonly
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.postman-tool {
  padding: 20px;

  .request-section {
    background: var(--n-card-color);
    border-radius: 12px;
    border: 1px solid var(--n-border-color);
    padding: 20px;
    margin-bottom: 20px;

    .url-line {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      .method-select {
        width: 120px;
      }

      .url-input {
        flex: 1;
      }
    }

    .table-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;

      :deep(.n-input) {
        flex: 1;
      }
    }

    .add-button {
      width: 100%;
      margin-top: 8px;
    }

    .body-section {
      .body-type {
        margin-bottom: 16px;

        .body-type-select {
          width: 200px;
        }
      }
    }
  }

  .response-section {
    background: var(--n-card-color);
    border-radius: 12px;
    border: 1px solid var(--n-border-color);
    padding: 20px;

    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .response-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .status-group {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-tag {
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            font-family: monospace;

            &.success {
              background: var(--t-success-color);
              color: white;
            }

            &.error {
              background: var(--t-error-color);
              color: white;
            }

            &.warning {
              background: var(--t-warning-color);
              color: white;
            }

            &.info {
              background: var(--t-info-color);
              color: white;
            }
          }

          .status-text {
            color: var(--n-text-color-2);
            font-size: 14px;
          }
        }

        .latency-tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 14px;
          font-family: monospace;
          color: white;

          &.success {
            background: var(--t-success-color);
          }

          &.warning {
            background: var(--t-warning-color);
          }

          &.error {
            background: var(--t-error-color);
          }
        }
      }

      .response-actions {
        display: flex;
        gap: 8px;
      }
    }

    :deep(.n-input) {
      .n-input__textarea-el {
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
        background: var(--n-color);
      }
    }
  }
}
</style>
