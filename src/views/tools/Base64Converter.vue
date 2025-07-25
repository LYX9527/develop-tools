<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {gsap} from 'gsap'
import TextArea from '@/components/ui/TextArea.vue'
import Button from '@/components/ui/Button.vue'
import Upload from '@/components/ui/Upload.vue'
import {useToast} from '@/composables/useToast'

const toast = useToast()

const originalText = ref('')
const encodedText = ref('')
const uploadedFiles = ref<File[]>([])

// Base64编码
const encodeToBase64 = () => {
  if (!originalText.value.trim()) {
    toast.warning('请输入要编码的文本')
    return
  }

  try {
    encodedText.value = btoa(unescape(encodeURIComponent(originalText.value)))
    toast.success('编码成功！')
  } catch (error) {
    toast.error('编码失败，请检查输入内容')
  }
}

// Base64解码
const decodeFromBase64 = () => {
  if (!encodedText.value.trim()) {
    toast.warning('请输入要解码的Base64文本')
    return
  }

  try {
    originalText.value = decodeURIComponent(escape(atob(encodedText.value)))
    toast.success('解码成功！')
  } catch (error) {
    toast.error('解码失败，请检查Base64格式是否正确')
  }
}

// 清空内容
const clearAll = () => {
  originalText.value = ''
  encodedText.value = ''
  uploadedFiles.value = []
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板！')
  } catch (error) {
    toast.error('复制失败')
  }
}

// 处理文件上传
const handleFileUpload = (files: File[]) => {
  if (files.length > 0) {
    const file = files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result) {
        if (file.type.startsWith('image/')) {
          // 图片文件直接转为Base64
          const base64 = (e.target.result as string).split(',')[1]
          encodedText.value = base64
        } else {
          // 文本文件读取内容
          originalText.value = e.target.result as string
        }
        toast.success('文件读取成功！')
      }
    }

    reader.onerror = () => {
      toast.error('文件读取失败')
    }

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
  }
}

// 加载示例
const loadExample = () => {
  originalText.value = '欢迎使用开发者工具箱！这是一个功能强大的在线工具集合。支持多种编码转换、文本处理、密码生成等功能。'
}

// 动画
onMounted(() => {
  gsap.fromTo('.tool-container',
      {opacity: 0, y: 30},
      {opacity: 1, y: 0, duration: 0.8, ease: "power3.out"}
  )
})
</script>

<template>


</template>

<style scoped>
/* 自定义样式 */
.tool-container {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
