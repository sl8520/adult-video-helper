import Vue from 'vue'
import Router from 'vue-router'
import { ipcRenderer } from 'electron'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default,
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('@/views/pages/setting/index'),
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})

ipcRenderer.on('href', (event, arg) => {
  if (arg) {
    // 不在同一頁才換頁
    if (arg !== router.currentRoute.name) {
      router.push({ name: arg })
    }
  }
})

export default router
