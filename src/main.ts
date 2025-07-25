import {createApp} from 'vue'
import {createPinia} from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 状态管理
const pinia = createPinia()
app.use(pinia)
// 路由
app.use(router)

app.mount('#app')
