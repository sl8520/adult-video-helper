import Vue from 'vue'

import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-TW'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

Vue.use(Element, { locale })

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app')
