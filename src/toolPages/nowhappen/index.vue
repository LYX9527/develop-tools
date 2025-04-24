<script setup lang="ts">
import {onMounted, ref} from 'vue'
import GlassMorphismPanel from '@/components/GlassMorphismPanel.vue'
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

// 新闻布局设置接口
interface NewsLayoutPreferences {
  pinned: string[];       // 置顶的平台ID列表
  sortOrder: string[];    // 所有平台的排序顺序
  favorites: string[];    // 收藏的平台ID列表
  sizes: Record<string, CardSize>;  // 每个平台的大小设置
}

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
  hasError?: boolean
  errorMessage?: string
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
  // 从本地存储中获取该平台的设置（如果有）
  const savedSettings = getSavedPlatformSettings(platform.platform);

  const platformNewsItem: PlatformNews = {
    platform: platform.platform,
    // 只有在有多个子平台时才使用 "父平台-子平台" 的格式
    label: platform.hasMultipleSubPlatforms ? `${platform.parentLabel}-${platform.label}` : platform.label,
    news: [],
    isLoading: true,
    // 使用保存的设置或默认值
    size: savedSettings?.size || '1',
    isPinned: savedSettings?.isPinned || false,
    isFavorite: savedSettings?.isFavorite || false
  }
  // 先添加到列表中，显示骨架屏
  const index = platformNewsList.value.push(platformNewsItem) - 1

  try {
    const newsResponse = await fetch(`${API_BASE_URL}/news?platform=${platform.platform}`)
    if (!newsResponse.ok) {
      throw new Error(`请求失败: ${newsResponse.status} ${newsResponse.statusText}`)
    }

    const newsResult = await newsResponse.json()
    if (newsResult.code === 200) {
      // 更新对应索引的新闻数据，保留已设置的布局属性
      platformNewsList.value[index] = {
        ...platformNewsItem,
        news: newsResult.data.map((item: any, idx: number) => {
          // 检查是否为热搜类型的平台
          const isHotSearch = platform.platform.includes('hot') ||
              platform.platform.includes('热搜') ||
              platform.label.includes('热搜');

          // 检查是否为股票类型的平台
          const isStock = platform.platform.includes('stock') ||
              platform.platform.includes('股票') ||
              platform.label.includes('股票') ||
              platform.label.includes('A股') ||
              (item.extra?.diff !== undefined);

          // 检查是否为GitHub平台
          const isGitHub = platform.platform.includes('github') ||
              platform.label.includes('GitHub') ||
              platform.label.includes('github');

          // 检查是否是带有star信息的GitHub条目
          const isGitHubStar = isGitHub && item.extra?.info && typeof item.extra.info === 'string' &&
              (item.extra.info.includes('star') || item.extra.info.includes('★'));

          // 不再直接修改标题，而是添加排名信息和平台类型信息到extra
          return {
            id: item.id,
            title: item.title,
            url: item.url,
            mobileUrl: item.mobileUrl,
            pubDate: item.pubDate,
            extra: {
              ...item.extra,
              // 添加热搜排名信息
              rank: isHotSearch ? idx + 1 : undefined,
              // 添加股票类型标记
              isStock: isStock,
              // 添加GitHub Star标记
              isGitHubStar: isGitHubStar
            }
          };
        }),
        isLoading: false,
        hasError: false,
        errorMessage: ''
      }
    } else {
      throw new Error(`数据错误: ${newsResult.message || '未知错误'}`)
    }
  } catch (error) {
    console.error(`获取${platform.label}新闻失败:`, error)
    platformNewsList.value[index] = {
      ...platformNewsItem,
      isLoading: false,
      hasError: true,
      errorMessage: error instanceof Error ? error.message : '请求失败，请稍后重试'
    }
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
      (typeof item.extra?.info === 'string' && item.extra.info.toLowerCase().includes(query))
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
    // 分离处理置顶项和非置顶项
    const pinnedPlatforms = platformNewsList.value.filter(p => p.isPinned);
    const unpinnedPlatforms = platformNewsList.value.filter(p => !p.isPinned);

    // 检查拖动的项是否为置顶项
    const movedItemIsPinned = platformNewsList.value[fromIndex].isPinned;

    if (movedItemIsPinned) {
      // 如果是置顶项，只在置顶项内部调整顺序
      const pinnedFromIndex = pinnedPlatforms.findIndex(p => p.platform === draggedItem.value);
      const pinnedToIndex = pinnedPlatforms.findIndex(p => p.platform === dragOverItem.value);

      if (pinnedFromIndex !== -1 && pinnedToIndex !== -1) {
        const [movedPlatform] = pinnedPlatforms.splice(pinnedFromIndex, 1);
        pinnedPlatforms.splice(pinnedToIndex, 0, movedPlatform);
      }
    } else {
      // 如果是非置顶项
      const sourceList = movedItemIsPinned ? pinnedPlatforms : unpinnedPlatforms;
      const targetList = platformNewsList.value[toIndex].isPinned ? pinnedPlatforms : unpinnedPlatforms;

      const sourceIndex = sourceList.findIndex(p => p.platform === draggedItem.value);
      const targetIndex = targetList.findIndex(p => p.platform === dragOverItem.value);

      // 从源列表中移除
      if (sourceIndex !== -1) {
        const [movedPlatform] = sourceList.splice(sourceIndex, 1);

        // 如果目标是置顶列表且移动项不是置顶的，则设置为置顶
        if (targetList === pinnedPlatforms && !movedItemIsPinned) {
          movedPlatform.isPinned = true;
        }

        // 添加到目标列表
        if (targetIndex !== -1) {
          targetList.splice(targetIndex, 0, movedPlatform);
        } else {
          targetList.push(movedPlatform);
        }
      }
    }

    // 更新平台列表
    platformNewsList.value = [...pinnedPlatforms, ...unpinnedPlatforms];

    // 保存当前布局
    saveLayoutToStorage();
  }

  handleDragEnd();
};

