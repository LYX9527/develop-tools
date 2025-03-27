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
  },
  // 搜索结果下拉框相关属性
  searchable: {
    type: Boolean,
    default: false
  },
  searchOptions: {
    type: Array<Option>,
    default: () => []
  },
  // 搜索结果最大显示数量
  maxSearchResults: {
    type: Number,
    default: 8
  },
  // 搜索结果高亮关键词
  highlightMatches: {
    type: Boolean,
    default: true
  },
  // 自定义搜索过滤函数
  filterFunction: {
    type: Function,
    default: null
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
  'suffix-click',
  'select-option'
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

  // 如果有搜索选项且输入框有值，则显示下拉框
  if (props.searchable && inputValue.value && props.searchOptions.length > 0) {
    filterSearchOptions()
    showSearchDropdown.value = filteredOptions.value.length > 0
  }
}

// 处理失焦事件
const handleBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
  closeSearchDropdown()
  emit('change', props.modelValue)
}

// 处理后缀点击
const handleSuffixClick = (e: Event) => {
  emit('click:suffix', e)
}

// 修改键盘导航处理逻辑，确保回车键可以触发搜索
const handleKeydown = (event: KeyboardEvent) => {
  // 如果没有显示搜索下拉框且是enter键，直接触发搜索
  if (!showSearchDropdown.value && event.key === 'Enter' && props.searchable) {
    event.preventDefault()
    filterSearchOptions()
    showDropdown()
    return
  }

  // 下拉框显示时的键盘导航
  if (showSearchDropdown.value) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
        scrollToHighlighted()
        break
      case 'ArrowUp':
        event.preventDefault()
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
        scrollToHighlighted()
        break
      case 'Enter':
        if (highlightedIndex.value >= 0) {
          event.preventDefault()
          selectOption(filteredOptions.value[highlightedIndex.value])
        } else {
          // 当没有选中项时，触发搜索并显示结果
          event.preventDefault()
          filterSearchOptions()
          showDropdown()
        }
        break
      case 'Escape':
        event.preventDefault()
        showSearchDropdown.value = false
        break
    }
  }
}

// 改进搜索触发逻辑
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
  emit('input', event)

  // 添加搜索下拉功能 - 使用延迟搜索，优化体验
  if (props.searchable) {
    // 使用防抖处理，避免频繁触发
    clearTimeout(searchDebounceTimer.value)
    searchDebounceTimer.value = setTimeout(() => {
      filterSearchOptions()
    }, 300) // 300ms的防抖延迟
  }
}

// 添加搜索防抖处理
const searchDebounceTimer = ref<NodeJS.Timeout | undefined>(undefined)

