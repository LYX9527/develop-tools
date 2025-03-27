<script setup lang="ts">
import {computed, ref, onMounted, onUnmounted, nextTick} from 'vue'

// 定义组件属性
const props = defineProps({
  // 模型值（用于v-model）
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 占位符文本
  placeholder: {
    type: String,
    default: '请输入...'
  },
  // 模糊程度
  blur: {
    type: [String, Number],
    default: '5px'
  },
  // 背景透明度
  opacity: {
    type: [String, Number],
    default: 0.2
  },
  // 圆角大小
  radius: {
    type: [String, Number],
    default: '8px'
  },
  // 边框样式
  border: {
    type: Boolean,
    default: true
  },
  // 边框颜色
  borderColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.2)'
  },
  // 聚焦时边框颜色
  focusBorderColor: {
    type: String,
    default: 'rgba(24, 144, 255, 0.6)'
  },
  // 内边距
  padding: {
    type: [String, Number],
    default: '10px 16px'
  },
  // 背景色（会与透明度结合）
  backgroundColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.1)'
  },
  // 禁用状态
  disabled: {
    type: Boolean,
    default: false
  },
  // 类型（文本、数字等）
  type: {
    type: String,
    default: 'text'
  },
  // 是否为错误状态
  error: {
    type: Boolean,
    default: false
  },
  // 错误状态边框颜色
  errorBorderColor: {
    type: String,
    default: 'rgba(245, 34, 45, 0.6)'
  },
  // 宽度
  width: {
    type: [String, Number],
    default: '100%'
  },
  // 前缀内容
  prefix: {
    type: String,
    default: ''
  },
  // 后缀内容
  suffix: {
    type: String,
    default: ''
  },
  // 是否使用下拉选择作为前缀
  useSelectPrefix: {
    type: Boolean,
    default: false
  },
  // 是否使用下拉选择作为后缀
  useSelectSuffix: {
    type: Boolean,
    default: false
  },
  // 下拉选项
  options: {
    type: Array<Option>,
    default: () => []
  },
  // 选择的值
  selectValue: {
    type: [String, Number],
    default: ''
  },
  // 前缀宽度
  prefixWidth: {
    type: [String, Number],
    default: '100px'
  },
  // 后缀宽度
  suffixWidth: {
    type: [String, Number],
    default: '100px'
  },
  // 后缀按钮
  suffixButton: {
    type: Boolean,
    default: false
  },
  // 搜索模式
  search: {
    type: [Boolean, Function],
    default: false
  },
  // 按钮文本
  buttonText: {
    type: String,
    default: ''
  },
  // 按钮类型
  buttonType: {
    type: String,
    default: 'default',
    validator: (val: string) => ['default', 'primary', 'success', 'warning', 'danger'].includes(val)
  },
  // 添加textarea相关属性
  textarea: {
    type: Boolean,
    default: false
  },
  // textarea行数
  rows: {
    type: [String, Number],
    default: 4
  },
  // textarea列数
  cols: {
    type: [String, Number],
    default: 50
  },
  // 是否自动调整高度
  autosize: {
    type: Boolean,
    default: false
  },
  // 最大输入长度
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  // 是否显示字数统计
  showCount: {
    type: Boolean,
    default: false
  },
  // 文本输入区域的最小高度
  minHeight: {
    type: [String, Number],
    default: '80px'
  },
  // 文本输入区域的最大高度
  maxHeight: {
    type: [String, Number],
    default: '200px'
  },
  // 调整大小方向
  resize: {
    type: String,
    default: 'none',
    validator: (val: string) => ['none', 'both', 'horizontal', 'vertical'].includes(val)
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'input',
  'change',
  'update:selectValue',
  'click:suffix',
  'button-click',
  'search',
  'enter',
  'click',
  'suffix-click'
])

// 控制聚焦状态
const isFocused = ref(false)

// 使用计算属性来处理双向绑定
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('input', value)
  }
})

// 下拉选择的值
const selectVal = computed({
  get: () => props.selectValue,
  set: (value) => {
    emit('update:selectValue', value)
  }
})

// 计算容器样式
const wrapperStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  }
})