// 处理大小调整为缩小
const handleResize = (platform: PlatformNews) => {
  // 添加标记表示正在进行动画
  isResizing.value = true;
  draggedItem.value = platform.platform; // 保存当前调整大小的平台ID

  const sizeOrder: CardSize[] = ['4', '2', '1'];
  const currentIndex = sizeOrder.indexOf(platform.size || '1');

  // 保存旧尺寸，用于触发动画
  const oldSize = platform.size;

  // 立即应用新尺寸以触发CSS过渡
  platform.size = sizeOrder[(currentIndex + 1) % sizeOrder.length];

  // 使用setTimeout确保CSS有时间应用新的类
  setTimeout(() => {
    isResizing.value = false;
    draggedItem.value = null;
    saveLayoutToStorage();
  }, 300); // 等待动画完成
}

// 新增放大功能
const handleEnlarge = (platform: PlatformNews) => {
  // 添加标记表示正在进行动画
  isResizing.value = true;
  draggedItem.value = platform.platform; // 保存当前调整大小的平台ID

  const sizeOrder: CardSize[] = ['1', '2', '4'];
  const currentIndex = sizeOrder.indexOf(platform.size || '1');

  // 保存旧尺寸，用于触发动画
  const oldSize = platform.size;

  // 立即应用新尺寸以触发CSS过渡
  platform.size = sizeOrder[(currentIndex + 1) % sizeOrder.length];

  // 使用setTimeout确保CSS有时间应用新的类
  setTimeout(() => {
    isResizing.value = false;
    draggedItem.value = null;
    saveLayoutToStorage();
  }, 300); // 等待动画完成
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

  // 更新平台列表
  platformNewsList.value = [...pinnedPlatforms, ...unpinnedPlatforms];

  // 保存最新布局到本地存储
  saveLayoutToStorage();
}

// 保存布局到本地存储
const saveLayoutToStorage = () => {
  // 构建新的布局偏好对象
  const preferences: NewsLayoutPreferences = {
    pinned: platformNewsList.value.filter(p => p.isPinned).map(p => p.platform),
    favorites: platformNewsList.value.filter(p => p.isFavorite).map(p => p.platform),
    sortOrder: platformNewsList.value.map(p => p.platform),
    sizes: Object.fromEntries(
        platformNewsList.value.map(p => [p.platform, p.size || '1'])
    )
  };

  // 保存到本地存储
  localStorage.setItem('news-layout-preferences', JSON.stringify(preferences));
}

// 获取保存的平台设置
const getSavedPlatformSettings = (platformId: string) => {
  const savedPreferences = localStorage.getItem('news-layout-preferences');
  if (!savedPreferences) return null;

  try {
    const preferences: NewsLayoutPreferences = JSON.parse(savedPreferences);
    return {
      size: preferences.sizes[platformId] || '1',
      isPinned: preferences.pinned.includes(platformId),
      isFavorite: preferences.favorites.includes(platformId)
    };
  } catch (e) {
    console.error('解析保存的布局偏好失败:', e);
    return null;
  }
}

