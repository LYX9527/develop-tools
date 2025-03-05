<script setup lang="ts">
import {NCard} from "naive-ui"

const code = `
const toolInfo: ToolBaseInfo = {
    name: '颜色工具',
    description: '拾取颜色工具',
    icon: Icon,
    tags: ['颜色', '阴影',"CSS"],
}`
</script>

<template>
  <n-card title="一些补充说明">
    不手动修改color的时候默认会适配夜间白天模式，
    如果想用别的颜色并且适配夜间白天模式，
    你可以使用useAppStore()获取当前应用程序状态比如主题模式，
    或则参考naiveUI使用NEl来使用
  </n-card>
  <MacCodeBlock :code="code" language="css"/>

</template>

<style scoped lang="scss">

</style>
