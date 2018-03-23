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
// 高德地图
import VueAMap from 'vue-amap';

import MintUI from 'mint-ui';
import {
  Indicator
} from "mint-ui";
import 'mint-ui/lib/style.css';

//使用自定义插件
Vue.use(Plugins)
Vue.use(api)
Vue.use(MintUI);
Vue.use(VueAMap);

//发布后是否显示提示
Vue.config.productionTip = false

//是否开启工具调试
Vue.config.devtools = process.env.NODE_ENV === 'development'

// 高德地图
VueAMap.initAMapApiLoader({
  key: 'cb9f4fa508519e8ecd11f5532bfa9083',
  plugin: ['AMap.Autocomplete', 'AMap.Geolocation', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor']
});

new Vue({
  router,
  store,
  ...App
}).$mount('mainbody')
