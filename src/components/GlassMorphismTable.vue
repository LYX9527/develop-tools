<template>
  <div
    class="glass-table-container"
    :style="{
      '--blur': blur,
      '--opacity': opacity,
      '--radius': radius,
      '--border-color': borderColor,
      '--header-bg-color': headerBackgroundColor,
      '--row-hover-color': rowHoverColor,
      '--text-color': textColor,
      '--width': width
    }"
  >
    <!-- 表格头部 -->
    <div class="glass-table-header">
      <div
        v-for="(column, index) in columns"
        :key="index"
        class="glass-table-cell header-cell"
        :style="{
          width: column.width || 'auto',
          textAlign: column.align || 'left',
          flexGrow: column.ellipsis ? 1 : 0,
          flexShrink: column.ellipsis ? 1 : 0
        }"
      >
        {{ column.title }}
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="glass-table-body" :class="{ 'loading': loading }">
      <template v-if="loading">
        <div class="glass-table-loading">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
      </template>
      <template v-else-if="data && data.length > 0">
        <div
          v-for="(row, rowIndex) in paginatedData"
          :key="rowIndex"
          class="glass-table-row"
          @click="handleRowClick(row, rowIndex)"
        >
          <template v-for="(column, colIndex) in columns" :key="colIndex">
            <div
              class="glass-table-cell"
              :class="{ 'copyable': column.copyable }"
              :style="{
                width: column.width || 'auto',
                textAlign: column.align || 'left',
                flexGrow: column.ellipsis ? 1 : 0,
                flexShrink: column.ellipsis ? 1 : 0
              }"
              @click="column.copyable ? handleCellCopy($event, column, row) : null"
            >
              <template v-if="column.render">
                <div class="custom-cell">
                  <component :is="renderCell(column, row)" />
                </div>
              </template>
              <template v-else>
                <div class="cell-content" :class="{ 'ellipsis': column.ellipsis }">
                  {{ row[column.key] }}
                </div>
              </template>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="glass-table-empty">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zm-8-6h2v2h-2zm0-8h2v6h-2z"/>
            </svg>
          </div>
          <span class="empty-text">{{ emptyText }}</span>
        </div>
      </template>
    </div>

    <!-- 分页 -->
    <div v-if="pagination && paginationConfig" class="glass-table-pagination">
      <div class="pagination-info">
        显示 {{ startIndex + 1 }}-{{ Math.min(endIndex, totalItems) }} 共 {{ totalItems }} 条
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <div class="pagination-pages">
          <template v-for="page in displayedPages" :key="page">
            <button
              v-if="page !== '...'"
              class="page-number"
              :class="{ 'active': page === currentPage }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="ellipsis">...</span>
          </template>
        </div>
        <button
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, h, ref} from 'vue';

interface Column {
  title: string;
  key: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  render?: (row: any) => any;
  copyable?: boolean;
}

interface PaginationConfig {
  pageSize: number;
  current?: number;
  total?: number;
}

const props = defineProps({
  // 表格列配置
  columns: {
    type: Array as () => Column[],
    required: true
  },
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 空数据文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  // 毛玻璃效果
  blur: {
    type: String,
    default: '8px'
  },
  // 背景透明度
  opacity: {
    type: Number,
    default: 0.1
  },
  // 圆角
  radius: {
    type: String,
    default: '8px'
  },
  // 边框颜色
  borderColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.1)'
  },
  // 表头背景色
  headerBackgroundColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.08)'
  },
  // 行悬停颜色
  rowHoverColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.05)'
  },
  // 文本颜色
  textColor: {
    type: String,
    default: 'inherit'
  },
  // 宽度
  width: {
    type: String,
    default: '100%'
  },
  // 分页配置
  pagination: {
    type: [Boolean, Object] as unknown as () => boolean | PaginationConfig,
    default: false
  }
});

const emit = defineEmits(['row-click', 'page-change', 'cell-copy']);

// 渲染自定义单元格
const renderCell = (column: Column, row: any) => {
  if (column.render) {
    return column.render(row);
  }
  return h('span', {}, row[column.key]);
};

// 处理行点击
const handleRowClick = (row: any, index: number) => {
  emit('row-click', row, index);
};

