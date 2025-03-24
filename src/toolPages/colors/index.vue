<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const showGeneratorModal = ref(false)
// 预设的色系方案
const colorSchemes = ref([
  {
    name: '海洋系列',
    colors: ['#001F3F', '#003366', '#004A8F', '#005B99', '#0088CC', '#00AAFF', '#33BBFF', '#66CCFF']
  },
  {
    name: '森林系列',
    colors: ['#0B2A1F', '#1B4D3E', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7']
  },
  {
    name: '日落系列',
    colors: ['#FF4D4D', '#FF6B6B', '#FF8787', '#FFA5A5', '#FFC3C3', '#FFE3E3', '#FFF1F1', '#FFF9F9']
  },
  {
    name: '紫罗兰系列',
    colors: ['#2E1052', '#4C1C8C', '#6833B9', '#845EC2', '#A178DF', '#B298DC', '#C5B3E6', '#D8CEF0']
  },
  {
    name: '柑橘系列',
    colors: ['#CC4A1B', '#FF6B35', '#FF8C42', '#FFA62B', '#FFC14D', '#FFD97D', '#FFE7A8', '#FFF3D4']
  },
  {
    name: '薄荷系列',
    colors: ['#004D40', '#00695C', '#00897B', '#009688', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB']
  },
  {
    name: '樱花系列',
    colors: ['#FFB7C5', '#FFC1CF', '#FFCBD9', '#FFD5E3', '#FFDFED', '#FFE9F7', '#FFF3FB', '#FFFBFF']
  },
  {
    name: '咖啡系列',
    colors: ['#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F', '#BCAAA4']
  },
  {
    name: '极光系列',
    colors: ['#00FF87', '#28FFB3', '#50FFDF', '#78FFFB', '#A0F7FF', '#C8EEFF', '#F0E5FF', '#FFE6F7']
  },
  {
    name: '宝石系列',
    colors: ['#880E4F', '#AD1457', '#D81B60', '#E91E63', '#EC407A', '#F06292', '#F48FB1', '#F8BBD0']
  },
  {
    name: '深邃系列',
    colors: ['#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#B3B3B3']
  },
  {
    name: '草原系列',
    colors: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7']
  }
])

// 自定义色系生成
const baseColor = ref('#000000')
const colorCount = ref(8)
const variationType = ref('tint') // tint, shade, tone

// 添加一个函数来处理钉住/取消钉住
function togglePin(index: number) {
  const scheme = colorSchemes.value[index]
  if (scheme.name.startsWith('自定义色系 ')) {
    // 已经是钉住状态，取消钉住
    scheme.name = '自定义色系'
  } else if (scheme.name === '自定义色系') {
    // 钉住该色系
    scheme.name = `自定义色系 ${new Date().toLocaleTimeString()}`
  }
}

// 修改生成色系的函数
function generateColorScheme() {
  const hex = baseColor.value.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  const colors = []
  for (let i = 0; i < colorCount.value; i++) {
    let factor = i / (colorCount.value - 1)
    let newR, newG, newB

    switch (variationType.value) {
      case 'tint': // 添加白色
        newR = Math.round(r + (255 - r) * factor)
        newG = Math.round(g + (255 - g) * factor)
        newB = Math.round(b + (255 - b) * factor)
        break
      case 'shade': // 添加黑色
        newR = Math.round(r * (1 - factor))
        newG = Math.round(g * (1 - factor))
        newB = Math.round(b * (1 - factor))
        break
      case 'tone': // 添加灰色
        newR = Math.round(r + (128 - r) * factor)
        newG = Math.round(g + (128 - g) * factor)
        newB = Math.round(b + (128 - b) * factor)
        break
    }

    colors.push(`#${newR?.toString(16).padStart(2, '0')}${newG?.toString(16).padStart(2, '0')}${newB?.toString(16).padStart(2, '0')}`)
  }

  // 查找并替换未钉住的自定义色系
  const customIndex = colorSchemes.value.findIndex(scheme => scheme.name === '自定义色系')
  if (customIndex !== -1) {
    colorSchemes.value[customIndex] = {
      name: '自定义色系',
      colors: colors
    }
  } else {
    // 如果没有找到未钉住的自定义色系，则添加新的
    colorSchemes.value.unshift({
      name: '自定义色系',
      colors: colors
    })
  }

  showGeneratorModal.value = false
  message.success('色系生成成功')
}

// 复制颜色值
function copyColor(color: string) {
  navigator.clipboard.writeText(color)
    .then(() => message.success('颜色代码已复制'))
    .catch(() => message.error('复制失败'))
}

// 复制整个色系
function copyColorScheme(colors: string[]) {
  const colorString = colors.join(', ')
  navigator.clipboard.writeText(colorString)
    .then(() => message.success('色系代码已复制'))
    .catch(() => message.error('复制失败'))
}
</script>

<template>
  <div class="colors-tool">
    <!-- 预设色系展示 -->
    <div class="schemes-section">
      <div class="section-header">
        <h3>预设色系</h3>
        <n-button @click="showGeneratorModal = true">
          自定义色系
        </n-button>
      </div>
      <div class="scheme-list">
        <div v-for="(scheme, index) in colorSchemes"
             :key="scheme.name"
             class="scheme-item">
          <div class="scheme-header">
            <span class="scheme-name">{{ scheme.name }}</span>
            <div class="scheme-actions">
              <!-- 只对自定义色系显示钉住按钮 -->
              <n-button v-if="scheme.name.startsWith('自定义色系')"
                       size="tiny"
                       quaternary
                       @click="togglePin(index)">
                <template #icon>
                  <n-icon>
                    <svg v-if="scheme.name === '自定义色系'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" />
                    </svg>
                  </n-icon>
                </template>
                {{ scheme.name === '自定义色系' ? '钉住' : '取消钉住' }}
              </n-button>
              <n-button size="small" @click="copyColorScheme(scheme.colors)">
                复制色系
              </n-button>
            </div>
          </div>
          <div class="color-list">
            <div v-for="color in scheme.colors"
                 :key="color"
                 class="color-block"
                 :style="{ backgroundColor: color }"
                 @click="copyColor(color)">
              <div class="color-info">
                <span class="color-code">{{ color }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义色系生成器模态框 -->
    <n-modal v-model:show="showGeneratorModal"
             preset="card"
             title="自定义色系生成器"
             :style="{ width: '480px' }">
      <div class="generator-content">
        <div class="controls">
          <div class="control-item">
            <span class="label">基础颜色</span>
            <n-color-picker v-model:value="baseColor" />
          </div>
          <div class="control-item">
            <span class="label">颜色数量</span>
            <n-input-number v-model:value="colorCount" :min="3" :max="10" />
          </div>
          <div class="control-item">
            <span class="label">变化类型</span>
            <n-select v-model:value="variationType"
                      :options="[
                        { label: '变浅', value: 'tint' },
                        { label: '变深', value: 'shade' },
                        { label: '变灰', value: 'tone' }
                      ]" />
          </div>
        </div>

        <n-button style="margin-top: 20px" type="primary" block @click="generateColorScheme">
          生成色系
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<style scoped lang="scss">
.colors-tool {
  padding: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: var(--n-text-color);
      font-size: 16px;
    }
  }

  .schemes-section {
    background: var(--n-card-color);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid var(--n-border-color);
  }

  .scheme-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .scheme-item {
    background: var(--n-color);
    border-radius: 6px;
    padding: 16px;
    border: 1px solid var(--n-border-color);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .scheme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .scheme-name {
      font-size: 14px;
      color: var(--n-text-color);
      font-weight: 500;
    }

    .scheme-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .color-list {
    display: flex;
    gap: 8px;
    height: 60px;

    .color-block {
      flex: 1;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      .color-info {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--n-color);
          opacity: 0.8;
          backdrop-filter: blur(8px);
        }

        .color-code {
          position: relative;
          z-index: 1;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 3px;
          transform: translateY(10px);
          transition: transform 0.3s ease;
          background: var(--n-card-color);
          color: var(--n-text-color);
          border: 1px solid var(--n-border-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }
      }

      &:hover .color-info {
        opacity: 1;

        .color-code {
          transform: translateY(0);
        }
      }
    }
  }

  .generator-content {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 10px;

      .control-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .label {
          font-size: 14px;
          color: var(--n-text-color-3);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .colors-tool {
    .color-list {
      height: 50px;

      .color-block {
        .color-info {
          opacity: 1;

          &::before {
            opacity: 0.5;
          }

          .color-code {
            transform: translateY(0);
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
