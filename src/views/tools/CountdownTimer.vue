<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {gsap} from 'gsap'
import lunisolar from 'lunisolar'
import zhCn from 'lunisolar/locale/zh-cn'
import festivals from 'lunisolar/markers/festivals.zh-cn'
import {theGods} from '@lunisolar/plugin-thegods'
import Tab from '@/components/ui/tabs/Tab.vue'
import TabItem from '@/components/ui/tabs/TabItem.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import NumberCounter from '@/components/ui/NumberCounter.vue'
import {useToast} from '@/composables/useToast'

lunisolar.Markers.add(festivals)
lunisolar.extend(theGods)
lunisolar.locale(zhCn)
// 全局加载节日列表
const toast = useToast()

// 当前时间
const currentTime = ref(new Date())
let timeInterval: NodeJS.Timeout | null = null

// Tab控制
const activeTab = ref('lunar')

// 工作设置面板控制
const showWorkSettings = ref(false)

// ==================== 农历信息功能 ====================
// 获取宜做的事情（预留函数）
const getSuitableActivities = (lunarDate: any) => {
  try {
    return lunarDate.theGods.getActs(0).good
  } catch (e) {
    return ['数据加载中...']
  }
}

// 获取忌做的事情（预留函数）
const getTabooActivities = (lunarDate: any) => {
  try {
    return lunarDate.theGods.getActs(0).bad
  } catch (e) {
    return ['数据加载中...']
  }
}

// 获取今日农历信息
const getTodayLunarInfo = () => {
  try {
    const today = lunisolar()

    return {
      // 农历日期
      lunarYear: `${today.lunar.year}年`, // 农历年份
      lunarMonth: today.lunar.getMonthName(), // 八月
      lunarDay: today.lunar.getDayName(), // 初一

      // 公历信息
      solarDate: today.format('YYYY年MM月DD日'),
      weekDay: today.format('dddd'),

      // 节气信息
      solarTerm: today.solarTerm?.name || '',

      // 宜忌信息
      suitable: getSuitableActivities(today), // 宜
      taboo: getTabooActivities(today), // 忌

      // 生肖
      zodiac: today.format("cZ") || '未知', // 生肖

      // 天干地支
      ganzhi: {
        year: today.char8.year?.toString() || '',
        month: today.char8.month?.toString() || '',
        day: today.char8.day?.toString() || ''
      }
    }
  } catch (e) {
    console.error('Failed to get lunar info:', e)
    return {
      lunarYear: '未知年',
      lunarMonth: '未知月',
      lunarDay: '未知日',
      solarDate: new Date().toLocaleDateString('zh-CN'),
      weekDay: '未知',
      solarTerm: '',
      suitable: [],
      taboo: [],
      zodiac: '未知',
      ganzhi: {year: '', month: '', day: ''}
    }
  }
}

// 获取最近节假日倒计时
const getNextHoliday = () => {
  const currentYear = new Date().getFullYear()
  const allHolidays = [...getHolidays(currentYear), ...getHolidays(currentYear + 1)]

  const today = new Date()
  const upcomingHolidays = allHolidays
      .map(holiday => {
        const [month, day] = holiday.date.split('-')
        const year = currentYear
        const holidayDate = new Date(`${year}-${month}-${day}`)

        if (holidayDate < today) {
          // 如果是今年已过的节假日，使用明年的日期
          holidayDate.setFullYear(currentYear + 1)
        }

        return {
          ...holiday,
          fullDate: holidayDate,
          countdown: calculateCountdown(holidayDate)
        }
      })
      .filter(holiday => !holiday.countdown.expired)
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  return upcomingHolidays[0] || null
}

// 响应式农历信息
const todayLunarInfo = computed(() => getTodayLunarInfo())
const nextHoliday = computed(() => getNextHoliday())

// 操作函数
const refreshLunarInfo = () => {
  // 强制重新计算农历信息
  currentTime.value = new Date()
  toast.success('农历信息已刷新')
}

const viewFullCalendar = () => {
  // 预留函数：查看完整日历
  toast.info('查看日历功能开发中...')
  // TODO: 实现日历弹窗或跳转到日历页面
}

