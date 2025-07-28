<template>
  <span
    ref="numberElement"
    :class="customClass"
    class="number-counter"
  >
    {{ displayValue }}
  </span>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref, watch} from 'vue'

interface Props {
  value: number
  duration?: number
  currency?: string
  decimals?: number
  customClass?: string
  autoDecimals?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1000,
  currency: '',
  decimals: 2,
  customClass: '',
  autoDecimals: true
})

const numberElement = ref<HTMLElement>()
const displayValue = ref('0')
const currentNumber = ref(0)

// 动画数值变化
function animateValue(start: number, end: number, duration: number) {
  if (start === end) {
    updateDisplay(end)
    return
  }

  let startTime: number | null = null

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp

    const progress = Math.min((timestamp - startTime) / duration, 1)
    // 使用缓动函数：easeOutCubic
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    const currentValue = start + (end - start) * easedProgress

    updateDisplay(currentValue)

    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      currentNumber.value = end
    }
  }

  window.requestAnimationFrame(step)
}

// 更新显示值
function updateDisplay(value: number) {
  let fractionDigits = props.decimals

  if (props.autoDecimals) {
    fractionDigits = Number.isInteger(props.value) ? 0 : props.decimals
  }

  const formattedValue = value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

  displayValue.value = props.currency ? `${props.currency}${formattedValue}` : formattedValue
}

// 监听数值变化
watch(() => props.value, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    animateValue(currentNumber.value, newValue, props.duration)
  }
}, { immediate: true })

onMounted(() => {
  nextTick(() => {
    updateDisplay(props.value)
    currentNumber.value = props.value
  })
})
</script>

<style scoped>
.number-counter {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
}
</style>
