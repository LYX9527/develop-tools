import type {Tool} from '../index'
import Icon from './Icon.vue'

export const navicatDecryptInfo: Tool = {
  icon: Icon,
  name: "Navicat密码解密",
  description: "解密Navicat存储的数据库连接密码",
  route: "/tools/navicat-decrypt",
  category: "security",
  color: "#f59e0b",
  tags: ["Navicat", "解密"],
  author: "LYX9527",
  github: "https://github.com/LYX9527"
} 