// 从本地存储加载布局
const loadLayoutFromStorage = () => {
  const savedPreferences = localStorage.getItem('news-layout-preferences');
  if (savedPreferences) {
    try {
      const preferences: NewsLayoutPreferences = JSON.parse(savedPreferences);

      // 临时存储所有平台
      const platformsMap = new Map<string, PlatformNews>();
      platformNewsList.value.forEach(platform => {
        platformsMap.set(platform.platform, platform);
      });

      // 应用设置到各个平台
      platformNewsList.value.forEach(platform => {
        const platformId = platform.platform;
        platform.size = preferences.sizes[platformId] || '1';
        platform.isPinned = preferences.pinned.includes(platformId);
        platform.isFavorite = preferences.favorites.includes(platformId);
      });

      // 根据保存的顺序重新排列平台
      const orderedPlatforms: PlatformNews[] = [];

      // 先添加存在于保存顺序中的平台
      preferences.sortOrder.forEach(platformId => {
        if (platformsMap.has(platformId)) {
          orderedPlatforms.push(platformsMap.get(platformId)!);
          platformsMap.delete(platformId);
        }
      });

      // 添加剩余未包含在保存顺序中的平台（新添加的平台）
      const remainingPlatforms = Array.from(platformsMap.values());

      // 更新平台列表
      platformNewsList.value = [...orderedPlatforms, ...remainingPlatforms];

      // 确保置顶的平台还是在最前面
      const pinnedPlatforms = platformNewsList.value.filter(p => p.isPinned);
      const unpinnedPlatforms = platformNewsList.value.filter(p => !p.isPinned);
      if (pinnedPlatforms.length > 0) {
        platformNewsList.value = [...pinnedPlatforms, ...unpinnedPlatforms];
      }
    } catch (e) {
      console.error('解析保存的布局偏好失败:', e);
    }
  }
}

// 添加刷新功能
const refreshPlatform = async (platform: PlatformNews) => {
  platform.isLoading = true;
  platform.hasError = false;
  platform.errorMessage = '';

  try {
    const newsResponse = await fetch(`${API_BASE_URL}/news?platform=${platform.platform}`);
    if (!newsResponse.ok) {
      throw new Error(`请求失败: ${newsResponse.status} ${newsResponse.statusText}`)
    }

    const newsResult = await newsResponse.json();
    if (newsResult.code === 200) {
      // 检查是否为热搜平台
      const isHotSearch = platform.platform.includes('hot') ||
          platform.platform.includes('热搜') ||
          platform.label.includes('热搜');

      // 检查是否为股票类型的平台
      const isStockPlatform = platform.platform.includes('stock') ||
          platform.platform.includes('股票') ||
          platform.label.includes('股票') ||
          platform.label.includes('A股');

      // 检查是否为GitHub平台
      const isGitHubPlatform = platform.platform.includes('github') ||
          platform.label.includes('GitHub') ||
          platform.label.includes('github');

      platform.news = newsResult.data.map((item: any, idx: number) => {
        // 如果平台是股票平台或者新闻项有涨跌幅，则标记为股票类型
        const isStock = isStockPlatform || (item.extra?.diff !== undefined);

        // 检查是否是带有star信息的GitHub条目
        const isGitHubStar = isGitHubPlatform && item.extra?.info && typeof item.extra.info === 'string' &&
            (item.extra.info.includes('star') || item.extra.info.includes('★'));

        return {
          id: item.id,
          title: item.title,
          url: item.url,
          mobileUrl: item.mobileUrl,
          pubDate: item.pubDate,
          extra: {
            ...item.extra,
            // 添加热搜排名信息
            rank: isHotSearch ? idx + 1 : undefined,
            // 添加股票类型标记
            isStock: isStock,
            // 添加GitHub Star标记
            isGitHubStar: isGitHubStar
          }
        };
      });
    } else {
      throw new Error(`数据错误: ${newsResult.message || '未知错误'}`)
    }
  } catch (error) {
    console.error(`刷新${platform.label}新闻失败:`, error);
    platform.hasError = true;
    platform.errorMessage = error instanceof Error ? error.message : '请求失败，请稍后重试';
  } finally {
    platform.isLoading = false;
  }
};

