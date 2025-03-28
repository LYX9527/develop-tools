<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue'
import {NColorPicker, NSlider, NSpace, NButton, NTabs, NTabPane, useMessage} from 'naive-ui'
import GlassMorphismInput from "@/components/GlassMorphismInput.vue";

const message = useMessage()
const activeTab = ref('color')

interface ShadowConfig {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
  direction: string
  shape: string
}

const selectedColor = ref('#e0e0e0')
const shadowConfig = reactive<ShadowConfig>({
  x: -20,
  y: 20,
  blur: 60,
  spread: 0,
  color: '#000000',
  opacity: 0.2,
  inset: false,
  direction: 'bottom-right',
  shape: 'straight'
})

const previewStyle = ref({
  width: '100px',
  height: '100px',
  borderRadius: 50,
  backgroundColor: '#E0E0E0',
  margin: '100px auto',
  boxShadow: ''
})

// 阴影方向预设
const directions = [
  {key: 'top-left', icon: '↖'},
  {key: 'top', icon: '↑'},
  {key: 'top-right', icon: '↗'},
  {key: 'left', icon: '←'},
  {key: 'center', icon: '•'},
  {key: 'right', icon: '→'},
  {key: 'bottom-left', icon: '↙'},
  {key: 'bottom', icon: '↓'},
  {key: 'bottom-right', icon: '↘'}
]

// 阴影形状预设
const shapes = [
  {key: 'straight', label: '直线'},
  {key: 'convex', label: '凸形'},
  {key: 'concave', label: '凹形'},
  {key: 'fold', label: '折线'}
]

// 阴影类型选项
const shadowTypes = [
  {key: 'outer', label: '外阴影'},
  {key: 'inner', label: '内阴影'}
]

// 计算当前颜色的不同格式
const colorFormats = reactive({
  hex: selectedColor.value,
  rgb: '',
  rgba: ''
})

// 添加 CSS 代码的响应式引用
const cssCode = ref(`
border-radius: 50px;
background: #E0E0E0;
box-shadow: -20px 20px 60px 0px rgba(0, 0, 0, 0.2);
`)

// 更新阴影效果
function updateShadow() {
  const rgba = hexToRgba(shadowConfig.color, shadowConfig.opacity)
  const inset = shadowConfig.inset ? 'inset ' : ''

  // 使用 shadowConfig 的 x 和 y 值
  let shadowStyle = `${inset}${shadowConfig.x}px ${shadowConfig.y}px ${shadowConfig.blur}px ${shadowConfig.spread}px ${rgba}`

  if (shadowConfig.shape !== 'straight') {
    const extraShadows = getShapeShadows(shadowConfig.shape, shadowConfig.x, shadowConfig.y, rgba)
    shadowStyle = extraShadows.map(shadow => `${inset}${shadow}`).join(', ')
  }

  // 更新预览效果
  previewStyle.value.boxShadow = shadowStyle

  // 更新 CSS 代码预览
  cssCode.value = `border-radius: ${previewStyle.value.borderRadius}px;
background: #E0E0E0;
box-shadow: ${shadowStyle};`
}

// 根据方向获取偏移值
function getDirectionOffset(direction: string): { x: number, y: number } {
  const distance = 20 // 基础偏移距离
  const map: Record<string, { x: number, y: number }> = {
    'top-left': {x: -distance, y: -distance},
    'top': {x: 0, y: -distance},
    'top-right': {x: distance, y: -distance},
    'left': {x: -distance, y: 0},
    'center': {x: 0, y: 0},
    'right': {x: distance, y: 0},
    'bottom-left': {x: -distance, y: distance},
    'bottom': {x: 0, y: distance},
    'bottom-right': {x: distance, y: distance}
  }
  return map[direction] || {x: 0, y: 0}
}

// 根据形状生成额外的阴影
function getShapeShadows(shape: string, x: number, y: number, color: string): string[] {
  const blur = shadowConfig.blur
  const spread = shadowConfig.spread

  switch (shape) {
    case 'convex':
      return [
        `${x}px ${y}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 0.7)}px ${Math.round(y * 0.7)}px ${Math.round(blur * 0.7)}px ${spread}px ${color}`,
        `${Math.round(x * 0.4)}px ${Math.round(y * 0.4)}px ${Math.round(blur * 0.4)}px ${spread}px ${color}`
      ]
    case 'concave':
      return [
        `${x}px ${y}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 1.3)}px ${Math.round(y * 1.3)}px ${Math.round(blur * 1.3)}px ${spread}px ${color}`,
        `${Math.round(x * 1.6)}px ${Math.round(y * 1.6)}px ${Math.round(blur * 1.6)}px ${spread}px ${color}`
      ]
    case 'fold':
      return [
        `${x}px ${y}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 0.5)}px ${Math.round(y * 1.5)}px ${blur}px ${spread}px ${color}`,
        `${Math.round(x * 1.5)}px ${Math.round(y * 0.5)}px ${blur}px ${spread}px ${color}`
      ]
    default:
      return [`${x}px ${y}px ${blur}px ${spread}px ${color}`]
  }
}

