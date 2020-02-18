import Vue from 'vue'
import Router from 'vue-router'
import { ipcRenderer } from 'electron'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: () => import('@/views/pages/landing-page'),
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('@/views/pages/setting'),
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})

ipcRenderer.on('href', (event, arg) => {
  // 不在同一頁才換頁
  if (arg && arg !== router.currentRoute.name) {
    router.push({ name: arg })
  }
})

export default router