const shareToday = async () => {
  // 预留函数：分享今日农历信息
  const shareText = `今日黄历：${todayLunarInfo.value.lunarMonth}${todayLunarInfo.value.lunarDay} ${todayLunarInfo.value.lunarYear} ${todayLunarInfo.value.zodiac}年`

  try {
    if (navigator.share) {
      await navigator.share({
        title: '今日黄历',
        text: shareText,
        url: window.location.href
      })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
      toast.success('今日农历信息已复制到剪贴板')
    } else {
      toast.info('分享功能暂不支持')
    }
  } catch (e) {
    console.error('Share failed:', e)
    toast.error('分享失败')
  }
}

// ==================== 节假日倒计时功能 ====================
const includeWeekends = ref(false)

// 获取动态节假日数据 - 使用lunisolar内置节日
const getHolidays = (year: number) => {
  const holidaysList = [] as any[]

  try {
    // 遍历一年中的每一天，获取节日信息
    for (let month = 1; month <= 12; month++) {
      // 获取每月的天数
      const daysInMonth = new Date(year, month, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        try {
          // 创建当天的lunisolar日期对象
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const lunarDate = lunisolar(dateStr)
          const markersList = lunarDate.markers.list.filter(
              marker => marker.tag.includes("traditional") || marker.tag.includes("cn")
          );
          if (markersList.length > 0) {
            holidaysList.push({
              name: markersList[0].name,
              date: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
              type: markersList[0].tag.includes("traditional") ? 'traditional' : 'legal',
              fullDate: new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
              description: `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
              countdown: calculateCountdown(new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`))
            })
          }
        } catch (e) {
          // 忽略无效日期，继续下一天
          continue
        }
      }
    }

    // 如果没有获取到节日数据，添加基础节日作为备用
    if (holidaysList.length === 0) {
      console.warn('No festivals found from lunisolar, adding fallback festivals')
    } else {
      console.log(`Found ${holidaysList.length} festivals for year ${year}:`, holidaysList.slice(0, 5))
    }

  } catch (e) {
    console.error('Failed to get festivals from lunisolar:', e)
  }

  return holidaysList
}


// 获取周末日期 - 修改为周六日算一个节日
const getWeekends = (year: number) => {
  const weekends = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year + 1, 11, 31)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 6) { // 只在周六时添加，代表周六日这个节日
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')

      // 计算周日的日期
      const sunday = new Date(d)
      sunday.setDate(d.getDate() + 1)
      const sundayMonth = String(sunday.getMonth() + 1).padStart(2, '0')
      const sundayDay = String(sunday.getDate()).padStart(2, '0')

      weekends.push({
        name: '周末',
        date: `${month}-${day}`, // 以周六为起始
        endDate: `${sundayMonth}-${sundayDay}`, // 周日结束
        type: 'weekend',
        fullDate: new Date(d), // 倒计时以周六开始
        description: `${month}/${day} - ${sundayMonth}/${sundayDay}`
      })
    }
  }
  return weekends
}

// 获取最近的12个节假日
const upcomingHolidays = computed(() => {
  const today = new Date()
  const currentYear = today.getFullYear()

  const allHolidays = []

  // 获取今年和明年的节假日
  const currentYearHolidays = getHolidays(currentYear)
  const nextYearHolidays = getHolidays(currentYear + 1)

  // 处理今年的节假日
  for (const holiday of currentYearHolidays) {
    const [month, day] = holiday.date.split('-')
    const holidayDate = new Date(`${currentYear}-${month}-${day}`)

    if (holidayDate >= today) {
      allHolidays.push({
        ...holiday,
        fullDate: holidayDate,
        countdown: calculateCountdown(holidayDate),
        description: `${currentYear}/${month}/${day}`
      })
    }
  }

  // 处理明年的节假日
  for (const holiday of nextYearHolidays) {
    const [month, day] = holiday.date.split('-')
    const holidayDate = new Date(`${currentYear + 1}-${month}-${day}`)

    allHolidays.push({
      ...holiday,
      fullDate: holidayDate,
      countdown: calculateCountdown(holidayDate),
      description: `${currentYear + 1}/${month}/${day}`
    })
  }

  // 如果包含周末，添加接下来的周末
  if (includeWeekends.value) {
    const currentWeekends = getWeekends(currentYear)
    const nextWeekends = getWeekends(currentYear + 1)

    const upcomingWeekends = [...currentWeekends, ...nextWeekends]
        .filter(weekend => weekend.fullDate >= today)
        .slice(0, 15) // 适当增加周末数量
        .map(weekend => ({
          ...weekend,
          countdown: calculateCountdown(weekend.fullDate)
        }))

    allHolidays.push(...upcomingWeekends)
  }

  // 按时间排序并取前12个（增加显示数量）
  return allHolidays
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
      .slice(0, 12)
})