// 处理单元格点击复制
const handleCellCopy = (e: Event, column: Column, row: any) => {
  e.stopPropagation();
  if (!column.copyable) return;

  const textToCopy = row[column.key];
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showCopyFeedback(e.target as HTMLElement);
      emit('cell-copy', textToCopy, row);
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
};

// 显示复制成功的视觉反馈
const showCopyFeedback = (element: HTMLElement) => {
  element.classList.add('copied');

  setTimeout(() => {
    element.classList.remove('copied');
  }, 1000);
};

// 分页逻辑
const paginationConfig = computed(() => {
  if (!props.pagination) return null;
  if (typeof props.pagination === 'boolean') {
    return { pageSize: 10, current: 1 };
  }
  return {
    pageSize: props.pagination.pageSize || 10,
    current: props.pagination.current || 1,
    total: props.pagination.total
  };
});

const currentPage = ref(paginationConfig.value?.current || 1);
const totalItems = computed(() => paginationConfig.value?.total || (props.data?.length || 0));
const totalPages = computed(() => Math.ceil(totalItems.value / (paginationConfig.value?.pageSize || 10)));

const startIndex = computed(() => {
  if (!paginationConfig.value) return 0;
  return (currentPage.value - 1) * paginationConfig.value.pageSize;
});

const endIndex = computed(() => {
  if (!paginationConfig.value) return props.data?.length || 0;
  return Math.min(startIndex.value + paginationConfig.value.pageSize, totalItems.value);
});

const paginatedData = computed(() => {
  if (!props.pagination || !props.data) return props.data;
  return props.data.slice(startIndex.value, endIndex.value);
});

// 分页展示逻辑
const displayedPages = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }

  const pages = [];
  if (currentPage.value <= 3) {
    for (let i = 1; i <= 5; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(totalPages.value);
  } else if (currentPage.value >= totalPages.value - 2) {
    pages.push(1);
    pages.push('...');
    for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    pages.push('...');
    for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(totalPages.value);
  }
  return pages;
});

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit('page-change', page);
};
</script>

<style scoped>
.glass-table-container {
  width: var(--width);
  border-radius: var(--radius);
  overflow: hidden;
  backdrop-filter: blur(var(--blur));
  background-color: rgba(255, 255, 255, var(--opacity));
  border: 1px solid var(--border-color);
  color: var(--text-color);
  transition: box-shadow 0.3s;
}

.glass-table-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.glass-table-header {
  display: flex;
  padding: 12px 16px;
  font-weight: 500;
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--border-color);
  width: 100%;
  box-sizing: border-box;
}

.glass-table-body {
  position: relative;
  min-height: 100px;
  width: 100%;
}

.glass-table-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: nowrap;
}

.glass-table-row:last-child {
  border-bottom: none;
}

.glass-table-row:hover {
  background-color: var(--row-hover-color);
}

.glass-table-cell {
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
}

.glass-table-cell.copyable {
  cursor: pointer;
  position: relative;
  padding-right: 28px;
}

.glass-table-cell.copyable::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232080f0'%3E%3Cpath d='M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.glass-table-cell.copyable:hover::after {
  opacity: 0.8;
}

.glass-table-cell.copyable:hover::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 8px;
  right: 8px;
  height: 1px;
  background-color: rgba(32, 128, 240, 0.5);
}

.glass-table-cell.copyable:active::after {
  opacity: 1;
  transform: translateY(-50%) scale(0.95);
}

.glass-table-cell .cell-content.copied,
.glass-table-cell .custom-cell.copied {
  animation: copy-feedback 0.5s ease;
}

@keyframes copy-feedback {
  0% {
    background-color: rgba(24, 160, 88, 0);
  }
  50% {
    background-color: rgba(24, 160, 88, 0.2);
  }
  100% {
    background-color: rgba(24, 160, 88, 0);
  }
}

.header-cell {
  font-weight: 500;
}

.cell-content {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.glass-table-cell.copyable .cell-content,
.glass-table-cell.copyable .custom-cell {
  max-width: calc(100% - 20px); /* 为复制图标留出空间 */
}

.custom-cell {
  width: 100%;
  overflow: hidden;
}

.glass-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.45);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.glass-table-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #2080f0;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.glass-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-button {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: inherit;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--border-color);
}

.page-number.active {
  background-color: #2080f0;
  color: white;
}

.ellipsis {
  padding: 0 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .pagination-info {
    display: none;
  }

  .glass-table-pagination {
    justify-content: center;
  }
}
</style>