onMounted(() => {
  // 迁移旧的布局格式到新的格式（如果需要）
  const migrateOldLayout = () => {
    const oldLayout = localStorage.getItem('news-layout');
    if (oldLayout && !localStorage.getItem('news-layout-preferences')) {
      try {
        const layout = JSON.parse(oldLayout);
        const preferences: NewsLayoutPreferences = {
          pinned: layout.filter((l: any) => l.isPinned).map((l: any) => l.platform),
          favorites: layout.filter((l: any) => l.isFavorite).map((l: any) => l.platform),
          sortOrder: layout.map((l: any) => l.platform),
          sizes: Object.fromEntries(layout.map((l: any) => [l.platform, l.size || '1']))
        };
        localStorage.setItem('news-layout-preferences', JSON.stringify(preferences));
        console.log('已迁移旧布局格式到新格式');
      } catch (e) {
        console.error('迁移旧布局格式失败:', e);
      }
    }
  };

  // 先迁移旧的布局格式
  migrateOldLayout();

  // 然后获取平台数据，并应用布局设置
  fetchPlatforms().then(() => {
    // 确保数据加载完成后，应用保存的布局设置
    if (platformNewsList.value.length > 0) {
      loadLayoutFromStorage();

      // 应用完布局后再次保存，确保新增平台的设置也被保存
      setTimeout(() => {
        saveLayoutToStorage();
      }, 500);
    }
  });
})
</script>

<template>
  <div class="news-container">
    <div class="platforms-grid">
      <!-- 使用过渡组包装每个平台卡片 -->
      <TransitionGroup
          name="platform-transition"
          tag="div"
          class="platforms-transition-wrapper"
      >
        <GlassMorphismPanel
            v-for="platform in platformNewsList"
            :key="platform.platform"
            class="platform-card"
            :class="[
            platform.size ? `size-${platform.size}` : 'size-1',
            {
              'is-dragging': platform.platform === draggedItem,
              'drag-over': platform.platform === dragOverItem,
              'is-pinned': platform.isPinned,
              'is-resizing': isResizing && platform.platform === draggedItem
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
                class="action-button refresh-button"
                @click.stop="refreshPlatform(platform)"
                title="刷新"
            >
              <i class="refresh-icon"></i>
            </button>
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

          <!-- 错误状态 -->
          <div v-else-if="platform.hasError" class="error-state">
            <div class="error-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 4C7.584 4 4 7.584 4 12C4 16.416 7.584 20 12 20C16.416 20 20 16.416 20 12C20 7.584 16.416 4 12 4ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                    fill="currentColor"/>
              </svg>
            </div>
            <div class="error-text">
              <div class="error-title">加载失败</div>
              <div class="error-message">{{ platform.errorMessage || '网络连接问题，请稍后再试' }}</div>
            </div>
            <button class="error-retry-button" @click="refreshPlatform(platform)">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
                    fill="currentColor"/>
              </svg>
              重试
            </button>
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
                <!-- 非热搜条目的图标显示在左侧 -->
                <div v-if="item.extra?.icon && !item.extra?.rank" class="news-icon">
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
                  <!-- 信息标签，对于非股票类型且非GitHub Star显示在上方 -->
                  <div
                      v-if="item.extra?.info && !item.extra?.isStock && !item.extra?.isGitHubStar"
                      class="news-info-wrapper"
                  >
                  <span class="news-info" :class="{ 'with-diff': item.extra.diff !== undefined }">
                    {{ item.extra.info }}
                    <span v-if="item.extra.diff !== undefined" class="diff-tag">
                      {{ item.extra.diff > 0 ? '+' : '' }}{{ item.extra.diff }}
                    </span>
                  </span>
                  </div>
                  <!-- 标题区域 -->
                  <div class="news-title" :class="{
                  'stock-title': item.extra?.isStock,
                  'github-title': item.extra?.isGitHubStar
                }">
                    <!-- 热搜排名标签 -->
                    <span v-if="item.extra?.rank" class="rank-tag"
                          :class="`rank-${item.extra.rank <= 3 ? item.extra.rank : 'normal'}`">
                    {{ item.extra.rank }}
                  </span>

                    <!-- 标题内容 -->
                    <span class="title-text">{{ item.title }}</span>

                    <!-- 热搜且有图标时，图标显示在标题后面 -->
                    <div v-if="item.extra?.rank && item.extra?.icon" class="hotsearch-icon">
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

                    <!-- 股票类型的涨跌幅标签显示在标题右侧 -->
                    <span
                        v-if="item.extra?.isStock && item.extra?.info"
                        class="stock-diff-tag"
                        :class="{ 'stock-up': item.extra.diff > 0, 'stock-down': item.extra.diff < 0 }"
                    >
                    {{ item.extra.info }}
                    <span v-if="item.extra.diff !== undefined" class="diff-value">
                      {{ item.extra.diff > 0 ? '+' : '' }}{{ item.extra.diff }}
                    </span>
                  </span>

                    <!-- GitHub Star标签显示在标题右侧 -->
                    <span
                        v-if="item.extra?.isGitHubStar && item.extra?.info"
                        class="github-star-tag"
                    >
                    {{ item.extra.info }}
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassMorphismPanel>
      </TransitionGroup>
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
  position: relative; // 为过渡动画设置定位上下文
}

