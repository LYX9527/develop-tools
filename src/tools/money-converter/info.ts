import type {Tool} from '../index'
import Icon from './Icon.vue'

export const moneyConverterInfo: Tool = {
  icon: Icon,
  name: "人民币大写转换",
  description: "将数字金额转换为人民币大写形式",
  route: "/tools/money-converter",
  category: "converter",
  color: "#10b981",
  tags: ["转换", "金额", "人民币"],
  author: "LYX9527",
  github: "https://github.com/LYX9527"
}
