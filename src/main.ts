import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import ToastContainer from './components/ui/toast/ToastContainer.vue'

const app = createApp(App);

// Add ToastContainer to the app
app.component('ToastContainer', ToastContainer);

app.mount('#app')
