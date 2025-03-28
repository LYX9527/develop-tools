import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import 'cronstrue/locales/zh_CN';
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
