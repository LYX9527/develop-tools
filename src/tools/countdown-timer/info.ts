import type {ToolBaseInfo} from '@/types/tool'
import {ToolTags} from '@/types/tool'
import Icon from './Icon.vue'

export const countdownTimerInfo: ToolBaseInfo = {
  name: '倒计时工具',
  description: '生动可爱的倒计时器，支持生日、纪念日、节假日倒计时及工作摸鱼计算器',
  icon: Icon,
  tags: [ToolTags.UTILITY, '倒计时', '生日', '纪念日', '节假日', '摸鱼', '计算器', '时间'],
  author: 'LYX9527',
  github: 'https://github.com/LYX9527'
}