// 计算输入框样式
const inputStyle = computed(() => {
  let borderColorValue = props.borderColor

  if (props.error) {
    borderColorValue = props.errorBorderColor
  } else if (isFocused.value) {
    borderColorValue = props.focusBorderColor
  }

  // 如果是复合输入框，使用不同的样式
  if (props.prefix || props.suffix || props.useSelectPrefix || props.useSelectSuffix || props.suffixButton || (props.search && !props.suffixButton)) {
    return {
      borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
      border: props.border ? `1px solid ${borderColorValue}` : 'none',
      backdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
      WebkitBackdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
      backgroundColor: props.backgroundColor.includes('rgba')
          ? props.backgroundColor
          : `${props.backgroundColor}${typeof props.opacity === 'number' ? props.opacity : parseFloat(props.opacity as string)}`,
      opacity: props.disabled ? 0.6 : 1,
      display: 'flex',
      boxShadow: isFocused.value && !props.error
          ? `0 0 0 2px rgba(24, 144, 255, 0.2)`
          : props.error
              ? `0 0 0 2px rgba(245, 34, 45, 0.2)`
              : 'none',
      backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05))'
    }
  } else {
    // 标准输入框样式
    return {
      backdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
      WebkitBackdropFilter: `blur(${typeof props.blur === 'number' ? `${props.blur}px` : props.blur})`,
      backgroundColor: props.backgroundColor.includes('rgba')
          ? props.backgroundColor
          : `${props.backgroundColor}${typeof props.opacity === 'number' ? props.opacity : parseFloat(props.opacity as string)}`,
      borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
      boxShadow: isFocused.value && !props.error
          ? `0 0 0 2px rgba(24, 144, 255, 0.2)`
          : props.error
              ? `0 0 0 2px rgba(245, 34, 45, 0.2)`
              : 'none',
      border: props.border ? `1px solid ${borderColorValue}` : 'none',
      padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
      opacity: props.disabled ? 0.6 : 1
    }
  }
})

// 计算前缀样式
const prefixStyle = computed(() => {
  return {
    minWidth: typeof props.prefixWidth === 'number' ? `${props.prefixWidth}px` : props.prefixWidth,
  }
})

// 计算后缀样式
const suffixStyle = computed(() => {
  return {
    minWidth: typeof props.suffixWidth === 'number' ? `${props.suffixWidth}px` : props.suffixWidth,
  }
})

// 处理聚焦事件
const handleFocus = (e: FocusEvent) => {
  isFocused.value = true
  emit('focus', e)
}

// 处理失焦事件
const handleBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
  emit('change', props.modelValue)
}

// 处理后缀点击
const handleSuffixClick = (e: Event) => {
  emit('click:suffix', e)
}

// 处理回车键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (typeof props.search === 'function') {
      props.search(inputValue.value)
      emit('search', inputValue.value)
    } else if (props.search) {
      emit('search', inputValue.value)
    }
  }
}

// 处理按钮点击
const handleButtonClick = (e: Event) => {
  e.preventDefault()

  if (typeof props.search === 'function') {
    props.search(inputValue.value)
    emit('search', inputValue.value)
  } else {
    emit('button-click', inputValue.value)
  }
}

