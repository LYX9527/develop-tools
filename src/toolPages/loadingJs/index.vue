<template>
  <n-card title="代码执行器" size="large">
    <n-input
        v-model:value="code"
        type="textarea"
        placeholder="在这里输入你的 JS 代码"
        rows="10"
    />
    <n-space style="margin-top: 10px">
      <n-button @click="executeCode" type="primary">调试预览</n-button>
      <n-button @click="insertExample">举个例子</n-button>
      <n-button @click="clearCode" type="error">清空</n-button>
      <n-button @click="copyCode">复制</n-button>
    </n-space>
  </n-card>
  <n-modal v-model:show="showModal" :mask-closable="true" >
    <n-card
        style="width: 600px; height: 600px; overflow: auto;"
        title="执行结果:"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
    >
      <pre>{{ executionResult }}</pre>
      <template #footer>
        <div style="justify-content: flex-end; display: flex; gap: 5px;">
          <n-button @click="copyExecutionResult">复制结果</n-button>
          <n-button @click="showModal = false">关闭</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { NCard, NInput, NButton, NSpace, useMessage, NModal } from 'naive-ui'

const code = ref(`for (var i = 9; i > 0; i--) {
  for (var j = 0; j <= 9; j++) {
    var v = i * j;
    console.log(i + " * " + j + " = " + (v < 10 ? " " : "") + v);
  }
  console.log("<br />");
};`)
const message = useMessage()
const showModal = ref(false)
const executionResult = ref('')

const executeCode = () => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
  const win = iframe.contentWindow as any
  if (win) {
    // 重置 logOutput
    win.console.logOutput = ''
    // 重写 iframe 中的 console.log
    win.console.log = function(...args) {
      win.console.logOutput += args.join(' ') + '\n'
    }
    // 执行代码
    win.eval(code.value);
    executionResult.value = win.console.logOutput
  } else {
    message.error('允许弹出窗口。')
  }
  document.body.removeChild(iframe)
  showModal.value = true
}

// 举个例子功能
const insertExample = () => {
  code.value = `for (var i = 1; i <= 10; i++) {
    console.log("例子: " + i)
  };`
  message.success('示例代码已插入。')
}

// 清空功能
const clearCode = () => {
  code.value = ''
  message.info('代码已清空。')
}

// 复制功能
const copyCode = () => {
  navigator.clipboard.writeText(code.value).then(() => {
    message.success('代码已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 复制执行结果功能
const copyExecutionResult = () => {
  navigator.clipboard.writeText(executionResult.value).then(() => {
    message.success('执行结果已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}
</script>

<style lang="scss" scoped>
.loading-js {
  .header {
    width: 100%;
    height: 50px;
  }
  .code-executor {
    width: 100%;
    margin: 0 auto;
    textarea {
      height: 200px;
      margin-bottom: 10px;
    }
  }
}
</style>