.platforms-transition-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr); // 固定为4列布局
  gap: 16px;
  grid-auto-flow: row dense;
  align-items: start;
  width: 100%;
  position: relative;
}

// 平台卡片过渡效果
.platform-transition-move {
  transition: transform 0.5s ease;
}

.platform-transition-enter-active,
.platform-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.platform-transition-enter-from,
.platform-transition-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.platform-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: auto; // 改为自适应高度
  min-height: 400px; // 设置最小高度
  max-height: 800px; // 设置最大高度
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  transform-origin: center center;

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

  &.is-resizing {
    animation: resize-pulse 0.3s ease-in-out;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes resize-pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(0.98);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
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
            justify-content: end;
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
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;

            &.stock-title, &.github-title {
              justify-content: space-between;
              width: 100%;

              .title-text {
                flex: 1;
                min-width: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .hotsearch-icon {
              display: inline-flex;
              margin-left: 4px;

              img {
                width: 14px;
                height: 14px;
                object-fit: contain;
              }
            }

            .stock-diff-tag {
              display: inline-flex;
              align-items: center;
              font-size: 11px;
              padding: 1px 6px;
              border-radius: 4px;
              white-space: nowrap;
              margin-left: auto;
              font-weight: bold;
              background: rgba(255, 255, 255, 0.1);

              &.stock-up {
                color: #f56c6c;
                background: rgba(245, 108, 108, 0.1);
              }

              &.stock-down {
                color: #4caf50;
                background: rgba(76, 175, 80, 0.1);
              }

              .diff-value {
                margin-left: 4px;
                font-family: monospace;
              }
            }

            .github-star-tag {
              display: inline-flex;
              align-items: center;
              font-size: 11px;
              padding: 1px 6px;
              border-radius: 4px;
              white-space: nowrap;
              margin-left: auto;
              font-weight: bold;
              color: #f9a825;
              background: rgba(249, 168, 37, 0.1);
              transition: all 0.3s ease;

              &::before {
                content: '★';
                margin-right: 3px;
              }
            }
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

  // 错误状态样式
  .error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);

    .error-icon {
      width: 48px;
      height: 48px;
      color: rgba(255, 82, 82, 0.8);
      margin-bottom: 16px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .error-text {
      margin-bottom: 20px;

      .error-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .error-message {
        font-size: 14px;
        opacity: 0.8;
        max-width: 280px;
        margin: 0 auto;
      }
    }

    .error-retry-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(3px);

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(1px);
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
  opacity: 0.7;
  transition: opacity 0.2s ease;
  justify-content: end;
  margin-bottom: 16px;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  backdrop-filter: blur(3px);
  transform: translateZ(0); /* 启用硬件加速 */

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }

  &.active {
    color: #007BFF;
    border-color: #007BFF;
    background: rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

// 添加刷新图标样式
.refresh-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z' /%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

// 热搜排名标签样式
.rank-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  font-size: 11px;
  border-radius: 4px;
  margin-right: 6px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);

  // 不同排名的样式
  &.rank-1 {
    background: rgba(255, 0, 0, 0.7);
    color: white;
  }

  &.rank-2 {
    background: rgba(255, 165, 0, 0.7);
    color: white;
  }

  &.rank-3 {
    background: rgba(255, 215, 0, 0.7);
    color: white;
  }

  &.rank-normal {
    // 默认样式
  }
}

@media (max-width: 1200px) {
  .platforms-transition-wrapper {
    grid-template-columns: repeat(3, 1fr); // 3列布局
  }

  .platform-card {
    &.size-4 {
      grid-column: span 3;
    }
  }
}

@media (max-width: 900px) {
  .platforms-transition-wrapper {
    grid-template-columns: repeat(2, 1fr); // 2列布局
  }

  .platform-card {
    &.size-2, &.size-4 {
      grid-column: span 2;
    }
  }
}

@media (max-width: 600px) {
  .platforms-transition-wrapper {
    grid-template-columns: 1fr; // 单列布局
  }

  .platform-card {
    &.size-1, &.size-2, &.size-4 {
      grid-column: span 1;
    }
  }
}
</style>
