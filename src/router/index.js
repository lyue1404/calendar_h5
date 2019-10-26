import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: 'home' },
    { path: '/home', name: 'home', component: (resolve) => require(['@/views/index.vue'], resolve), meta: { keepAlive: true } },
    { path: '/add', name: 'newRemind', component: (resolve) => require(['@/components/remindDetail'], resolve), meta: { keepAlive: false } },
    { path: '/add/:id', name: 'remindDetail', component: (resolve) => require(['@/components/remindDetail'], resolve), meta: { keepAlive: false } }
  ]
})
