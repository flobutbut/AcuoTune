import { createRouter, createWebHashHistory } from 'vue-router'
import ConfigurateurView from '../views/ConfigurateurView.vue'

const router = createRouter({
  history: createWebHashHistory('/AcuoTune/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ConfigurateurView
    }
  ]
})

export default router 