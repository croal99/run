/**
 * Created by zzmhot on 2017/3/23.
 *
 * 路由Map
 *
 * @author: zzmhot
 * @github: https://github.com/zzmhot
 * @email: zzmhot@163.com
 * @Date: 2017/3/23 18:30
 * @Copyright(©) 2017 by zzmhot.
 *
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import store from 'store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//import components
//view page warp component
import viewPageComponent from 'pages/App'

//home
import homeComponent from 'pages/home'
//404
import noPageComponent from 'pages/error/404'
//login
import loginComponent from 'pages/user/login'
//setting
import settingComponent from 'pages/user/setting'
//tools
import toolsComponent from 'pages/user/tools'
//rank
import rankComponent from 'pages/user/rank'
// 关卡列表
import checkpointListComponent from 'pages/checkpoint/list'
// 关卡任务安排
import checkpointShowComponent from 'pages/checkpoint/show'
// 关卡任务成功信息
import checkpointSuccessComponent from 'pages/checkpoint/success'
// 关卡任务失败信息
import checkpointDefaultComponent from 'pages/checkpoint/default'

// 题库
import questionShowComponent from 'pages/question/show'

Vue.use(VueRouter)

//使用AMD方式加载
// component: resolve => require(['pages/home'], resolve),
const routes = [{
    path: '/404',
    name: 'notPage',
    component: noPageComponent
  },
  {
    path: '*',
    redirect: '/404'
  },
  {
    path: '/user/login',
    name: 'login',
    component: loginComponent
  },
  {
    path: '/user/setting',
    name: 'setting',
    component: settingComponent
  },
  {
    path: '/user/tools',
    name: 'tools',
    component: toolsComponent
  },
  {
    path: '/user/rank',
    name: 'rank',
    component: rankComponent
  },
  {
    path: '/',
    redirect: '/home',
    component: viewPageComponent,
    children: [{
        path: '/home',
        name: 'home',
        component: homeComponent,
        meta: {
          title: "主页",
          auth: true
        }
      },
      {
        path: '/checkpoint/list',
        name: 'task_list',
        component: checkpointListComponent,
        meta: {
          title: "关卡列表",
          auth: true
        }
      },
      {
        path: '/checkpoint/show',
        name: 'task_show',
        component: checkpointShowComponent,
        meta: {
          title: "关卡信息",
          auth: true
        }
      },
      {
        path: '/checkpoint/show',
        name: 'task_success',
        component: checkpointSuccessComponent,
        meta: {
          title: "关卡成功",
          auth: true
        }
      },
      {
        path: '/checkpoint/show',
        name: 'task_default',
        component: checkpointDefaultComponent,
        meta: {
          title: "关卡失败",
          auth: true
        }
      },
      {
        path: '/question/show',
        name: 'question_show',
        component: questionShowComponent,
        meta: {
          title: "题库信息",
          auth: true
        }
      },
    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'hash', //default: hash ,history
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
})

//全局路由配置
//路由开始之前的操作
router.beforeEach((to, from, next) => {
  NProgress.done().start()
  let toName = to.name
  let is_login = store.state.user_info.status == 0;

  // if (to.name != 'login') {
  //   console.log(store.state, is_login);
  //   if (store.state.load_status == 0) { // 判断该路由是否需要登录权限
  //     next({
  //       path: '/login',
  //     })
  //   } else {
  //     console.log('next')
  //     next();
  //   }
  // } else {
  //   next();
  // }

  if (!is_login && toName !== 'login') {
    next({
      name: 'login'
    })
  } else {
      next()
    // if (is_login && toName === 'login') {
    //   next({
    //     path: '/'
    //   })
    // } else {
    // }
  }
})

//路由完成之后的操作
router.afterEach(route => {
  NProgress.done()
})

export default router
