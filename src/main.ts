import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Pour le débogage
console.log('Initializing app...')

const app = createApp(App)
const pinia = createPinia()

// Pour le débogage
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.log('Component:', instance)
  console.log('Info:', info)
}

app.use(pinia)
app.use(router)

app.mount('#app')

// Pour le débogage
console.log('App mounted') 