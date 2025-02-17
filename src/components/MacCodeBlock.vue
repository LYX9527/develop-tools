<script setup lang="ts">
import {useMessage} from "naive-ui";
import { computed } from 'vue'

const props = defineProps<{
  code: string
  language?: string
}>()

const message = useMessage()

// 处理代码行
const codeLines = computed(() => {
  return props.code.trim().split('\n').map((line, index) => ({
    number: index + 1,
    content: line,
  }))
})

const copyCode = () => {
  navigator.clipboard.writeText(props.code)
      .then(() => {
        message.success('复制成功')
      })
      .catch(() => {
        message.error('复制失败')
      })
}
</script>

<template>
  <div class="mac-code-block">
    <div class="title-bar">
      <div class="window-buttons">
        <span class="button close"></span>
        <span class="button minimize"></span>
        <span class="button maximize"></span>
      </div>
      <div class="title-content">
        <span v-if="language" class="language-badge">{{ language }}</span>
      </div>
      <div class="title-actions">
        <button class="copy-button" @click="copyCode">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <span>复制</span>
        </button>
      </div>
    </div>
    <div class="code-content">
      <slot>
        <div class="code-container">
          <div class="line-numbers">
            <div v-for="line in codeLines" :key="line.number" class="line-number">
              {{ line.number }}
            </div>
          </div>
          <div class="code-lines">
            <div v-for="line in codeLines" 
                 :key="line.number" 
                 class="code-line"
                 :class="{ empty: !line.content.trim() }">
              <code>{{ line.content }}</code>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mac-code-block {
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;

  .title-bar {
    flex-shrink: 0;
    height: 32px;
    background: rgba(50, 50, 50, 0.8);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }

  .window-buttons {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover::after {
        opacity: 0.4;
      }

      &.close {
        background: #ff5f56;

        &::after {
          background: #ff1a1a;
        }
      }

      &.minimize {
        background: #ffbd2e;

        &::after {
          background: #ffb31a;
        }
      }

      &.maximize {
        background: #27c93f;

        &::after {
          background: #1dad2b;
        }
      }
    }
  }

  .title-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .language-badge {
      font-size: 12px;
      padding: 2px 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      text-transform: uppercase;
    }
  }

  .title-actions {
    flex-shrink: 0;

    .copy-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: #e0e0e0;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      svg {
        opacity: 0.8;
      }

      span {
        line-height: 1;
      }
    }
  }

  .code-content {
    flex: 1;
    display: flex;
    overflow: auto;
    min-height: 0;
    padding: 16px;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #d4d4d4;
    background: rgba(30, 30, 30, 0.95);

    .code-container {
      display: flex;
      min-width: 100%;
      height: fit-content;
    }

    .line-numbers {
      flex-shrink: 0;
      padding: 0 12px;
      text-align: right;
      color: #606366;
      user-select: none;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      
      .line-number {
        height: 1.5em;
        font-size: 12px;
      }
    }

    .code-lines {
      flex: 1;
      padding: 0 16px;
      min-width: 0;
      
      .code-line {
        height: 1.5em;
        white-space: pre-wrap;
        position: relative;
        
        &:hover {
          background: rgba(255, 255, 255, 0.05);
          
          &::after {
            content: '';
            position: absolute;
            left: -16px;
            right: -16px;
            top: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.05);
            pointer-events: none;
            z-index: 0;
          }
        }
        
        &.empty {
          height: 1.5em;
        }
        
        code {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
        }
      }
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    code {
      display: block;
      width: 100%;
    }
  }
}
</style>
