import { createRouter, createWebHashHistory } from 'vue-router'
import ConfigurateurView from '../views/ConfigurateurView.vue'

const base = process.env.NODE_ENV === 'production' ? '/AcuoTune/' : '/'

const router = createRouter({
  history: createWebHashHistory(base),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ConfigurateurView
    }
  ]
})

export default router 