// ==================== 摸鱼统计功能 ====================
interface WorkSettings {
  monthSalary: number
  workStartTime: string
  workEndTime: string
  lunchBreak: number
}

const workSettings = ref<WorkSettings>({
  monthSalary: 8000,
  workStartTime: '09:00',
  workEndTime: '18:00',
  lunchBreak: 60
})

// 从localStorage加载设置
const loadWorkSettings = () => {
  const saved = localStorage.getItem('countdown-work-settings')
  if (saved) {
    try {
      workSettings.value = {...workSettings.value, ...JSON.parse(saved)}
    } catch (e) {
      console.error('Failed to load work settings:', e)
    }
  }
}

// 保存设置到localStorage
const saveWorkSettings = () => {
  localStorage.setItem('countdown-work-settings', JSON.stringify(workSettings.value))
  showWorkSettings.value = false
  toast.success('工作设置已保存')
}

// 计算工作统计
const workStats = computed(() => {
  const now = currentTime.value
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [startHour, startMinute] = workSettings.value.workStartTime.split(':').map(Number)
  const [endHour, endMinute] = workSettings.value.workEndTime.split(':').map(Number)

  const workStart = new Date(today.getTime() + startHour * 60 * 60 * 1000 + startMinute * 60 * 1000)
  const workEnd = new Date(today.getTime() + endHour * 60 * 60 * 1000 + endMinute * 60 * 1000)

  // 计算总工作时间（分钟）
  const totalWorkMinutes = (workEnd.getTime() - workStart.getTime()) / (1000 * 60) - workSettings.value.lunchBreak

  // 计算已工作时间
  let workedMinutes = 0
  if (now >= workStart && now <= workEnd) {
    workedMinutes = Math.max(0, (now.getTime() - workStart.getTime()) / (1000 * 60) - workSettings.value.lunchBreak)
  } else if (now > workEnd) {
    workedMinutes = totalWorkMinutes
  }

  // 计算每分钟薪资
  const workDaysPerMonth = 22 // 平均每月工作日
  const minuteSalary = workSettings.value.monthSalary / (workDaysPerMonth * totalWorkMinutes)

  // 计算今日已赚金额
  const earnedToday = workedMinutes * minuteSalary

  // 计算剩余工作时间（精确到秒）
  const remainingTotalSeconds = Math.max(0, (totalWorkMinutes - workedMinutes) * 60)
  const remainingHours = Math.floor(remainingTotalSeconds / 3600)
  const remainingMins = Math.floor((remainingTotalSeconds % 3600) / 60)
  const remainingSecs = Math.floor(remainingTotalSeconds % 60)

  return {
    totalWorkMinutes,
    workedMinutes,
    earnedToday,
    minuteSalary,
    remainingHours,
    remainingMins,
    remainingSecs,
    workProgress: Math.min((workedMinutes / totalWorkMinutes) * 100, 100)
  }
})

// ==================== 自定义倒计时功能 ====================
interface CustomCountdown {
  id: string
  title: string
  description: string
  targetDate: string
  emoji: string
}

const customCountdowns = ref<CustomCountdown[]>([])
const newCountdown = ref({
  title: '',
  description: '',
  targetDate: '',
  emoji: '🎯'
})


const emojiOptions = ['🎯', '🎂', '💝', '🎉', '⭐', '🔥', '💎', '🚀', '🌟', '💫']

// 从localStorage加载自定义倒计时
const loadCustomCountdowns = () => {
  const saved = localStorage.getItem('countdown-custom-list')
  if (saved) {
    try {
      customCountdowns.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load custom countdowns:', e)
    }
  }
}

// 保存自定义倒计时到localStorage
const saveCustomCountdowns = () => {
  localStorage.setItem('countdown-custom-list', JSON.stringify(customCountdowns.value))
}

// 添加自定义倒计时
const addCustomCountdown = () => {
  if (!newCountdown.value.title || !newCountdown.value.targetDate) {
    toast.error('请填写标题和目标时间')
    return
  }

  const countdown: CustomCountdown = {
    id: Date.now().toString(),
    ...newCountdown.value
  }

  customCountdowns.value.push(countdown)
  saveCustomCountdowns()

  // 重置表单
  newCountdown.value = {
    title: '',
    description: '',
    targetDate: '',
    emoji: '🎯'
  }

  toast.success('倒计时已添加')
}

