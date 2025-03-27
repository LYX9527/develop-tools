<script setup lang="ts">
import {ref} from 'vue'
import {useMessage, NButton, NSwitch, NSlider, NInputNumber, NSpace, NSelect} from 'naive-ui'
import GlassMorphismPanel from "@/components/GlassMorphismPanel.vue"
import GlassMorphismInput from "@/components/GlassMorphismInput.vue"
import GlassMorphismButton from "@/components/GlassMorphismButton.vue"

const message = useMessage()
const showSettings = ref(false)

// 玻璃效果设置
const blurValue = ref(10)
const opacityValue = ref(0.3)
const radiusValue = ref(16)
const showBorder = ref(true)
const showShadow = ref(true)
const paddingValue = ref(20)
const darkMode = ref(false)

// 输入框示例
const inputValue = ref('10')
const errorInputValue = ref('')
const numberInputValue = ref(42)
const disabledInputValue = ref('禁用状态')

// 背景图片设置
const backgroundImage = ref('https://picsum.photos/id/10/1600/900')
const backgroundType = ref('nature')

// 背景选项
const backgroundOptions = [
  {label: '自然风景', value: 'nature'},
  {label: '城市景观', value: 'city'},
  {label: '抽象背景', value: 'abstract'}
]

// 复合输入框示例
const urlValue = ref('')
const domainValue = ref('')
const searchValue = ref('')

// HTTP协议选项改为格式化的对象数组
const httpProtocol = ref('Https://')
const protocolOptions = [
  {label: 'Http://', value: 'Http://'},
  {label: 'Https://', value: 'Https://'},
  {label: 'Ftp://', value: 'Ftp://'}
]

// 域名后缀选项改为格式化的对象数组
const domainSuffix = ref('.com')
const suffixOptions = [
  {label: '.com', value: '.com'},
  {label: '.org', value: '.org'},
  {label: '.net', value: '.net'},
  {label: '.io', value: '.io'},
  {label: '.cn', value: '.cn'}
]

// 切换背景图片
function changeBackground() {
  let randomId = 1

  switch (backgroundType.value) {
    case 'nature':
      randomId = Math.floor(Math.random() * 10) + 10 // 自然类图片ID
      break
    case 'city':
      randomId = Math.floor(Math.random() * 10) + 20 // 城市类图片ID
      break
    case 'abstract':
      randomId = Math.floor(Math.random() * 10) + 30 // 抽象类图片ID
      break
  }

  backgroundImage.value = `https://picsum.photos/id/${randomId}/1600/900`
}

// 切换暗黑模式
function toggleDarkMode() {
  darkMode.value = !darkMode.value
}

// 验证输入
function validateInput() {
  if (!errorInputValue.value) {
    message.error('请输入内容')
  } else {
    message.success('验证通过')
  }
}

// 搜索函数
function handleSearch(value: string) {
  if (value) {
    message.success(`搜索：${value}`)
  } else {
    message.warning('请输入搜索内容')
  }
}

// 登录函数示例
function handleLogin() {
  if (urlValue.value) {
    message.success(`登录成功：${urlValue.value}`)
  } else {
    message.error('请输入用户名')
  }
}
</script>

