<script setup lang="ts">
import { ref } from 'vue‘
const props = defineProps<{
  accept?: string
  maxSize?: number // 单位: MB
  hint?: string
}>()

const emits = defineEmits<{
  (e: 'file', file: File): void
  (e: 'error', message: string): void
}>()

const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndEmitFile(files[0])
  }
}

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    validateAndEmitFile(files[0])
  }
}

function validateAndEmitFile(file: File) {
  // 检查文件类型
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const isValidType = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(new RegExp(type.replace('*', '.*')))
    })

    if (!isValidType) {
      emits('error', '不支持的文件类型')
      return
    }
  }

  // 检查文件大小
  if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
    emits('error', `文件大小不能超过 ${props.maxSize}MB`)
    return
  }

  emits('file', file)

  // 清空 input 值，允许重复上传同一文件
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false
}

function triggerFileSelect() {
  inputRef.value?.click()
}
</script>

<template>
  <div
    class="upload-zone"
    :class="{ 'is-dragging': isDragging }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="triggerFileSelect"
  >
    <div class="upload-content">
      <div class="upload-icon">
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path
            fill="currentColor"
            d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          />
        </svg>
      </div>
      <div class="upload-text">
        <slot name="text">
          <span class="primary-text">点击或拖放文件到此处</span>
          <span v-if="hint" class="hint-text">{{ hint }}</span>
        </slot>
      </div>
    </div>
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      @change="handleFileSelect"
      style="display: none"
    >
  </div>
</template>

<style lang="scss" scoped>
.upload-zone {
  width: 100%;
  padding: 2rem;
  border: 2px dashed var(--n-border-color);
  border-radius: 8px;
  background: var(--n-color);
  cursor: pointer;
  transition: all 0.3s var(--n-bezier);

  &:hover, &.is-dragging {
    border-color: var(--n-primary-color);
    background: var(--n-color-hover);
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  color: var(--n-primary-color);
  opacity: 0.8;
  transition: all 0.3s var(--n-bezier);

  .upload-zone:hover & {
    opacity: 1;
    color: var(--n-primary-color-hover);
  }

  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    transition: transform 0.3s var(--n-bezier);

    .upload-zone:hover & {
      transform: translateY(-2px);
    }
  }
}

.upload-text {
  text-align: center;

  .primary-text {
    display: block;
    font-size: var(--n-font-size);
    color: var(--n-text-color);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .hint-text {
    display: block;
    font-size: var(--n-font-size-small);
    color: var(--n-text-color-2);
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.4;
  }
}

// 拖拽效果
.is-dragging {
  .upload-icon svg {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
}

@media (max-width: 768px) {
  .upload-zone {
    padding: 1.5rem;
  }

  .upload-icon svg {
    width: 24px;
    height: 24px;
  }

  .upload-text {
    .primary-text {
      font-size: var(--n-font-size-small);
    }

    .hint-text {
      font-size: var(--n-font-size-tiny);
      max-width: 300px;
    }
  }
}

// 触摸设备优化
@media (hover: none) {
  .upload-zone {
    &:active {
      border-color: var(--n-primary-color);
      background: var(--n-color-hover);
    }
  }
}
</style>
