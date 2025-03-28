<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'
import {NInput, NButton, NSpace, NTabs, NTabPane, useMessage} from 'naive-ui'
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

const message = useMessage()
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
      .then(() => message.success('复制成功'))
      .catch(() => message.error('复制失败'))
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
    message.error('请输入有效的时间戳')
  }
}

// 日期时间转时间戳
function datetimeToTimestamp() {
  try {
    const date = new Date(datetimeInput.value)
    timestampInput.value = Math.floor(date.getTime() / 1000).toString()
  } catch (error) {
    message.error('请输入有效的日期时间')
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
onMounted(() => {
  updateCurrentTime()
  timer = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="time-tool">
    <NTabs v-model:value="activeTab" type="line" animated>
      <NTabPane name="now" tab="当前时间">
        <div class="time-formats">
          <div class="format-item">
            <span class="format-label">标准时间</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.standard"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('standard')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">本地时间</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.local"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('local')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">UTC时间</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.utc"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('utc')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">秒级时间戳</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.timestamp"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('timestamp')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">毫秒级时间戳</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.milliseconds"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('milliseconds')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">日期格式</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.date"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('date')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">时间格式</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.time"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('time')"
              />
            </div>
          </div>

          <div class="format-item">
            <span class="format-label">自定义格式</span>
            <div class="format-content">
              <glass-morphism-input
                  v-model:modelValue="currentTime.custom"
                  readonly
                  style="width: 100%"
                  button-text="复制"
                  button-type="primary"
                  suffix-button
                  @button-click="copyTime('custom')"
              />
            </div>
          </div>
        </div>
      </NTabPane>

      <NTabPane name="convert" tab="时间转换">
        <div class="convert-section">
          <div class="input-group">
            <div class="input-header">
              <div class="section-title">时间戳:</div>
              <NButton size="small" @click="copyTime('timestamp')">复制</NButton>
            </div>
            <div class="input-with-button">
              <glass-morphism-input
                  v-model:modelValue="timestampInput"
                  placeholder="请输入时间戳..."
                  style="width: 100%"
                  button-text="转换为日期时间"
                  button-type="primary"
                  suffix-button
                  @button-click="timestampToDatetime"
              />
            </div>
          </div>

          <div class="input-group">
            <div class="input-header">
              <div class="section-title">日期时间:</div>
              <NButton size="small" @click="copyTime('custom')">复制</NButton>
            </div>
            <div class="input-with-button">
              <glass-morphism-input
                  v-model:modelValue="datetimeInput"
                  placeholder="请输入日期时间..."
                  style="width: 100%"
                  button-text="转换为时间戳"
                  button-type="primary"
                  suffix-button
                  @button-click="datetimeToTimestamp"
              />
            </div>
          </div>

          <div class="action-buttons">
            <NSpace>
              <NButton type="primary" @click="getNowTime">获取当前时间</NButton>
              <NButton type="error" @click="clearInput">清空</NButton>
            </NSpace>
          </div>
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.time-tool {
  padding: 20px;

  .time-formats {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .format-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background-color: var(--n-color);
      border-radius: 4px;
      border: 1px solid var(--n-border-color);
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--n-color-hover);
      }

      .format-label {
        width: 100px;
        font-size: 14px;
        color: var(--n-text-color-3);
        flex-shrink: 0;
      }

      .format-content {
        flex: 1;
        display: flex;
        gap: 8px;
        align-items: center;

        :deep(.n-input) {
          flex: 1;

          .n-input__input-el {
            font-family: 'Fira Code', monospace;
          }
        }
      }
    }
  }

  .convert-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .input-group {
      .input-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .section-title {
          font-size: 14px;
          color: var(--n-text-color-3);
        }
      }

      .input-with-button {
        display: flex;
        gap: 8px;

        :deep(.n-input) {
          flex: 1;
        }
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}
</style>
