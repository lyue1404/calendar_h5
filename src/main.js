import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import inlineCalendar from '../lib/inlineCalendar.vue'
import './assets/styles/common.css'
import './assets/icons'
import LunarCalendar from '../lib/LunarCalendar.js'
import forbidScrolling from '../lib/forbidScrolling.js'
import { ToastPlugin, ConfirmPlugin } from 'vux'

LunarCalendar()
forbidScrolling()

Vue.config.productionTip = false
Vue.use(ToastPlugin)
Vue.use(ConfirmPlugin)
Vue.use(Vuex)
Vue.component('inlineCalendar', inlineCalendar)

Vue.directive('title', {
  inserted (el, bind) {
    document.title = bind.value
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