// 删除自定义倒计时
const removeCustomCountdown = (id: string) => {
  customCountdowns.value = customCountdowns.value.filter(item => item.id !== id)
  saveCustomCountdowns()
  toast.success('倒计时已删除')
}

// 计算自定义倒计时
const getCustomCountdown = (targetDate: string) => {
  const target = new Date(targetDate)
  return calculateCountdown(target)
}

// ==================== 通用功能 ====================
// 更新当前时间
const updateCurrentTime = () => {
  currentTime.value = new Date()
}

// 计算倒计时
const calculateCountdown = (targetDate: Date) => {
  const now = currentTime.value.getTime()
  const target = targetDate.getTime()
  const diff = target - now

  if (diff <= 0) {
    return {days: 0, hours: 0, minutes: 0, seconds: 0, expired: true}
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {days, hours, minutes, seconds, expired: false}
}

onMounted(() => {
  // 启动计时器
  timeInterval = setInterval(updateCurrentTime, 1000)

  // 加载保存的设置
  loadWorkSettings()
  loadCustomCountdowns()

  // 入场动画
  gsap.fromTo('.tool-container',
      {opacity: 0, y: 30},
      {opacity: 1, y: 0, duration: 0.8, ease: "power3.out"}
  )
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="tool-container min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          倒计时工具
        </h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg">
          简约实用的倒计时器，支持节假日、工作统计和自定义倒计时
        </p>
      </div>

      <!-- Tab容器 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <Tab v-model="activeTab" :animated="true" variant="underline">
            <!-- 农历信息 -->
            <TabItem id="lunar" label="今日黄历">
              <div class="p-6 min-h-[600px]">
                <!-- 主要信息卡片 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <!-- 农历日期卡片 -->
                  <div
                      class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center">
                    <div class="mb-6">
                      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {{ todayLunarInfo.lunarMonth }}&nbsp;&nbsp;{{ todayLunarInfo.lunarDay }}
                      </h2>
                      <p class="text-lg text-gray-600 dark:text-gray-300">
                        {{ todayLunarInfo.lunarYear }} {{ todayLunarInfo.ganzhi.year }} {{ todayLunarInfo.zodiac }}年
                      </p>
                    </div>

                    <div class="space-y-3">
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500 dark:text-gray-400">公历</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ todayLunarInfo.solarDate }} {{ todayLunarInfo.weekDay }}
                          </span>
                      </div>

                      <div v-if="todayLunarInfo.solarTerm" class="flex justify-between items-center">
                        <span class="text-sm text-gray-500 dark:text-gray-400">节气</span>
                        <span class="text-sm font-medium text-green-600 dark:text-green-400">
                            {{ todayLunarInfo.solarTerm }}
                          </span>
                      </div>

                      <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500 dark:text-gray-400">干支</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            {{ todayLunarInfo.ganzhi.year }} {{
                            todayLunarInfo.ganzhi.month
                          }} {{ todayLunarInfo.ganzhi.day }}
                          </span>
                      </div>
                    </div>
                  </div>

                  <!-- 宜忌信息卡片 -->
                  <div
                      class="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">今日宜忌</h3>

                    <!-- 宜忌内容 -->
                    <div class="space-y-6">
                      <div>
                        <div class="flex items-center mb-3">
                          <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span class="text-sm font-medium text-green-700 dark:text-green-400">宜</span>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          <div class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div class="flex flex-wrap gap-2">
                                 <span
                                     v-for="item in todayLunarInfo.suitable"
                                     :key="item"
                                     class="inline-block bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs"
                                 >
                                   {{ item }}
                                 </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center mb-3">
                          <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span class="text-sm font-medium text-red-700 dark:text-red-400">忌</span>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          <div class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div class="flex flex-wrap gap-2">
                                 <span
                                     v-for="item in todayLunarInfo.taboo"
                                     :key="item"
                                     class="inline-block bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs"
                                 >
                                   {{ item }}
                                 </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 节假日倒计时卡片 -->
                <div v-if="nextHoliday"
                     class="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
                  <div class="text-center mb-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">下个节假日</h3>
                    <p class="text-lg text-purple-600 dark:text-purple-400 font-medium">
                      {{ nextHoliday.name }}
                    </p>
                  </div>

                  <div class="flex justify-center items-center">
                    <div class="text-center">
                      <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {{ nextHoliday.countdown.days }}
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">天后</p>
                    </div>
                  </div>

                  <div class="mt-6 text-center">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{
                        nextHoliday.fullDate?.toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })
                      }}
                    </p>
                  </div>
                </div>

                <!-- 操作按钮区域 -->
                <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                      class="w-full"
                      variant="ghost"
                      @click="refreshLunarInfo"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    刷新信息
                  </Button>

                  <Button
                      class="w-full"
                      variant="ghost"
                      @click="viewFullCalendar"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    查看日历
                  </Button>

                  <Button
                      class="w-full"
                      variant="ghost"
                      @click="shareToday"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    分享今日
                  </Button>
                </div>
              </div>
            </TabItem>

            <!-- 节假日倒计时 -->
            <TabItem id="holidays" label="节假日倒计时">
              <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-[600px]">
                <!-- 设置选项 -->
                <div class="mb-6 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <Checkbox
                        v-model="includeWeekends"
                        label="包含周六日休息日"
                    />
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    显示最近12个节假日倒计时
                  </div>
                </div>

                <!-- 节假日列表 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div
                      v-for="(holiday, index) in upcomingHolidays"
                      :key="index"
                      :class="{
                      'border-l-4 border-l-blue-500': holiday.type === 'legal',
                      'border-l-4 border-l-red-500': holiday.type === 'traditional',
                      'border-l-4 border-l-purple-500': holiday.type === 'weekend'
                    }"
                      class="holiday-card-simple bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200"
                  >
                    <div class="text-center">
                      <!-- 节日图标 -->
                      <div class="text-xl mb-2">
                        {{ holiday.type === 'legal' ? '🏛️' : holiday.type === 'weekend' ? '🏖️' : '🏮' }}
                      </div>

                      <!-- 节日名称 -->
                      <h3 class="text-base font-semibold mb-1 text-gray-900 dark:text-white">
                        {{ holiday.name }}
                      </h3>

                      <!-- 日期 -->
                      <div class="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">
                        {{ holiday.description }}
                      </div>

                      <!-- 倒计时显示 -->
                      <div v-if="!holiday.countdown.expired" class="mt-4">
                        <div class="flex justify-center items-center space-x-6">
                          <div class="flex flex-col items-center">
                            <div
                                class="text-xl font-bold text-gray-900 dark:text-white font-mono min-w-[3ch] text-center">
                              {{ String(holiday.countdown.days).padStart(3, '0') }}
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">天</span>
                          </div>
                          <div class="flex flex-col items-center">
                            <div
                                class="text-xl font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                              {{ String(holiday.countdown.hours).padStart(2, '0') }}
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">时</span>
                          </div>
                          <div class="flex flex-col items-center">
                            <div
                                class="text-xl font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                              {{ String(holiday.countdown.minutes).padStart(2, '0') }}
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">分</span>
                          </div>
                          <div class="flex flex-col items-center">
                            <div
                                class="text-xl font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                              {{ String(holiday.countdown.seconds).padStart(2, '0') }}
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">秒</span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-600 dark:text-gray-300">
                        🎊 节日快乐！
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div v-if="upcomingHolidays.length === 0" class="text-center py-16">
                  <div class="text-4xl mb-4">📅</div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    暂无节假日信息
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    请检查设置或稍后再试
                  </p>
                </div>
              </div>
            </TabItem>

            <!-- 工作统计 -->
            <TabItem id="fishing" label="工作统计">
              <div class="relative min-h-[500px] flex items-center justify-center">
                <!-- 设置按钮 -->
                <button
                    class="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    @click="showWorkSettings = !showWorkSettings"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"></path>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"
                          stroke-width="2"></path>
                  </svg>
                </button>

                <!-- 工作统计主体 -->
                <div class="w-full max-w-5xl mx-auto">
                  <div class="text-center mb-10">
                    <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-3">今日工作统计</h2>
                    <p class="text-gray-600 dark:text-gray-400 text-lg">实时跟踪您的工作时间和收入</p>
                  </div>

                  <!-- 统计卡片网格 -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <!-- 今日已赚 -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">今日已赚</h3>
                        <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="text-2xl font-bold text-gray-900 dark:text-white">
                        <NumberCounter
                            :duration="800"
                            :value="workStats.earnedToday"
                            currency="¥"
                            custom-class="earnings-counter-simple"
                        />
                      </div>
                    </div>

                    <!-- 每分钟薪资 -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">每分钟薪资</h3>
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="text-2xl font-bold text-gray-900 dark:text-white">
                        <NumberCounter
                            :duration="600"
                            :value="workStats.minuteSalary"
                            currency="¥"
                            custom-class="earnings-counter-simple"
                        />
                      </div>
                    </div>

                    <!-- 工作进度 -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">工作进度</h3>
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        <NumberCounter
                            :decimals="1"
                            :duration="600"
                            :value="workStats.workProgress"
                            custom-class="earnings-counter-simple"
                        />
                        %
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            :style="{ width: `${Math.min(workStats.workProgress, 100)}%` }"
                            class="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        ></div>
                      </div>
                    </div>

                    <!-- 剩余时间 -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">剩余工作时间</h3>
                        <div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                          <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="flex items-center justify-center gap-1">
                        <div class="text-center">
                          <div class="text-lg font-bold text-gray-900 dark:text-white font-mono">
                            {{ String(workStats.remainingHours).padStart(2, '0') }}
                          </div>
                          <span class="text-xs text-gray-500 dark:text-gray-400">时</span>
                        </div>
                        <div class="text-gray-400">:</div>
                        <div class="text-center">
                          <div class="text-lg font-bold text-gray-900 dark:text-white font-mono">
                            {{ String(workStats.remainingMins).padStart(2, '0') }}
                          </div>
                          <span class="text-xs text-gray-500 dark:text-gray-400">分</span>
                        </div>
                        <div class="text-gray-400">:</div>
                        <div class="text-center">
                          <div class="text-lg font-bold text-gray-900 dark:text-white font-mono">
                            {{ String(workStats.remainingSecs).padStart(2, '0') }}
                          </div>
                          <span class="text-xs text-gray-500 dark:text-gray-400">秒</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 设置面板（侧边栏） -->
                <div
                    v-show="showWorkSettings"
                    class="fixed inset-0 bg-black/50 z-50"
                    @click="showWorkSettings = false"
                >
                  <div
                      class="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300"
                      @click.stop
                  >
                    <div class="p-6">
                      <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">工作设置</h3>
                        <button
                            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            @click="showWorkSettings = false"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"
                                  stroke-width="2"></path>
                          </svg>
                        </button>
                      </div>

                      <div class="space-y-4">
                        <Input
                            v-model.number="workSettings.monthSalary"
                            label="月薪 (元)"
                            placeholder="输入月薪..."
                            type="number"
                        />

                        <div class="grid grid-cols-2 gap-4">
                          <Input
                              v-model="workSettings.workStartTime"
                              label="上班时间"
                              type="time"
                          />
                          <Input
                              v-model="workSettings.workEndTime"
                              label="下班时间"
                              type="time"
                          />
                        </div>

                        <Input
                            v-model.number="workSettings.lunchBreak"
                            label="午休时间 (分钟)"
                            placeholder="输入午休时间..."
                            type="number"
                        />

                        <Button
                            class="w-full"
                            variant="primary"
                            @click="saveWorkSettings"
                        >
                          保存设置
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabItem>

            <!-- 自定义倒计时 -->
            <TabItem id="custom" label="自定义倒计时">
              <div class="space-y-6">
                <!-- 添加新倒计时 -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"></path>
                    </svg>
                    添加新倒计时
                  </h3>

                  <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <Input
                        v-model="newCountdown.title"
                        label="倒计时标题"
                        placeholder="输入标题..."
                    />
                    <Input
                        v-model="newCountdown.targetDate"
                        label="目标时间"
                        type="datetime-local"
                    />
                  </div>

                  <div class="mb-4">
                    <Input
                        v-model="newCountdown.description"
                        label="描述 (可选)"
                        placeholder="输入描述..."
                    />
                  </div>

                  <!-- 表情选择 -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      选择表情
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <button
                          v-for="emoji in emojiOptions"
                          :key="emoji"
                          :class="{
                        'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-110': newCountdown.emoji === emoji,
                        'border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:scale-105': newCountdown.emoji !== emoji
                      }"
                          class="emoji-selector w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all duration-200"
                          @click="newCountdown.emoji = emoji"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>

                  <Button
                      class="w-full"
                      variant="primary"
                      @click="addCustomCountdown"
                  >
                    ✨ 添加倒计时
                  </Button>
                </div>

                <!-- 自定义倒计时列表 -->
                <div v-if="customCountdowns.length > 0">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          stroke-linecap="round" stroke-linejoin="round"
                          stroke-width="2"></path>
                    </svg>
                    我的倒计时
                  </h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div
                        v-for="countdown in customCountdowns"
                        :key="countdown.id"
                        class="custom-countdown-card bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 transition-all duration-200 relative group"
                    >
                      <!-- 删除按钮 -->
                      <button
                          class="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-600 dark:text-red-400"
                          title="删除倒计时"
                          @click="removeCustomCountdown(countdown.id)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"></path>
                        </svg>
                      </button>

                      <div class="text-center">
                        <!-- 倒计时图标 -->
                        <div class="text-xl mb-2">{{ countdown.emoji }}</div>

                        <!-- 倒计时名称 -->
                        <h4 class="text-base font-semibold mb-1 text-gray-900 dark:text-white">
                          {{ countdown.title }}
                        </h4>

                        <!-- 描述 -->
                        <div v-if="countdown.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {{ countdown.description }}
                        </div>

                        <!-- 倒计时显示 -->
                        <div v-if="!getCustomCountdown(countdown.targetDate).expired" class="mt-4">
                          <div class="flex justify-center items-center space-x-4">
                            <div class="flex flex-col items-center">
                              <div
                                  class="text-lg font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                                {{ String(getCustomCountdown(countdown.targetDate).days).padStart(2, '0') }}
                              </div>
                              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">天</span>
                            </div>
                            <div class="flex flex-col items-center">
                              <div
                                  class="text-lg font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                                {{ String(getCustomCountdown(countdown.targetDate).hours).padStart(2, '0') }}
                              </div>
                              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">时</span>
                            </div>
                            <div class="flex flex-col items-center">
                              <div
                                  class="text-lg font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                                {{ String(getCustomCountdown(countdown.targetDate).minutes).padStart(2, '0') }}
                              </div>
                              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">分</span>
                            </div>
                            <div class="flex flex-col items-center">
                              <div
                                  class="text-lg font-bold text-gray-900 dark:text-white font-mono min-w-[2ch] text-center">
                                {{ String(getCustomCountdown(countdown.targetDate).seconds).padStart(2, '0') }}
                              </div>
                              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">秒</span>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-sm text-gray-600 dark:text-gray-300 mt-4">
                          🎉 时间到了！
                        </div>

                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-3">
                          {{ new Date(countdown.targetDate).toLocaleString() }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="text-center py-12">
                  <div class="text-6xl mb-4">
                    ⏰
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    还没有自定义倒计时
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    创建你的第一个倒计时，记录重要时刻
                  </p>
                </div>
              </div>
            </TabItem>
          </Tab>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          使用说明
        </h3>
        <div class="grid md:grid-cols-4 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">📜 今日黄历</h4>
            <ul class="space-y-2">
              <li>• 显示农历日期和干支纪年</li>
              <li>• 实时更新宜忌信息</li>
              <li>• 展示节气和生肖信息</li>
              <li>• 支持分享和刷新功能</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">📅 节假日倒计时</h4>
            <ul class="space-y-2">
              <li>• 使用lunisolar官方节日数据</li>
              <li>• 自动计算农历节日的公历日期</li>
              <li>• 区分法定节假日和传统节日</li>
              <li>• 可选择包含周末休息日</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">💼 工作统计</h4>
            <ul class="space-y-2">
              <li>• 实时计算今日工作收入</li>
              <li>• 精确到秒的剩余时间</li>
              <li>• 右上角齿轮快速设置</li>
              <li>• 核心数据一目了然</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">⏰ 自定义倒计时</h4>
            <ul class="space-y-2">
              <li>• 创建个人重要时刻倒计时</li>
              <li>• 自定义表情图标</li>
              <li>• 支持添加描述信息</li>
              <li>• 简洁的卡片设计</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* 节假日卡片简约风格 */
.holiday-card-simple {
  cursor: pointer;
  transition: all 0.2s ease;
}

.holiday-card-simple:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

/* 自定义倒计时卡片hover效果 */
.custom-countdown-card {
  cursor: pointer;
  transform: translateY(0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.custom-countdown-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
}


/* 表情选择器动画 */
.emoji-selector {
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.emoji-selector:hover {
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}


/* 进度条动画 */
.progress-bar {
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 金额计数器样式 */
:deep(.earnings-counter) {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 简约金额计数器样式 */
:deep(.earnings-counter-simple) {
  color: inherit;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
}


</style>
