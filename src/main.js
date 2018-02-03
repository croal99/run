import Vue from 'vue';
import VueRouter from 'vue-router';
import Routers from './router';
import VueAMap from 'vue-amap';

import Util from './libs/util';
import App from './app.vue';
import store from './store/store'; //状态管理

import wx from "weixin-js-sdk";

import YDUI from 'vue-ydui';
import {
    Confirm,
    Alert,
    Toast,
    Notify,
    Loading
} from 'vue-ydui/dist/lib.rem/dialog';
import 'vue-ydui/dist/ydui.flexible.js';
import 'vue-ydui/dist/ydui.rem.css';

import MintUI from 'mint-ui';
import 'mint-ui/lib/style.css';

Vue.use(VueRouter);
Vue.use(YDUI);
Vue.use(VueAMap);
Vue.use(MintUI);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    // next();return;
    if (to.name != 'wellcome') {
        if (store.state.load_status == 0) { // 判断该路由是否需要登录权限
            next({
                path: '/wellcome',
                query: {
                    redirect: to.fullPath
                } // 将跳转的路由path作为参数，登录成功后跳转到该路由
            })
        } else {
            next();
        }
    } else {
        next();
    }
});

router.afterEach(() => {
    // iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

VueAMap.initAMapApiLoader({
    key: 'cb9f4fa508519e8ecd11f5532bfa9083',
    plugin: ['AMap.Autocomplete', 'AMap.Geolocation', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor']
});

let vm = new Vue({
    el: '#app',
    router: router,
    store,
    render: h => h(App)
});

Vue.prototype.onOpened = () => {
    console.log('on opened', this);
};

Vue.prototype.onMessage = (msg) => {
    console.log('on message', this, msg);
};

Vue.prototype.$dialog = {
    confirm: Confirm,
    alert: Alert,
    toast: Toast,
    notify: Notify,
    loading: Loading,
};

// 微信授权
Vue.prototype.initWeiChat = () => {
    // 从服务器获取游微信配置
    let path = window.location.href.split("#")[0];
    // console.log('initWeiChat', path,vm, this);
    Util.get_package(path).then(sign_package => {
        // console.log("sign_package", sign_package, vm);
        // wx.app = vm;

        // config
        wx.config({
            debug: false,
            appId: sign_package.appId,
            timestamp: sign_package.timestamp,
            nonceStr: sign_package.nonceStr,
            signature: sign_package.signature,
            jsApiList: [
                "checkJsApi",
                "chooseImage",
                "uploadImage",
                "downloadImage",
                "scanQRCode"
            ]
        });

        // 等待配置
        wx.ready(function () {
            wx.checkJsApi({
                jsApiList: [
                    "chooseImage",
                    "uploadImage",
                    "downloadImage",
                    "scanQRCode"
                ],
                success: function (res) {
                    store.state.weixin_status = true;
                    // alert("授权成功");
                }
            });
        });

        wx.error(function (res) {
            alert("微信授权失败");
            // if (this.error_count < 3) {
            //     this.initWeiChat();
            // } else {
            // }
        });
    });
};