// 更新搜索图标SVG
const searchIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>`

// 是否显示搜索图标
const showSearchIcon = computed(() => props.search && !props.suffixButton)

// 计算按钮样式
const buttonStyle = computed(() => {
  return {
    backgroundColor: getButtonColor(),
    borderTopRightRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
    borderBottomRightRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
  }
})

// 获取按钮背景色
function getButtonColor() {
  switch (props.buttonType) {
    case 'primary':
      return 'rgba(24, 144, 255, 0.35)';
    case 'success':
      return 'rgba(82, 196, 26, 0.35)';
    case 'warning':
      return 'rgba(250, 173, 20, 0.35)';
    case 'danger':
      return 'rgba(245, 34, 45, 0.35)';
    default:
      return 'rgba(255, 255, 255, 0.15)';
  }
}

// 为选项定义接口
interface OptionItem {
  label?: string;
  value: string | number;

  [key: string]: any; // 允许其他额外属性
}

// 联合类型表示选项可能是对象或原始值
type Option = OptionItem | string | number;

// 创建自定义事件的类型定义
interface DropdownEventDetail {
  id: string;
  type: 'prefix' | 'suffix';
}

interface DropdownCustomEvent extends CustomEvent {
  detail: DropdownEventDetail;
}

// 创建事件类型声明，修复 addEventListener 的类型兼容性
declare global {
  interface WindowEventMap {
    'glass-morphism-dropdown-open': DropdownCustomEvent;
  }
}

// 创建一个全局事件通知机制
const DROPDOWN_OPEN_EVENT = 'glass-morphism-dropdown-open' as const;
const DROPDOWN_ID = Symbol('dropdown-id').toString(); // 生成唯一ID

// 下拉菜单状态 - 添加明确的类型声明
const prefixDropdownVisible = ref(false);
const suffixDropdownVisible = ref(false);
const prefixTriggerRef = ref<HTMLElement | null>(null);
const suffixTriggerRef = ref<HTMLElement | null>(null);

// 下拉菜单位置计算
const prefixDropdownPos = ref({top: 0, left: 0, width: 0});
const suffixDropdownPos = ref({top: 0, left: 0, width: 0});

// 更新前缀下拉菜单位置
const updatePrefixDropdownPosition = () => {
  if (prefixTriggerRef.value) {
    const rect = prefixTriggerRef.value.getBoundingClientRect()
    prefixDropdownPos.value = {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    }
  }
}

// 更新后缀下拉菜单位置
const updateSuffixDropdownPosition = () => {
  if (suffixTriggerRef.value) {
    const rect = suffixTriggerRef.value.getBoundingClientRect()
    suffixDropdownPos.value = {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    }
  }
}

// 设置前缀下拉菜单状态
const setPrefixDropdownVisible = (value: boolean) => {
  if (value === prefixDropdownVisible.value) return;

  prefixDropdownVisible.value = value;
  if (value) {
    // 发布全局事件通知其他下拉菜单关闭
    window.dispatchEvent(new CustomEvent<DropdownEventDetail>(DROPDOWN_OPEN_EVENT, {
      detail: {id: DROPDOWN_ID, type: 'prefix'}
    }));
  }
};

// 设置后缀下拉菜单状态
const setSuffixDropdownVisible = (value: boolean) => {
  if (value === suffixDropdownVisible.value) return;

  suffixDropdownVisible.value = value;
  if (value) {
    // 发布全局事件通知其他下拉菜单关闭
    window.dispatchEvent(new CustomEvent<DropdownEventDetail>(DROPDOWN_OPEN_EVENT, {
      detail: {id: DROPDOWN_ID, type: 'suffix'}
    }));
  }
};

// 全局下拉菜单打开事件处理
const handleGlobalDropdownOpen = (event: DropdownCustomEvent) => {
  // 类型检查已经通过 WindowEventMap 扩展得到保证
  if (event.detail.id !== DROPDOWN_ID) {
    prefixDropdownVisible.value = false;
    suffixDropdownVisible.value = false;
  } else if (event.detail.type === 'prefix') {
    suffixDropdownVisible.value = false;
  } else if (event.detail.type === 'suffix') {
    prefixDropdownVisible.value = false;
  }
};

// 切换前缀下拉菜单
const togglePrefixDropdown = (event: Event) => {
  if (props.disabled) return

  if (!prefixDropdownVisible.value) {
    updatePrefixDropdownPosition()
    setPrefixDropdownVisible(true)
  } else {
    setPrefixDropdownVisible(false)
  }

  event.stopPropagation()
}

// 切换后缀下拉菜单
const toggleSuffixDropdown = (event: Event) => {
  if (props.disabled) return

  if (!suffixDropdownVisible.value) {
    updateSuffixDropdownPosition()
    setSuffixDropdownVisible(true)
  } else {
    setSuffixDropdownVisible(false)
  }

  event.stopPropagation()
}

// 选择项点击处理
const handleOptionSelect = (option: Option) => {
  const value = typeof option === 'object' && option !== null && 'value' in option
      ? option.value
      : option;

  selectVal.value = value;

  // 关闭所有下拉菜单
  setPrefixDropdownVisible(false);
  setSuffixDropdownVisible(false);
};

// 点击外部关闭下拉菜单 - 完善类型定义
const handleClickOutside = (event: MouseEvent) => {
  // 确保 event.target 是 HTMLElement 类型
  const target = event.target as HTMLElement;

  // 检查是否点击在前缀触发器上
  const clickedOnPrefixTrigger = prefixTriggerRef.value && prefixTriggerRef.value.contains(target);

  // 检查是否点击在后缀触发器上
  const clickedOnSuffixTrigger = suffixTriggerRef.value && suffixTriggerRef.value.contains(target);

  // 检查是否点击在下拉菜单中
  const clickedOnPrefixDropdown = target.closest('.gl-dropdown-prefix');
  const clickedOnSuffixDropdown = target.closest('.gl-dropdown-suffix');

  // 如果点击的既不是前缀触发器也不是前缀下拉菜单，关闭前缀下拉菜单
  if (prefixDropdownVisible.value && !clickedOnPrefixTrigger && !clickedOnPrefixDropdown) {
    setPrefixDropdownVisible(false);
  }

  // 如果点击的既不是后缀触发器也不是后缀下拉菜单，关闭后缀下拉菜单
  if (suffixDropdownVisible.value && !clickedOnSuffixTrigger && !clickedOnSuffixDropdown) {
    setSuffixDropdownVisible(false);
  }
}

// 窗口大小变化时更新下拉菜单位置
const handleResize = () => {
  if (prefixDropdownVisible.value) {
    updatePrefixDropdownPosition()
  }
  if (suffixDropdownVisible.value) {
    updateSuffixDropdownPosition()
  }
}

// 格式化选项标签
const getOptionLabel = (option: Option): string => {
  if (typeof option === 'object' && option !== null) {
    return option.label !== undefined ? option.label : String(option.value);
  }
  return String(option);
};

// 获取当前选中项的标签
const selectedLabel = computed(() => {
  const selectedOption = props.options.find((option: Option) => {
    if (typeof option === 'object' && option !== null && 'value' in option) {
      return option.value === selectVal.value;
    }
    return option === selectVal.value;
  });

  return getOptionLabel(selectedOption || selectVal.value);
});

// 挂载和卸载事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside as EventListener);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize, true);

  // 添加全局下拉菜单事件监听，现在类型安全
  window.addEventListener(DROPDOWN_OPEN_EVENT, handleGlobalDropdownOpen);

  // 如果是textarea模式，初始化高度
  nextTick(() => {
    if (props.textarea && props.autosize && textareaRef.value) {
      adjustHeight()
    }
  })
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside as EventListener);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);

  window.removeEventListener(DROPDOWN_OPEN_EVENT, handleGlobalDropdownOpen);
});

// 处理textarea自动调整高度
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 自动调整高度函数
const adjustHeight = () => {
  if (!props.autosize || !textareaRef.value) return

  const textarea = textareaRef.value
  // 先重置高度，以便重新计算
  textarea.style.height = 'auto'

  // 根据内容高度设置
  const newHeight = Math.max(
      parseInt(typeof props.minHeight === 'string' ? props.minHeight : String(props.minHeight)),
      Math.min(textarea.scrollHeight, parseInt(typeof props.maxHeight === 'string' ? props.maxHeight : String(props.maxHeight)))
  )
  textarea.style.height = `${newHeight}px`
}

// 处理 rows 和 cols 的类型转换 - 确保输出字符串类型
const textareaRows = computed<string>(() => String(props.rows))
const textareaCols = computed<string>(() => String(props.cols))
const textareaMaxLength = computed<string | undefined>(() =>
    props.maxlength !== undefined ? String(props.maxlength) : undefined
)

// 创建单独的 textarea 样式对象，避免传递非标准属性
const textareaStyle = computed(() => {
  const minH = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight;
  const maxH = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;

  return {
    resize: props.resize,
    overflowY: 'auto',
    minHeight: minH,
    maxHeight: maxH
  } as {
    resize: string;
    overflowY: string;
    minHeight: string;
    maxHeight: string;
  }
})

// 添加气泡相关状态
const showBubble = ref(false)
const bubbleMessage = ref('已超出字符限制！')
const bubblePosition = ref({left: '50%', top: '30%'})
const cooldown = ref(false)

// 简化后的处理超出字符气泡显示函数
const showExceededBubble = () => {
  if (cooldown.value) return

  // 设置冷却时间
  cooldown.value = true
  setTimeout(() => {
    cooldown.value = false
  }, 2000)

  // 随机位置 (简化版)
  const randomTop = Math.floor(Math.random() * 60) + 10 // 10%-70%的范围
  const randomLeft = Math.floor(Math.random() * 60) + 20 // 20%-80%的范围
  bubblePosition.value = {
    top: `${randomTop}%`,
    left: `${randomLeft}%`
  }

  // 随机消息
  const messages = [
    '已超出字符限制！',
    '字数超了哦~',
    '太长了，精简一下？',
    '已超出最大长度！',
    '字数超限，请删减'
  ]
  bubbleMessage.value = messages[Math.floor(Math.random() * messages.length)]

  // 显示和隐藏气泡
  showBubble.value = true
  setTimeout(() => {
    showBubble.value = false
  }, 1500)
}

// 修改处理输入的函数
const handleTextareaInput = (event: Event) => {
  if (!event.target) return

  const target = event.target as HTMLTextAreaElement
  inputValue.value = target.value

  // 字数超出检查
  if (props.maxlength && target.value.length > Number(props.maxlength)) {
    showExceededBubble()
  }

  // 自动调整高度
  if (props.autosize) {
    nextTick(adjustHeight)
  }
}

// 检测是否超出字符限制
const isExceeded = computed(() => {
  if (!props.maxlength) return false
  return currentLength.value > Number(props.maxlength)
})

// 计算当前输入长度
const currentLength = computed(() => {
  return String(props.modelValue || '').length
})
</script>

<template>
  <div class="glass-input-wrapper"
       :class="{ 'is-focused': isFocused, 'is-error': error, 'is-disabled': disabled, 'is-textarea': textarea }"
       :style="wrapperStyle">
    <!-- 复合输入框 -->
    <div v-if="prefix || suffix || useSelectPrefix || useSelectSuffix || suffixButton || showSearchIcon"
         class="glass-input"
         :class="{'has-suffix-button': suffixButton, 'is-textarea': textarea}"
         :style="inputStyle">

      <!-- 前缀下拉选择 -->
      <div v-if="useSelectPrefix"
           class="input-addon prefix select-addon custom-select"
           :class="{'dropdown-open': prefixDropdownVisible}"
           :style="prefixStyle"
           ref="prefixTriggerRef"
           @click="togglePrefixDropdown">
        <div class="selected-value">{{ selectedLabel }}</div>
        <span class="select-arrow" :class="{'rotated': prefixDropdownVisible}">▼</span>
      </div>

      <!-- 前缀文本 -->
      <div v-else-if="prefix" class="input-addon prefix" :style="prefixStyle">
        {{ prefix }}
      </div>

      <!-- 输入内容区域 -->
      <div class="input-content" ref="textareaContentRef">
        <slot>
          <!-- 根据textarea属性选择渲染input或textarea -->
          <input
              class="glass-input-field"
              :value="inputValue"
              :placeholder="placeholder"
              :disabled="disabled"
              :type="type"
              @input="e => inputValue = (e.target as HTMLInputElement).value"
              @focus="handleFocus"
              @blur="handleBlur"
              @keydown="handleKeydown"
          />

          <!-- 字数统计 -->
          <div v-if="textarea && showCount && maxlength"
               class="textarea-character-count"
               :class="{ 'exceeded': isExceeded }">
            {{ currentLength }}/{{ maxlength }}
          </div>
        </slot>
      </div>

      <!-- 后缀下拉选择 -->
      <div v-if="useSelectSuffix"
           class="input-addon suffix select-addon custom-select"
           :class="{'dropdown-open': suffixDropdownVisible}"
           :style="suffixStyle"
           ref="suffixTriggerRef"
           @click="toggleSuffixDropdown">
        <div class="selected-value">{{ selectedLabel }}</div>
        <span class="select-arrow" :class="{'rotated': suffixDropdownVisible}">▼</span>
      </div>

      <!-- 其他后缀类型 -->
      <div v-else-if="showSearchIcon"
           class="input-addon suffix search-icon"
           @click="handleSuffixClick">
        <div class="icon-wrapper" v-html="searchIconSvg"></div>
      </div>

      <div v-else-if="suffix && !suffixButton"
           class="input-addon suffix"
           :style="suffixStyle"
           @click="handleSuffixClick">
        <span class="suffix-content">{{ suffix }}</span>
      </div>

      <!-- 后缀按钮 -->
      <div v-if="suffixButton" class="suffix-button-container">
        <button
            class="suffix-button"
            :class="`button-${buttonType}`"
            :style="buttonStyle"
            @click="handleButtonClick"
        >
          <div class="button-content">
            <span v-if="buttonText">{{ buttonText }}</span>
            <div v-else-if="search" class="icon-wrapper" v-html="searchIconSvg"></div>
            <span v-else>{{ suffix || '确认' }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 标准输入框（非复合情况） -->
    <template v-else>
      <input
          v-if="!textarea"
          class="glass-input"
          :style="inputStyle"
          :value="inputValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :type="type"
          @input="e => inputValue = (e.target as HTMLInputElement).value"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
      />

      <!-- 非复合情况下的带气泡提醒的textarea -->
      <div v-else class="textarea-container" ref="textareaContentRef">
        <textarea
            ref="textareaRef"
            class="glass-input glass-textarea"
            :style="{...inputStyle, ...textareaStyle} as any"
            :value="inputValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :rows="textareaRows"
            :cols="textareaCols"
            :maxlength="textareaMaxLength"
            @input="handleTextareaInput"
            @focus="handleFocus"
            @blur="handleBlur"
        ></textarea>

        <!-- 超出字符提醒气泡 -->
        <transition name="bubble-fade">
          <div v-show="showBubble" class="exceeded-bubble" :style="bubblePosition">
            {{ bubbleMessage }}
          </div>
        </transition>

        <!-- 字数统计 -->
        <div v-if="textarea && showCount && maxlength"
             class="textarea-character-count"
             :class="{ 'exceeded': isExceeded }">
          {{ currentLength }}/{{ maxlength }}
        </div>
      </div>
    </template>
  </div>

  <!-- 使用 Teleport 将下拉菜单传送到 body 末尾 -->
  <teleport to="body">
    <!-- 前缀下拉菜单 -->
    <div v-if="useSelectPrefix && prefixDropdownVisible"
         class="gl-dropdown gl-dropdown-prefix"
         :style="{
           position: 'absolute',
           top: `${prefixDropdownPos.top}px`,
           left: `${prefixDropdownPos.left}px`,
           width: `${prefixDropdownPos.width}px`,
           zIndex: 10000
         }">
      <div class="gl-dropdown-menu">
        <div v-for="(option, index) in options"
             :key="index"
             class="gl-dropdown-item"
             :class="{'is-selected': (getOptionLabel(option) || option) === selectVal}"
             @click="handleOptionSelect(option)">
          {{ getOptionLabel(option) }}
        </div>
      </div>
    </div>

    <!-- 后缀下拉菜单 -->
    <div v-if="useSelectSuffix && suffixDropdownVisible"
         class="gl-dropdown gl-dropdown-suffix"
         :style="{
           position: 'absolute',
           top: `${suffixDropdownPos.top}px`,
           left: `${suffixDropdownPos.left}px`,
           width: `${suffixDropdownPos.width}px`,
           zIndex: 10000
         }">
      <div class="gl-dropdown-menu">
        <div v-for="(option, index) in options"
             :key="index"
             class="gl-dropdown-item"
             :class="{'is-selected': (getOptionLabel(option) || option) === selectVal}"
             @click="handleOptionSelect(option)">
          {{ getOptionLabel(option) }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.glass-input-wrapper {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
}

/* 标准输入框 */
.glass-input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  color: inherit;
  background: transparent;
  font-size: 16px;
  line-height: 1.5;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  position: relative;
  overflow: hidden;
}

/* 复合输入框内的输入字段 */
.glass-input-field {
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 16px;
  line-height: 1.5;
  padding: 8px 12px;
}

.glass-input::placeholder,
.glass-input-field::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .glass-input::placeholder,
  .glass-input-field::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}

/* 高亮效果 */
.glass-input::before,
.glass-input-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
  rgba(255, 255, 255, 0) 0%,
  rgba(255, 255, 255, 0.5) 50%,
  rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
  opacity: 0.5;
}

/* 复合输入框样式 */
.input-content {
  flex: 1;
  min-width: 0;
}

.input-addon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: inherit;
  white-space: nowrap;
  font-size: 14px;
  position: relative;
  background: transparent;
}

.prefix {
  position: relative;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
}

.suffix {
  position: relative;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
  cursor: pointer;
}

.suffix-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 下拉选择器样式 */
.select-addon {
  position: relative;
  padding: 0;
}


.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 10px;
  opacity: 0.7;
}

/* 特殊状态样式 */
.is-disabled .glass-input,
.is-disabled .glass-input-field,
.is-disabled {
  cursor: not-allowed;
}

.is-focused .glass-input {
  background-color: rgba(255, 255, 255, 0.15);
}

.is-error .glass-input {
  background-color: rgba(245, 34, 45, 0.05);
}

/* 搜索图标样式 */
.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.icon-wrapper :deep(svg) {
  vertical-align: middle;
}

/* 添加后缀按钮容器样式 */
.suffix-button-container {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  display: flex;
  align-items: stretch;
}

/* 修改后缀按钮样式 */
.suffix-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 100%;
  padding: 0 15px;
  border: none;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
  margin: 0;
}

/* 设置输入框相对定位，让按钮可以绝对定位 */
.glass-input {
  position: relative;
}

/* 当有后缀按钮时，为输入内容区域添加右边距 */
.glass-input.has-suffix-button .input-content .glass-input-field {
  padding-right: 70px;
}

/* 暗模式适配 */
@media (prefers-color-scheme: dark) {
  .suffix-button {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .search-icon :deep(svg),
  .suffix-button :deep(svg) {
    color: rgba(255, 255, 255, 0.85);
  }
}

/* 新增自定义下拉选择器样式 */
.custom-select {
  position: relative;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: rgba(255, 255, 255, 0.05);
}

.selected-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  padding-right: 20px;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  opacity: 0.7;
  transition: transform 0.2s;
}

.select-arrow.rotated {
  transform: translateY(-50%) rotate(180deg);
}


@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 新增下拉菜单传送门样式 */
.gl-dropdown-menu {
  background-color: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 8px;
  overflow-y: auto;
  max-height: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: gl-dropdown-fade-in 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* 自定义滚动条样式 */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent; /* Firefox */
}

/* 自定义滚动条样式 (Chrome, Safari, Edge) */
.gl-dropdown-menu::-webkit-scrollbar {
  width: 5px;
}

.gl-dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.gl-dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
}

.gl-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.gl-dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.gl-dropdown-item:last-child {
  border-bottom: none;
}

.gl-dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.gl-dropdown-item.is-selected {
  background-color: rgba(24, 144, 255, 0.3);
  font-weight: 500;
}

/* 优化下拉菜单动画 */
@keyframes gl-dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 调整箭头样式 */
.select-arrow {
  font-size: 8px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.8);
}

.dropdown-open .select-arrow {
  opacity: 1;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

/* 确保按钮在不同类型下保持垂直居中 */
.button-primary .button-content,
.button-success .button-content,
.button-warning .button-content,
.button-danger .button-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 添加textarea特有样式 */
.glass-input-wrapper.is-textarea {
  height: auto;
}

.glass-input.is-textarea {
  height: auto;
  min-height: 40px;
}

.glass-textarea {
  height: auto;
  min-height: 80px;
  border: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  width: 100%;
  outline: none;
  padding: 10px 0;
  overflow-y: auto; /* 添加垂直滚动支持 */
  overflow-x: hidden; /* 防止水平滚动 */
  box-sizing: border-box; /* 确保内边距不会增加总宽度 */
}

.textarea-character-count {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  pointer-events: none;
  z-index: 2; /* 确保总是显示在上层 */
}

.textarea-character-count {
  bottom: 15px;
  right: 8px;
}

.input-content {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 保持与现有禁用、错误、焦点状态样式的一致性 */
.is-disabled .glass-textarea,
.is-disabled  {
  opacity: 0.6;
  cursor: not-allowed;
}

.is-error .glass-textarea,
.is-error {
  border-color: v-bind('errorBorderColor');
}

.is-focused .glass-textarea,
.is-focused  {
  border-color: v-bind('focusBorderColor');
}

/* 添加样式确保 resize 功能工作正常 */
.glass-textarea[style*="resize:"] {
  overflow: auto; /* 确保调整大小时可以滚动 */
}

/* 添加textarea容器相对定位，用于气泡定位 */
.textarea-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 超出字符气泡样式 - 毛玻璃效果 */
.exceeded-bubble {
  position: absolute;
  z-index: 100;
  background: rgba(255, 75, 75, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  transform: translate(-50%, -50%);
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  animation: bubble-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
  bubble-float 3s ease-in-out infinite alternate;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 更灵动的文本计数器效果 */
.textarea-character-count.exceeded {
  color: #ff4b4b;
  background: rgba(255, 75, 75, 0.2);
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 75, 75, 0.3);
  box-shadow: 0 2px 8px rgba(255, 75, 75, 0.2);
  transition: all 0.3s ease;
}

/* 气泡弹出动画 */
@keyframes bubble-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.5);
  }
  70% {
    transform: translate(-50%, -48%) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 气泡浮动动画 */
@keyframes bubble-float {
  0% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, -58%);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}


</style>
