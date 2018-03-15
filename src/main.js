/**
 * Created by zzmhot on 2017/3/23.
 *
 * 主程序入口
 *
 * @author: zzmhot
 * @github: https://github.com/zzmhot
 * @email: zzmhot@163.com
 * @Date: 2017/3/23 18:19
 * @Copyright(©) 2017 by zzmhot.
 *
 */

//导入样式
import 'normalize.css'
import 'font-awesome/scss/font-awesome.scss'
// import 'element-ui/lib/theme-default/index.css'

//导入Vue框架
import Vue from 'vue'
//导入组件
import router from './router'
//导入状态管理器
import store from 'store'
//导入请求框架
import api from './api'
//导入自定义插件
import Plugins from 'plugins'
//导入主视图文件
import App from './App'

import MintUI from 'mint-ui';
import {
  Indicator
} from "mint-ui";
import 'mint-ui/lib/style.css';

//使用自定义插件
Vue.use(Plugins)
Vue.use(api)
Vue.use(MintUI);

//发布后是否显示提示
Vue.config.productionTip = false

//是否开启工具调试
Vue.config.devtools = process.env.NODE_ENV === 'development'

new Vue({
  router,
  store,
  ...App
}).$mount('mainbody')


Vue.prototype.beginWait = () => {
    console.log('on opened', this);
};