<template>
  <div class="glass-demo" :class="{ 'dark-mode': darkMode }">
    <div class="controls">
      <n-space>
        <n-select v-model:value="backgroundType" :options="backgroundOptions" style="width: 120px"/>
        <glass-morphism-button @click="changeBackground">随机更换背景</glass-morphism-button>
        <glass-morphism-button @click="showSettings = !showSettings">
          {{ showSettings ? '隐藏设置' : '显示设置' }}
        </glass-morphism-button>
        <glass-morphism-button @click="toggleDarkMode">
          {{ darkMode ? '亮色模式' : '暗色模式' }}
        </glass-morphism-button>
      </n-space>
    </div>

    <glass-morphism-panel
        class="glass-content"
        :blur="`${blurValue}px`"
        :opacity="opacityValue"
        :radius="`${radiusValue}px`"
        :border="showBorder"
        :shadow="showShadow"
        :padding="`${paddingValue}px`"
        :background-color="darkMode ? 'rgba(0, 0, 0, ' : 'rgba(255, 255, 255, '"
    >
      <h2>毛玻璃效果面板</h2>
      <p>这是一个具有毛玻璃效果的面板组件，可以根据需要自定义样式。</p>
      <p>尝试更换背景图片或调整设置来查看效果变化。</p>

      <div class="demo-buttons">
        <glass-morphism-button type="primary">主要按钮</glass-morphism-button>
        <glass-morphism-button type="success">成功按钮</glass-morphism-button>
        <glass-morphism-button type="warning">警告按钮</glass-morphism-button>
        <glass-morphism-button type="danger">危险按钮</glass-morphism-button>
        <glass-morphism-button>默认按钮</glass-morphism-button>
      </div>

      <div class="input-demo">
        <h3>毛玻璃输入框</h3>

        <div class="input-group">
          <label>标准输入框:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="inputValue"
                placeholder="请输入内容..."
                :blur="5"
                :opacity="0.2"
                width="100%"
                border-color="rgba(255, 255, 255, 0.3)"
            />
          </div>
        </div>

        <div class="input-group">
          <label>必填输入框:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="errorInputValue"
                placeholder="请输入必填内容..."
                :error="!errorInputValue"
                error-border-color="rgba(255, 0, 0, 0.6)"
                :blur="5"
                :opacity="0.2"
                width="100%"
            />

          </div>
        </div>

        <div class="input-group">
          <label>数字输入框:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="numberInputValue"
                type="number"
                placeholder="请输入数字..."
                :blur="5"
                :opacity="0.2"
                width="100%"
            />
          </div>
        </div>

        <div class="input-group">
          <label>禁用状态:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="disabledInputValue"
                :disabled="true"
                :blur="5"
                :opacity="0.2"
                width="100%"
            />
          </div>
        </div>
      </div>

      <!-- 更新复合输入框演示部分 -->
      <div class="input-demo composite-demo">
        <h3>复合型输入框</h3>

        <div class="input-group">
          <label>网址输入:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="urlValue"
                v-model:selectValue="httpProtocol"
                :options="protocolOptions"
                useSelectPrefix
                prefixWidth="90px"
                placeholder="请输入网址..."
                :blur="5"
                :opacity="0.2"
            />
          </div>
        </div>

        <div class="input-group">
          <label>域名输入:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="domainValue"
                v-model:selectValue="domainSuffix"
                :options="suffixOptions"
                useSelectSuffix
                suffixWidth="70px"
                placeholder="请输入域名"
                :blur="5"
                :opacity="0.2"
            />
          </div>
        </div>

        <div class="input-group">
          <label>搜索输入:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="searchValue"
                placeholder="请输入内容..."
                :blur="5"
                :opacity="0.2"
                :search="handleSearch"
            />
          </div>
        </div>

        <!-- 新增的按钮后缀示例 -->
        <div class="input-group">
          <label>登录框:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="urlValue"
                placeholder="请输入用户名..."
                :blur="5"
                :opacity="0.2"
                suffixButton
                buttonText="登录"
                buttonType="primary"
                @button-click="handleLogin"
            />
          </div>
        </div>

        <div class="input-group">
          <label>搜索按钮:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="searchValue"
                placeholder="请输入搜索内容..."
                :blur="5"
                :opacity="0.2"
                suffixButton
                search
                buttonType="success"
            />
          </div>
        </div>
        <div class="input-group">
          <label>多行文本:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="searchValue"
                placeholder="请输入搜索内容..."
                :blur="5"
                :opacity="0.2"
                textarea
                showCount
                rows="10"
                maxlength="1000"
            />
          </div>
        </div>
        <div class="input-group">
          <label>搜索结果:</label>
          <div class="input-container">
            <glass-morphism-input
                v-model="searchValue"
                placeholder="请输入搜索内容..."
                :blur="5"
                :opacity="0.2"
                searchable
            />
          </div>
        </div>
      </div>
    </glass-morphism-panel>

    <glass-morphism-panel v-if="showSettings" class="settings-panel">
      <h3>效果设置</h3>

      <div class="setting-item">
        <span>模糊度:</span>
        <n-slider v-model:value="blurValue" :min="0" :max="30" :step="1"/>
        <n-input-number v-model:value="blurValue" :min="0" :max="30" size="small"/>
      </div>

      <div class="setting-item">
        <span>透明度:</span>
        <n-slider v-model:value="opacityValue" :min="0" :max="1" :step="0.05"/>
        <n-input-number v-model:value="opacityValue" :min="0" :max="1" :step="0.05" size="small"/>
      </div>

      <div class="setting-item">
        <span>圆角大小:</span>
        <n-slider v-model:value="radiusValue" :min="0" :max="30" :step="1"/>
        <n-input-number v-model:value="radiusValue" :min="0" :max="30" size="small"/>
      </div>

      <div class="setting-item">
        <span>内边距:</span>
        <n-slider v-model:value="paddingValue" :min="0" :max="40" :step="2"/>
        <n-input-number v-model:value="paddingValue" :min="0" :max="40" :step="2" size="small"/>
      </div>

      <div class="setting-item">
        <span>显示边框:</span>
        <n-switch v-model:value="showBorder"/>
      </div>

      <div class="setting-item">
        <span>显示阴影:</span>
        <n-switch v-model:value="showShadow"/>
      </div>
    </glass-morphism-panel>
  </div>
</template>

<style scoped lang="scss">
.glass-demo {
  min-height: 85vh;
  padding: 20px;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: all 0.3s ease;

  &.dark-mode {
    color-scheme: dark;

    h2, h3, p, label {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .glass-content {
    max-width: 800px;
    margin: 0 auto 20px;

    h2, h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }

    p {
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .demo-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }

    .input-demo {
      margin-top: 25px;

      .input-group {
        display: flex;
        margin-bottom: 15px;

        label {
          min-width: 90px;
          font-size: 14px;
          line-height: 36px;
        }

        .input-container {
          flex: 1;
          display: flex;
          gap: 8px;
          max-width: calc(100% - 100px);
          align-items: center;

          .validate-btn {
            flex-shrink: 0;
          }
        }
      }
    }

    .composite-demo {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  .settings-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }

    .setting-item {
      margin-bottom: 15px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;

      span {
        min-width: 80px;
      }

      :deep(.n-slider) {
        width: 120px;
      }

      :deep(.n-input-number) {
        width: 70px;
      }
    }
  }
}

@media (max-width: 768px) {
  .glass-demo {
    .settings-panel {
      position: static;
      width: auto;
      max-width: 800px;
      margin: 0 auto;
    }

    .glass-content {
      .input-demo {
        .input-group {
          flex-direction: column;
          align-items: flex-start;

          label {
            margin-bottom: 5px;
            line-height: normal;
          }

          .input-container {
            width: 100%;
            max-width: 100%;
          }
        }
      }
    }
  }
}
</style>