// 复制颜色
function copyColor(format: string) {
  let colorText = ''
  switch (format) {
    case 'hex':
      colorText = selectedColor.value
      break
    case 'rgb':
      colorText = colorFormats.rgb
      break
    case 'rgba':
      colorText = colorFormats.rgba
      break
  }

  navigator.clipboard.writeText(colorText).then(() => {
    message.success('复制成功')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 复制阴影样式
function copyShadowStyle() {
  navigator.clipboard.writeText(cssCode.value).then(() => {
    message.success('阴影样式已复制')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 辅助函数：HEX转RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {r: 0, g: 0, b: 0}
}

// 辅助函数：HEX转RGBA
function hexToRgba(hex: string, opacity: number) {
  const rgb = hexToRgb(hex)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

// 监听颜色变化
function handleColorChange(value: string | Event) {
  // 如果是事件对象（来自原生input），获取value
  if (value instanceof Event) {
    const input = value.target as HTMLInputElement
    selectedColor.value = input.value
  } else {
    // 直接使用值（来自NColorPicker）
    selectedColor.value = value
  }
  updateColorFormats()
}

// 更新所有颜色格式
function updateColorFormats() {
  const rgb = hexToRgb(selectedColor.value)
  colorFormats.hex = selectedColor.value.toUpperCase() // 转换为大写
  colorFormats.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  colorFormats.rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
}

// 监听阴影配置变化
function handleShadowChange() {
  updateShadow()
}

// 修改方向按钮点击处理
function handleDirectionClick(direction: string) {
  shadowConfig.direction = direction
  const {x, y} = getDirectionOffset(direction)
  shadowConfig.x = x
  shadowConfig.y = y
  handleShadowChange()
}

// 处理阴影类型切换
function handleShadowTypeChange(type: string) {
  shadowConfig.inset = type === 'inner'
  handleShadowChange()
}

// 初始化颜色格式
onMounted(() => {
  updateColorFormats()
})
</script>

<template>
  <div class="color-tool">
    <NTabs v-model:value="activeTab" type="line" animated>
      <NTabPane name="color" tab="颜色选择">
        <div class="color-container">
          <div class="color-section">
            <div class="section-title">选择颜色:</div>
            <div class="color-input">
              <NColorPicker v-model:value="selectedColor" @update:value="handleColorChange" :show-alpha="false"/>
            </div>
            <div class="preview-box">
              <div class="preview-square" :style="{ backgroundColor: selectedColor }"></div>
            </div>
          </div>
          <div class="format-section">
            <div class="format-item">
              <div class="format-label">HEX:</div>
              <div class="format-input-group">
                <glass-morphism-input
                    v-model="colorFormats.hex"
                    placeholder="请输入搜索内容..."
                    :blur="5"
                    :opacity="0.2"
                    suffixButton
                    button-text="复制"
                    @button-click="copyColor('hex')"
                    buttonType="success"
                />
              </div>
            </div>
            <div class="format-item">
              <div class="format-label">RGB:</div>
              <div class="format-input-group">
                <glass-morphism-input
                    v-model="colorFormats.rgb"
                    placeholder="请输入搜索内容..."
                    :blur="5"
                    :opacity="0.2"
                    suffixButton
                    button-text="复制"
                    @button-click="copyColor('rgb')"
                    buttonType="success"
                />
              </div>
            </div>
            <div class="format-item">
              <div class="format-label">RGBA:</div>
              <div class="format-input-group">
                <glass-morphism-input
                    v-model="colorFormats.rgba"
                    placeholder="请输入搜索内容..."
                    :blur="5"
                    :opacity="0.2"
                    suffixButton
                    button-text="复制"
                    @button-click="copyColor('rgba')"
                    buttonType="success"
                />
              </div>
            </div>
          </div>
        </div>
      </NTabPane>
      <NTabPane name="shadow" tab="阴影生成">
        <div class="shadow-container">
          <div class="preview-section">
            <div class="preview-wrapper">
              <div class="shadow-preview" :style="previewStyle"></div>
            </div>
            <div class="css-preview">
              <MacCodeBlock
                  :code="cssCode"
                  language="css"
              />
            </div>
          </div>
          <div class="control-section">
            <NSpace vertical>
              <div class="control-group">
                <div class="group-title">阴影类型：</div>
                <div class="shadow-type-buttons">
                  <n-button
                      v-for="type in shadowTypes"
                      :key="type.key"
                      class="shadow-type-button"
                      :class="{ active: (type.key === 'inner') === shadowConfig.inset }"
                      @click="handleShadowTypeChange(type.key)"
                  >
                    {{ type.label }}
                  </n-button>
                </div>
              </div>

              <div class="control-group">
                <div class="group-title">阴影方向：</div>
                <div class="direction-buttons">
                  <n-button
                      v-for="dir in directions"
                      :key="dir.key"
                      class="direction-button"
                      :class="{ active: shadowConfig.direction === dir.key }"
                      @click="handleDirectionClick(dir.key)"
                  >
                    {{ dir.icon }}
                  </n-button>
                </div>
              </div>

              <div class="control-item">
                <label>大小</label>
                <NSlider v-model:value="shadowConfig.spread" :min="-50" :max="50" @update:value="handleShadowChange"/>
                <span class="value-label">{{ shadowConfig.spread }}px</span>
              </div>

              <div class="control-item">
                <label>圆角</label>
                <NSlider v-model:value="previewStyle.borderRadius" :min="0" :max="50"
                         @update:value="handleShadowChange"/>
                <span class="value-label">{{ previewStyle.borderRadius }}px</span>
              </div>

              <div class="control-item">
                <label>X 偏移</label>
                <NSlider v-model:value="shadowConfig.x" :min="-50" :max="50" @update:value="handleShadowChange"/>
                <span class="value-label">{{ shadowConfig.x }}px</span>
              </div>

              <div class="control-item">
                <label>Y 偏移</label>
                <NSlider v-model:value="shadowConfig.y" :min="-50" :max="50" @update:value="handleShadowChange"/>
                <span class="value-label">{{ shadowConfig.y }}px</span>
              </div>

              <div class="control-item">
                <label>阴影强度</label>
                <NSlider v-model:value="shadowConfig.blur" :min="0" :max="100" @update:value="handleShadowChange"/>
                <span class="value-label">{{ shadowConfig.blur }}px</span>
              </div>

              <div class="control-item">
                <label>模糊度</label>
                <NSlider v-model:value="shadowConfig.opacity" :min="0" :max="1" :step="0.01"
                         @update:value="handleShadowChange"/>
                <span class="value-label">{{ Math.round(shadowConfig.opacity * 100) }}%</span>
              </div>

              <div class="control-group">
                <div class="shape-header">
                  <div class="group-title">阴影形状：</div>
                  <div class="shape-buttons">
                    <n-button
                        v-for="shape in shapes"
                        :key="shape.key"
                        class="shape-button"
                        :class="{ active: shadowConfig.shape === shape.key }"
                        @click="shadowConfig.shape = shape.key; handleShadowChange()"
                    >
                      {{shape.label}}
                    </n-button>
                  </div>
                </div>
              </div>
            </NSpace>
          </div>
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.color-tool {
  padding: 20px;

  :deep(.n-tabs-nav) {
    margin-bottom: 20px;
  }

  .color-container {
    display: flex;
    gap: 40px;
    padding: 20px;

    .color-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .section-title {
        font-size: 14px;
        color: var(--n-text-color-3);
      }

      .color-input {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border: 1px solid var(--n-border-color);
        border-radius: 4px;
        background: var(--n-color);

        .color-preview {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--n-border-color);
        }

        input[type="color"] {
          width: 50px;
          height: 30px;
          padding: 0;
          border: 1px solid var(--n-border-color);
          border-radius: 4px;
        }

        input[type="text"] {
          height: 30px;
          padding: 0 10px;
          border: 1px solid var(--n-border-color);
          border-radius: 4px;
          font-family: monospace;
        }
      }

      .preview-box {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        background: var(--n-color);
        border-radius: 8px;
        border: 1px solid var(--n-border-color);

        .preview-square {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          transition: background-color 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .format-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .format-item {
        .format-label {
          font-size: 14px;
          color: var(--n-text-color-3);
          margin-bottom: 8px;
        }

        .format-input-group {
          display: flex;
          gap: 8px;
          align-items: center;

          .format-input {
            flex: 1;
            height: 34px;
            padding: 0 12px;
            border: 1px solid var(--n-border-color);
            border-radius: 4px;
            background: var(--n-color);
            color: var(--n-text-color);
            font-family: 'Fira Code', monospace;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;

            &:hover {
              border-color: var(--n-border-hover-color);
            }

            &:focus {
              border-color: var(--n-color-active);
              box-shadow: 0 0 0 2px var(--n-color-active-light);
            }
          }

          :deep(.n-button) {
            min-width: 64px;
            height: 34px;
          }
        }
      }
    }
  }

  .shadow-container {
    display: flex;
    gap: 20px;
    align-items: stretch;
  }

  .preview-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .preview-wrapper {
    background-color: var(--n-card-color);
    padding: 20px;
    border-radius: 8px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .shadow-preview {
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .control-section {
    flex: 1;
    background-color: var(--n-card-color);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    label {
      width: 80px;
      flex-shrink: 0;
    }

    .value-label {
      width: 50px;
      text-align: right;
    }

    :deep(.n-slider) {
      flex: 1;
    }
  }

  .control-group {
    margin-bottom: 20px;

    .group-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--n-text-color);
    }
  }

  .shadow-type-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    .shadow-type-button {
      flex: 1;
      padding: 8px 16px;
      border: 1px solid var(--n-border-color);
      background: var(--n-color);
      color: var(--n-text-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--n-color-active);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover::before {
        opacity: 0.1;
      }

      &.active {
        background: var(--n-color-active);
        color: var(--n-text-color-hover);
        border-color: var(--n-color-active);

        &::before {
          opacity: 0;
        }
      }
    }
  }

  .direction-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .direction-button {
      height: 36px;
      border: 1px solid var(--n-border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--n-color-active);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover::before {
        opacity: 0.1;
      }

      &.active {
        color: var(--n-text-color-hover);
        border-color: var(--n-color-active);
        font-weight: 500;

        &::before {
          opacity: 0;
        }
      }

      // 增强浅色模式下的视觉效果
      @media (prefers-color-scheme: light) {
        &:not(.active) {
          &:hover {
            border-color: var(--n-color-active);
            color: var(--n-color-active);
          }
        }
      }
    }
  }

  .shape-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .shape-labels {
      display: flex;
      gap: 24px;

      span {
        font-size: 14px;
        color: var(--n-text-color-3);
        transition: all 0.3s ease;

        &.active {
          color: var(--n-color-active);
          font-weight: 500;
        }
      }
    }
  }

  .shape-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px;
    background: var(--n-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);

    .shape-button {
      aspect-ratio: 1;
      padding: 4px;
      border: 1px solid var(--n-border-color);
      background: var(--n-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 40px;
      width: 120px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--n-color-active);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover::before {
        opacity: 0.1;
      }

      .shape-preview {
        width: 100%;
        height: 100%;
        background-color: #666;
        position: relative;
        z-index: 1;

        &.straight {
          height: 2px;
          margin-top: 50%;
        }

        &.convex {
          border-radius: 50% 50% 0 0;
          height: 50%;
          margin-top: 50%;
        }

        &.concave {
          border-radius: 0 0 50% 50%;
          height: 50%;
        }

        &.fold {
          clip-path: polygon(0 50%, 50% 0, 100% 50%);
        }
      }

      &.active {
        border-color: var(--n-color-active);
        box-shadow: 0 0 0 2px var(--n-color-active-light);

        &::before {
          opacity: 0.15;
        }

        .shape-preview {
          background-color: var(--n-color-active);
        }
      }

      // 增强浅色模式下的视觉效果
      @media (prefers-color-scheme: light) {
        &:not(.active) {
          &:hover {
            border-color: var(--n-color-active);

            .shape-preview {
              background-color: #888;
            }
          }
        }
      }
    }
  }

  .css-preview {
    margin-top: 20px;
    border: 1px solid var(--n-border-color);
    border-radius: 8px;
    overflow: hidden;
    background: var(--n-color);

    :deep(.n-input) {
      background: transparent;

      .n-input__textarea-el {
        padding: 16px;
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        line-height: 1.5;
        resize: none;
      }
    }
  }
}
</style>
