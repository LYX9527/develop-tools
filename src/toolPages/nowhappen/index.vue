<script setup lang="ts">
import {onMounted, ref} from 'vue'
import GlassMorphismPanel from '@/components/GlassMorphismPanel.vue'
import GlassMorphismInput from '@/components/GlassMorphismInput.vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 格式化时间
const formatTime = (date: number | string) => {
  const now = dayjs()
  const postTime = dayjs(date)
  const diffMinutes = now.diff(postTime, 'minute')

  if (diffMinutes === 0) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffMinutes < 1440) { // 24小时内
    const hours = Math.floor(diffMinutes / 60)
    return `${hours}小时前`
  } else {
    return postTime.format('MM-DD HH:mm')
  }
}

// 定义卡片大小类型
type CardSize = '1' | '2' | '4';

interface SubPlatform {
  platform: string
  label: string
  parentLabel?: string  // 父平台标签
  hasMultipleSubPlatforms?: boolean  // 是否有多个子平台
}

interface Platform {
  platform: string
  label: string
  list: SubPlatform[]
}

interface NewsItem {
  id: string | number
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: {
    hover?: string
    date?: number | string
    info?: false | string
    diff?: number
    icon?: false | string | {
      url: string
      scale: number
    }
  }
}

interface PlatformNews {
  platform: string
  label: string
  news: NewsItem[]
  isLoading: boolean
  size?: CardSize
  isPinned?: boolean
  isFavorite?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 定义新闻来源及其新闻
const platformNewsList = ref<PlatformNews[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// 拖拽相关状态
const isDragging = ref(false)
const draggedItem = ref<string | null>(null)
const dragOverItem = ref<string | null>(null)
const isResizing = ref(false)

// 获取单个平台的新闻
const fetchPlatformNews = async (platform: SubPlatform) => {
  const platformNewsItem: PlatformNews = {
    platform: platform.platform,
    // 只有在有多个子平台时才使用 "父平台-子平台" 的格式
    label: platform.hasMultipleSubPlatforms ? `${platform.parentLabel}-${platform.label}` : platform.label,
    news: [],
    isLoading: true,
    size: '1' // 初始化 size 属性
  }
  // 先添加到列表中，显示骨架屏
  const index = platformNewsList.value.push(platformNewsItem) - 1

  try {
    const newsResponse = await fetch(`${API_BASE_URL}/news?platform=${platform.platform}`)
    const newsResult = await newsResponse.json()
    if (newsResult.code === 200) {
      // 更新对应索引的新闻数据
      platformNewsList.value[index] = {
        ...platformNewsItem,
        news: newsResult.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          mobileUrl: item.mobileUrl,
          pubDate: item.pubDate,
          extra: item.extra
        })),
        isLoading: false
      }
    }
  } catch (error) {
    console.error(`获取${platform.label}新闻失败:`, error)
    platformNewsList.value[index].isLoading = false
  }
}

