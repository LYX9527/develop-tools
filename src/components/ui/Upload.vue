<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import Button from './Button.vue';

interface FileItem {
  file: File;
  id: string;
  preview?: string;
}

const props = defineProps<{
  modelValue?: File[];
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  id?: string;
  error?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', files: File[]): void;
  (e: 'error', message: string): void;
}>();

const uploadId = computed(() => props.id || `upload-${Math.random().toString(36).substring(2, 9)}`);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const fileItems = ref<FileItem[]>([]);
const errorMessage = ref<string>('');

// Initialize fileItems from modelValue
watch(() => props.modelValue, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    fileItems.value = newFiles.map(file => ({
      file,
      id: generateId(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
  }
}, { immediate: true });

// Update modelValue when fileItems change
watch(fileItems, (newFileItems) => {
  emit('update:modelValue', newFileItems.map(item => item.file));
}, { deep: true });

const generateId = () => {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    addFiles(Array.from(input.files));
  }
  // Reset the input so the same file can be selected again
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const addFiles = (files: File[]) => {
  if (props.disabled) return;

  errorMessage.value = '';

  // Check max files limit
  if (props.maxFiles && fileItems.value.length + files.length > props.maxFiles) {
    const message = `Maximum ${props.maxFiles} files allowed`;
    errorMessage.value = message;
    emit('error', message);
    return;
  }

  // Process each file
  files.forEach(file => {
    // Check file type if accept is specified
    if (props.accept) {
      const acceptTypes = props.accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;

      const isAccepted = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension check
          return type.toLowerCase() === fileExtension.toLowerCase();
        } else if (type.includes('*')) {
          // Wildcard MIME type check
          const typePattern = type.replace('*', '');
          return fileType.startsWith(typePattern);
        } else {
          // Exact MIME type check
          return type === fileType;
        }
      });

      if (!isAccepted) {
        const message = `File type not accepted: ${file.name}`;
        errorMessage.value = message;
        emit('error', message);
        return;
      }
    }

    // Check file size if maxSize is specified
    if (props.maxSize && file.size > props.maxSize) {
      const message = `File too large: ${file.name}`;
      errorMessage.value = message;
      emit('error', message);
      return;
    }

    // Add file to the list
    const fileItem: FileItem = {
      file,
      id: generateId(),
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      fileItem.preview = URL.createObjectURL(file);
    }

    fileItems.value.push(fileItem);
  });
};

const removeFile = (id: string) => {
  const index = fileItems.value.findIndex(item => item.id === id);
  if (index !== -1) {
    // Revoke object URL if it exists
    if (fileItems.value[index].preview) {
      URL.revokeObjectURL(fileItems.value[index].preview!);
    }
    fileItems.value.splice(index, 1);
  }
};

const handleDragEnter = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
};

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;

  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const openFileDialog = () => {
  if (props.disabled) return;
  fileInputRef.value?.click();
};

// Clean up object URLs when component is unmounted
const cleanupPreviews = () => {
  fileItems.value.forEach(item => {
    if (item.preview) {
      URL.revokeObjectURL(item.preview);
    }
  });
};

onBeforeUnmount(cleanupPreviews);
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="uploadId"
      class="block text-sm font-medium mb-1 dark:text-gray-200"
    >
      {{ label }}
    </label>

    <div
      class="relative"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        :id="uploadId"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="sr-only"
        @change="handleFileInputChange"
      />

      <!-- Upload area -->
      <div
        class="border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors"
        :class="[
          {
            'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/10': isDragging,
            'border-gray-300 hover:border-primary-400 dark:border-gray-700 dark:hover:border-primary-500': !isDragging && !disabled,
            'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900/50': disabled,
          }
        ]"
        @click="openFileDialog"
      >
        <div class="space-y-2">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <span class="font-medium text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
            <p class="text-xs">{{ accept ? `Accepted file types: ${accept}` : 'All file types accepted' }}</p>
            <p v-if="maxSize" class="text-xs">Maximum file size: {{ (maxSize / 1024 / 1024).toFixed(2) }} MB</p>
            <p v-if="maxFiles" class="text-xs">Maximum files: {{ maxFiles }}</p>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error || errorMessage" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ error || errorMessage }}
      </div>

      <!-- File list -->
      <ul v-if="fileItems.length > 0" class="mt-4 space-y-2">
        <li
          v-for="item in fileItems"
          :key="item.id"
          class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
        >
          <div class="flex items-center space-x-3">
            <!-- Preview for images -->
            <div v-if="item.preview" class="h-10 w-10 flex-shrink-0">
              <img :src="item.preview" class="h-10 w-10 rounded-md object-cover" />
            </div>
            <!-- Icon for non-image files -->
            <div v-else class="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
              <svg class="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ item.file.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ (item.file.size / 1024).toFixed(2) }} KB</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon
            rounded="full"
            @click.stop="removeFile(item.id)"
            class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>
