<template>
  <svg
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
  >
    <!-- 左侧文档 -->
    <path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
    <!-- 右侧文档 -->
    <path d="M16 2h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
    <!-- 对比箭头 -->
    <path d="M8 12h8"/>
    <path d="M12 8l4 4-4 4"/>
    <!-- 差异标记 -->
    <circle cx="6" cy="8" r="1"/>
    <circle cx="6" cy="12" r="1"/>
    <circle cx="18" cy="10" r="1"/>
    <circle cx="18" cy="14" r="1"/>
  </svg>
</template>