// 获取支持的平台列表
const fetchPlatforms = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/platforms`)
    const result = await response.json()
    if (result.code === 200 && result.data) {
      // 处理子平台，添加父平台标签和多子平台标记
      const subPlatforms = result.data.flatMap((platform: Platform) => {
        const hasMultiple = platform.list.length > 1
        return platform.list.map(subPlatform => ({
          ...subPlatform,
          parentLabel: platform.label,
          hasMultipleSubPlatforms: hasMultiple
        }))
      })

      // 对子平台进行排序，热搜优先
      const sortedSubPlatforms = subPlatforms.sort((a, b) => {
        const aIsHot = a.platform.includes('hot') || a.platform.includes('热搜')
        const bIsHot = b.platform.includes('hot') || b.platform.includes('热搜')
        if (aIsHot && !bIsHot) return -1
        if (!aIsHot && bIsHot) return 1
        return 0
      })

      // 并行加载所有平台的新闻
      const fetchPromises = sortedSubPlatforms.map(subPlatform => fetchPlatformNews(subPlatform))

      // 等待所有请求完成
      await Promise.allSettled(fetchPromises)
    }
  } catch (error) {
    console.error('获取平台列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 跳转到新闻详情
const goToDetail = (url: string) => {
  window.open(url, '_blank')
}

// 过滤新闻
const filterNews = (news: NewsItem[]) => {
  if (!searchQuery.value) return news
  const query = searchQuery.value.toLowerCase()
  return news.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.extra?.hover?.toLowerCase().includes(query) ||
      (item.extra?.info as string).toLowerCase().includes(query)
  )
}

// 处理拖拽开始
const handleDragStart = (e: DragEvent, platform: PlatformNews) => {
  if (isResizing.value) return;
  isDragging.value = true;
  draggedItem.value = platform.platform;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', platform.platform);
  }
};

// 处理拖拽结束
const handleDragEnd = () => {
  isDragging.value = false;
  draggedItem.value = null;
  dragOverItem.value = null;
}

// 处理拖拽悬停
const handleDragOver = (e: DragEvent, platform: PlatformNews) => {
  e.preventDefault();
  if (!isDragging.value) return;

  if (draggedItem.value !== platform.platform) {
    dragOverItem.value = platform.platform;
  }
};

// 处理放置
const handleDrop = (e: DragEvent, targetPlatform: PlatformNews) => {
  e.preventDefault();
  if (!draggedItem.value || !dragOverItem.value) return;

  const fromIndex = platformNewsList.value.findIndex(p => p.platform === draggedItem.value);
  const toIndex = platformNewsList.value.findIndex(p => p.platform === dragOverItem.value);

  if (fromIndex !== -1 && toIndex !== -1) {
    const [movedPlatform] = platformNewsList.value.splice(fromIndex, 1);
    platformNewsList.value.splice(toIndex, 0, movedPlatform);
    saveLayoutToStorage();
  }

  handleDragEnd();
};

// 处理大小调整为缩小
const handleResize = (platform: PlatformNews) => {
  const sizeOrder: CardSize[] = ['4', '2', '1'];
  const currentIndex = sizeOrder.indexOf(platform.size || '1');
  platform.size = sizeOrder[(currentIndex + 1) % sizeOrder.length];
  saveLayoutToStorage();
}

// 新增放大功能
const handleEnlarge = (platform: PlatformNews) => {
  const sizeOrder: CardSize[] = ['1', '2', '4'];
  const currentIndex = sizeOrder.indexOf(platform.size || '1');
  platform.size = sizeOrder[(currentIndex + 1) % sizeOrder.length];
  saveLayoutToStorage();
}

// 处理收藏切换
const toggleFavorite = (platform: PlatformNews) => {
  platform.isFavorite = !platform.isFavorite;
  saveLayoutToStorage();
}

// 处理置顶切换
const togglePin = (platform: PlatformNews) => {
  platform.isPinned = !platform.isPinned;
  // 重新排序
  const pinnedPlatforms = platformNewsList.value.filter(p => p.isPinned);
  const unpinnedPlatforms = platformNewsList.value.filter(p => !p.isPinned);
  platformNewsList.value = [...pinnedPlatforms, ...unpinnedPlatforms];
  saveLayoutToStorage();
}

// 保存布局到本地存储
const saveLayoutToStorage = () => {
  const layout = platformNewsList.value.map(p => ({
    platform: p.platform,
    size: p.size || '1',
    isPinned: p.isPinned || false,
    isFavorite: p.isFavorite || false
  }));
  localStorage.setItem('news-layout', JSON.stringify(layout));
}

// 从本地存储加载布局
const loadLayoutFromStorage = () => {
  const savedLayout = localStorage.getItem('news-layout');
  if (savedLayout) {
    const layout = JSON.parse(savedLayout);
    platformNewsList.value.forEach(platform => {
      const savedPlatform = layout.find((l: any) => l.platform === platform.platform);
      if (savedPlatform) {
        platform.size = savedPlatform.size;
        platform.isPinned = savedPlatform.isPinned;
        platform.isFavorite = savedPlatform.isFavorite;
      }
    });
  }
}

const handleResizeMove = (e: MouseEvent, platform: PlatformNews) => {
  if (!isResizing) return;
  // 根据鼠标移动方向调整列数
  const deltaX = e.movementX;
  const columnOrder: string[] = ['1', '2', '3', '4'];
  let currentIndex = columnOrder.indexOf(platform.size || '1');
  if (deltaX > 5) { // 增加移动阈值
    currentIndex = (currentIndex + 1) % columnOrder.length;
  } else if (deltaX < -5) {
    currentIndex = (currentIndex - 1 + columnOrder.length) % columnOrder.length;
  }
  platform.size = columnOrder[currentIndex];
  isResizing = false; // 结束调整
};


onMounted(() => {
  fetchPlatforms().then(() => {
    loadLayoutFromStorage();
  });
})
</script>

<template>
  <div class="news-container">
    <GlassMorphismPanel class="search-section" :blur="10" :opacity="0.2">
      <GlassMorphismInput
          v-model="searchQuery"
          placeholder="搜索新闻..."
          :search="true"
      />
    </GlassMorphismPanel>

    <div class="platforms-grid">
      <GlassMorphismPanel
          v-for="platform in platformNewsList"
          :key="platform.platform"
          class="platform-card"
          :class="[
            platform.size ? `size-${platform.size}` : 'size-1',
            {
              'is-dragging': platform.platform === draggedItem,
              'drag-over': platform.platform === dragOverItem,
              'is-pinned': platform.isPinned
            }
          ]"
          :blur="8"
          :opacity="0.15"
          draggable="true"
          @dragstart="handleDragStart($event, platform)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver($event, platform)"
          @drop="handleDrop($event, platform)"
      >
        <!-- 操作按钮 -->
        <div class="tool-actions">
          <button
              class="action-button enlarge-button"
              :disabled="platform.size === '4'"
              @click.stop="handleEnlarge(platform)"
              title="放大"
          >
            <i class="enlarge-icon"></i>
          </button>
          <button
              class="action-button resize-button"
              :disabled="platform.size === '1'"
              @click.stop="handleResize(platform)"
              title="缩小"
          >
            <i class="resize-icon"></i>
          </button>
          <button
              class="action-button favorite-button"
              :class="{ 'active': platform.isFavorite }"
              @click.stop="toggleFavorite(platform)"
              title="收藏"
          >
            <i class="favorite-icon"></i>
          </button>
          <button
              class="action-button pin-button"
              :class="{ 'active': platform.isPinned }"
              @click.stop="togglePin(platform)"
              title="固定在首位"
          >
            <i class="pin-icon"></i>
          </button>
        </div>

        <!-- 现有的平台内容 -->
        <div class="platform-header">
          <div class="platform-title-wrapper">
            <h3 class="platform-title">{{ platform.label }}</h3>
          </div>
          <span class="news-count">{{ platform.news.length }}条</span>
        </div>

        <!-- 骨架屏 -->
        <div v-if="platform.isLoading" class="skeleton-list">
          <div v-for="i in 5" :key="i" class="skeleton-item">
            <div class="skeleton-time"></div>
            <div class="skeleton-title"></div>
          </div>
        </div>

        <!-- 新闻列表 -->
        <div v-else class="news-list">
          <div
              v-for="item in filterNews(platform.news)"
              :key="item.id"
              class="news-item"
              @click="goToDetail(item.mobileUrl || item.url)"
              :title="item.extra?.hover"
          >
            <!-- 添加时间显示 -->
            <div v-if="item.extra?.date" class="news-time">
              {{ formatTime(item.extra.date) }}
            </div>
            <div class="news-content">
              <!-- 图标 -->
              <div v-if="item.extra?.icon" class="news-icon">
                <img
                    v-if="typeof item.extra.icon === 'object'"
                    :src="item.extra.icon.url"
                    :style="{ transform: `scale(${item.extra.icon.scale})` }"
                    alt=""
                />
                <img
                    v-else-if="typeof item.extra.icon === 'string'"
                    :src="item.extra.icon"
                    alt=""
                />
              </div>

              <div class="news-main">
                <!-- 信息标签移到上方 -->
                <div
                    v-if="item.extra?.info"
                    class="news-info-wrapper"
                >
                  <span class="news-info" :class="{ 'with-diff': item.extra.diff !== undefined }">
                    {{ item.extra.info }}
                    <span v-if="item.extra.diff !== undefined" class="diff-tag">
                      {{ item.extra.diff > 0 ? '+' : '' }}{{ item.extra.diff }}
                    </span>
                  </span>
                </div>
                <!-- 标题移到下方 -->
                <div class="news-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </GlassMorphismPanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.search-section {
  margin-bottom: 24px;
  padding: 16px;
  position: sticky;
  top: 24px;
  z-index: 100;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  grid-auto-flow: row dense; // 确保按行排列
  align-items: start;
}

.platform-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 800px; // 固定高度
  overflow-y: auto; // 超出时使用滚动条
  min-height: 100px;
  // 确保过渡动画生效
  transition: transform 0.3s ease, grid-column 0.3s ease, width 0.3s ease;

  &.size-1 {
    grid-column: span 1;
  }

  &.size-2 {
    grid-column: span 2;
  }

  &.size-4 {
    grid-column: span 4;
  }

  &.is-dragging {
    opacity: 0.5;
    transform: scale(0.98);
  }

  &.drag-over {
    transform: scale(1.02);
  }

  .platform-header {
    flex-shrink: 0;
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    background: inherit;

    .platform-title-wrapper {
      flex: 1;
      min-width: 0;

      .platform-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .news-count {
      flex-shrink: 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
      margin-left: 8px;
    }
  }

  .news-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .news-item {
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: flex-start;
      gap: 12px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .news-time {
        flex-shrink: 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        min-width: 68px;
        padding-top: 2px;
      }

      .news-content {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: flex-start;
        gap: 8px;

        .news-icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        }

        .news-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .news-info-wrapper {
            display: flex;
            align-items: center;
            margin-bottom: 2px; // 添加一点额外的间距
          }

          .news-info {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.1);
            padding: 1px 6px;
            border-radius: 4px;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;

            &.with-diff {
              background: rgba(103, 58, 183, 0.3);
            }

            .diff-tag {
              color: #81c784;
              font-family: monospace;
            }
          }

          .news-title {
            font-size: 13px;
            color: white;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }

  // 骨架屏样式
  .skeleton-list {
    flex: 1;
    padding: 8px 12px;
    overflow-y: auto;

    .skeleton-item {
      margin-bottom: 12px;

      .skeleton-time {
        width: 60px;
        height: 12px;
        background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.1) 25%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 6px;
      }

      .skeleton-title {
        width: 100%;
        height: 14px;
        background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.1) 25%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 工具操作按钮样式
.tool-actions {
  display: flex;
  gap: 6px;
  z-index: 5;
  opacity: 1;
  transition: none;
  height: 48px;
  justify-content: end;
}

.platform-card:hover .tool-actions {
  opacity: 1;
}

.action-button {
  width: 26px;
  height: 26px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  backdrop-filter: blur(3px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  &.active {
    color: #007BFF;
    border-color: #007BFF;
    background: rgba(0, 123, 255, 0.1);
  }
}

// 固定标记样式
.is-pinned::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  background: #007BFF;
  clip-path: polygon(0 0, 0 100%, 100% 0);
  z-index: 4;
}

.is-pinned::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  z-index: 4;
}

// 图标样式
.pin-icon, .favorite-icon {
  width: 14px;
  height: 14px;
}

.pin-icon {
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.favorite-icon {
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

// 更新放大和缩小图标样式
.enlarge-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 5v14m-7-7h14' stroke='currentColor' stroke-width='2'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.resize-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M5 12h14' stroke='currentColor' stroke-width='2'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

@media (max-width: 768px) {
  .news-container {
    padding: 16px;
  }

  .platforms-grid {
    grid-template-columns: 1fr;
  }

  .platform-card {
    &.size-2, &.size-3, &.size-4 {
      grid-column: span 1;
    }
  }
}
</style>