// 修改 filterSearchOptions 函数以改进空结果处理
const filterSearchOptions = () => {
  if (!props.searchable) {
    filteredOptions.value = []
    return
  }

  // 清空输入时显示推荐选项或隐藏下拉框
  if (!inputValue.value) {
    // 可以选择显示推荐选项或隐藏下拉框
    filteredOptions.value = props.searchOptions.slice(0, props.maxSearchResults)
    if (filteredOptions.value.length > 0) {
      showDropdown()
    } else {
      showSearchDropdown.value = false
    }
    return
  }

  const searchText = inputValue.value.toString().toLowerCase()

  // 如果提供了自定义过滤函数，则使用自定义函数
  if (props.filterFunction && typeof props.filterFunction === 'function') {
    filteredOptions.value = props.filterFunction(props.searchOptions, searchText)
  } else {
    // 默认过滤逻辑
    filteredOptions.value = props.searchOptions.filter(option => {
      const optionLabel = typeof option === 'object' ? option.label || option.value : option
      return String(optionLabel).toLowerCase().includes(searchText)
    }).slice(0, props.maxSearchResults)
  }

  // 重置高亮索引
  highlightedIndex.value = -1

  // 显示下拉框并更新位置
  if (filteredOptions.value.length > 0) {
    showDropdown()
  } else {
    // 也显示"无结果"状态的下拉框
    showDropdown()
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

  // 添加搜索下拉功能
  if (props.searchable) {
    filterSearchOptions()
    showSearchDropdown.value = filteredOptions.value.length > 0
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

// 添加下拉搜索相关状态
const showSearchDropdown = ref(false)
const filteredOptions = ref<Option[]>([])
const highlightedIndex = ref(-1)
const searchResultsRef = ref<HTMLElement | null>(null)

// 高亮显示匹配文本
const highlightText = (text: string) => {
  if (!props.highlightMatches || !inputValue.value) return text

  const searchText = inputValue.value.toString()
  if (!searchText.trim()) return text

  const regex = new RegExp(`(${searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 关闭下拉菜单
const closeSearchDropdown = () => {
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}

// 选择选项
const selectOption = (option: Option) => {
  const value = typeof option === 'object' ? option.value : option
  const label = typeof option === 'object' ? option.label || option.value : option

  inputValue.value = String(label)
  emit('update:modelValue', inputValue.value)
  emit('select-option', option)
  showSearchDropdown.value = false
}

// 滚动到高亮选项
const scrollToHighlighted = () => {
  if (highlightedIndex.value >= 0 && searchResultsRef.value) {
    nextTick(() => {
      const highlightedElement = searchResultsRef.value?.querySelector(`.search-option:nth-child(${highlightedIndex.value + 1})`)
      if (highlightedElement) {
        highlightedElement.scrollIntoView({block: 'nearest'})
      }
    })
  }
}

// 添加下拉框定位相关引用
const inputWrapperRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({top: '0px', left: '0px', width: '0px'})

// 计算下拉框位置
const updateDropdownPosition = () => {
  if (!inputWrapperRef.value) return

  const rect = inputWrapperRef.value.getBoundingClientRect()
  dropdownPosition.value = {
    top: `${rect.bottom + window.scrollY + 5}px`, // 输入框底部 + 滚动偏移 + 间距
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`
  }
}

// 处理下拉框显示
const showDropdown = () => {
  if (!props.searchable || filteredOptions.value.length === 0) return

  updateDropdownPosition()
  showSearchDropdown.value = true
}
</script>

<template>
  <div class="glass-input-wrapper"
       ref="inputWrapperRef"
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
              @input="handleInput"
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
          @input="handleInput"
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

    <!-- 使用 Teleport 传送下拉框到 body -->
    <Teleport to="body">
      <transition name="dropdown-fade">
        <div v-if="searchable && showSearchDropdown"
             class="search-dropdown glass-dropdown"
             ref="searchResultsRef"
             :style="dropdownPosition">
          <div v-if="filteredOptions.length === 0" class="no-results">
            无搜索结果
          </div>
          <template v-else>
            <div
                v-for="(option, index) in filteredOptions"
                :key="typeof option === 'object' ? option.value : index"
                class="search-option"
                :class="{ 'highlighted': index === highlightedIndex }"
                @mouseenter="highlightedIndex = index"
                @click="selectOption(option)"
            >
              <span v-if="typeof option === 'object' && option.label"
                    v-html="highlightText(String(option.label))"></span>
              <span v-else
                    v-html="highlightText(String(typeof option === 'object' ? option.value : option))"></span>
            </div>
          </template>
        </div>
      </transition>
    </Teleport>
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
.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.is-error .glass-textarea,
.is-error {
  border-color: v-bind('errorBorderColor');
}

.is-focused .glass-textarea,
.is-focused {
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

/* 搜索下拉框样式 */
.search-dropdown {
  position: fixed;
  z-index: 9999;
  max-height: 240px;
  overflow-y: auto;
  padding: 8px 0;
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: 2px;
  /* 保持与前缀下拉选择样式一致 */
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.search-option {
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.search-option:hover,
.search-option.highlighted {
  background-color: rgba(24, 144, 255, 0.3);
  color: white;
}

.no-results {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  font-style: italic;
}

/* 高亮匹配文本样式改进 */
.highlight {
  color: #40a9ff;
  font-weight: bold;
  background: rgba(24, 144, 255, 0.15);
  padding: 0 2px;
  border-radius: 2px;
}

/* 下拉动画 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
