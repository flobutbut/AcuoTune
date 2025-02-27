import { createRouter, createWebHistory } from 'vue-router'
import ConfigurateurView from '../views/ConfigurateurView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ConfigurateurView
    }
  ]
})

export default router 