<template>
  <div class="container">
     <header v-if="$store.state.load_status == 2">
         <div class="top-bar">
             <div class="my-score">
                 我的分数:{{$store.state.record.mark}}
                 <!-- <ul class="star-list">
                     <li v-for="n in state.record.mark" :key="n.id">
                         <img src="/dist/images/star.png">
                     </li>
                 </ul> -->
             </div>
             <div class="nav-clock">
                 <span class="nav-clock-icon"></span>{{hours}}:{{minutes}}
             </div>
             <div class="navbar-right">
                <a href="javascript:;" class="navbar-btn" @click="areaClick">
                </a>
             </div>

         </div>
     </header>
     <router-view></router-view>
     <div class="page-bottom"  v-if="$store.state.load_status == 2">
         <div class="navbar">
             <ul>
                 <li class="navbar-item" v-for="(item,index) in navlist" :key="item.id">
                     <a  @click="itemClick(item,index)"  href="javascript:;">
                         <img :src="item.url">
                     </a>
                 </li>
             </ul>
         </div>
     </div>
  </div>
</template>
<script>
import Config from "./config/config";
import Util from "./libs/util";
import Env from "./config/env";
import "./style/animate.css";
export default {
  data() {
    return {
      navlist: [
        {
          id: 1,
          text: "任务",
          url: "/dist/images/btn1.png",
          name: "tasklist"
        },
        {
          id: 2,
          text: "地图",
          url: "/dist/images/btn4.png",
          name: "map"
        },
        {
          id: 3,
          text: "排行榜",
          url: "/dist/images/btn2.png",
          name: "rank"
        },
        {
          id: 4,
          text: "设置",
          url: "/dist/images/btn3.png",
          name: "setting"
        }
      ],
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  },
  mounted() {
    // this.load_status = this.$store.state.load_status;
    this.initGame("zjh");
  },
  beforeDestroy() {},
  methods: {
    areaClick() {
      this.$router.push({ name: "areamap" });
    },
    itemClick(item) {
      this.$router.push({ name: item.name });
    },
    initWebSocket() {
      console.log("initWebSocket");
      this.$store.state.ws = new WebSocket("wss://api.51fengxun.cn:7273/");
      this.$store.state.ws.onopen = this.onOpened;
      this.$store.state.ws.onmessage = this.onMessage;
      this.$store.state.ws.onclose = this.onClose;
      this.$store.state.ws.onerror = this.onError;
    },
    onOpened() {
      // console.log("on opened", this);
      // 登录
      var send_data = {
        type: "login",
        user_id: this.$store.state.userinfo.openid,
        game_id: this.$store.state.userinfo.game_code,
        client: "fengxun",
        client_type: "game"
      };

      var send_json = JSON.stringify(send_data);
      // console.log("on open", send_json);
      this.$store.state.ws.send(send_json);
      this.reportInfo();
    },

    onClose() {
      // console.log("on close", this);
      setTimeout(this.initWebSocket, 3000);
    },

    onError() {
      // console.log("on error", this);
    },

    onMessage(msg) {
      console.log("on mesage", msg, msg.data);
      let data = JSON.parse(msg.data);
      switch (data.type) {
        case "ping":
          // 心跳
          break;
        case "multi_shake":
          // 多人摇一摇
          this.$store.commit("set_multi_shake");
          break;

        default:
          console.log("unknown message");
          break;
      }
    },

    initGame(code) {
      console.log("initGame");
      // 从服务器获取用户信息
      Util.get_userinfo().then(userinfo => {
        // 用户微信信息
        if (userinfo.openid == undefined) {
          // 没有用户数据，跳转到微信登录
          let url = Config.url + "api3/login?code=" + code;
          // console.log("not login", url);
          window.location.href = url;
          return;
        }
        // alert('login ok');
        this.$store.state.userinfo = userinfo;

        // 启动位置查询
        this.getLocation_h5();
        // alert('getLocation_h5 ok');

        // 微信认证
        this.initWeiChat();
        // alert('initWeiChat ok');

        // 从服务器获取游戏配置
        Util.get_config(code).then(game_config => {
          // console.log(game_config);
          this.$store.state.game_config = game_config;
          // alert('get_config ok');

          // 获取本地记录
          this.$store.commit("get_from_local");
          // alert('get_from_local ok');

          // 启动WebSocket
          this.initWebSocket();
          // this.reportInfo();
          // alert('initWebSocket ok');
        });
      });
    },

    //设置定时器，每3秒刷新一次
    reportInfo() {
      // 计算游戏用时
      let begin_time = this.$store.state.record.begin_time;
      let end_time = new Date();
      let date3 = end_time - begin_time; // 时间差的毫秒数

      var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      var hours = Math.floor(leave1 / (3600 * 1000));

      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      var minutes = Math.floor(leave2 / (60 * 1000));

      //计算相差秒数
      var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      var seconds = Math.round(leave3 / 1000);

      this.hours = hours;
      this.minutes = minutes;
      this.seconds = seconds;

      // 完全加载后才报告位置坐标
      if (this.$store.state.load_status == 2) {
        this.$store.commit("set_coords_remote");
      }

      // 继续检查状态
      setTimeout(this.reportInfo, 3000);
    },

    // GPS定位
    getLocation_h5() {
      // console.log("getLocation_h5");
      if (navigator.geolocation) {
        var geo_options = {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        };

        // 启动位置采集
        if (Env === "development") {
          navigator.geolocation.getCurrentPosition(
            this.onLocationComplete,
            this.onLocationError,
            geo_options
          );
        } else {
          navigator.geolocation.watchPosition(
            this.onLocationComplete,
            this.onLocationError,
            geo_options
          );
        }
      } else {
        console.log("Browser does not support Geolocation");
      }
    },

    // 定位失败
    onLocationError(error) {
      switch (error.code) {
        case error.TIMEOUT:
          console.log("onLocationError:TIMEOUT");
          //   alert("onLocationError:TIMEOUT");
          break;
        case error.PERMISSION_DENIED:
          console.log("onLocationError:PERMISSION_DENIED");
          //   alert("onLocationError:PERMISSION_DENIED");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("onLocationError:POSITION_UNAVAILABLE");
          //   alert("onLocationError:POSITION_UNAVAILABLE");
          break;
      }

      // save debug postion
      let coords = {
        lng: 104.140018,
        lat: 30.604139,
        acc: 50
      };
      this.$store.commit("set_coords", coords);
    },

    //解析定位结果，将定位数据存储到localStorage并上传一份数据到服务器
    onLocationComplete(position) {
      // 保存当前位置到本地存储
      let coords = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
        acc: position.coords.accuracy
      };
      this.$store.commit("set_coords", coords);
    },

    test1() {
      console.log("test1");
    },

    test3() {
      // alert('set_coords_remote');
      this.$store.commit("set_coords_remote");
      // alert('set_record_remote');
      this.$store.commit("set_record_remote");
    }
  }
};
</script>

<style>
/*清除浏览器默认样式*/
html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}
body {
  line-height: 1;
}
ol,
ul {
  list-style: none;
}
blockquote,
q {
  quotes: none;
}
blockquote:before,
blockquote:after,
q:before,
q:after {
  content: "";
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
#app {
  font: normal 100%;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
h1,
h2 {
  font-weight: normal;
}
h1 {
  font-size: 1.5em;
}
small {
  font-size: 0.875em;
}
ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #000000;
  font-family: "Hiragino Sans GB", "Helvetica Neue";
  text-decoration: none;
}
*,
:after,
:before {
  box-sizing: inherit;
}
.clearfix:after {
  display: block;
  content: "";
  clear: both;
}
.container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}
.pull-left {
  position: absolute;
  left: 0;
  top: 0;
}
.pull-right {
  position: absolute;
  right: 0;
  top: 0;
}
.top-bar {
  height: 77px;
  line-height: 77px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  font-size: 24px;
  background: rgb(244, 90, 105);
  z-index: 4;
}
.star-list {
  margin-left: 4px;
  float: right;
  line-height: 77px;
}
.star-list li {
  margin: 2px;
}
.nav-clock {
  position: absolute;
  left: 366px;
  width: 116px;
  height: 29px;
  line-height: 29px;
  margin: 24px 0;
  color: #fff;
}
.nav-clock-icon {
  display: block;
  float: left;
  width: 29px;
  height: 29px;
  background: url(/dist/images/clock.png) no-repeat;
}
.page-warp {
  position: relative;
  padding: 5px 10px;
  box-sizing: border-box;
  background: rgb(223, 205, 186);
  z-index: 3;
}
.page-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
}
.navbar {
  background: rgb(226, 79, 93);
  height: 100px;
}
.navbar-item {
  margin: 10px 24px;
}
.navbar-item a {
  width: 143px;
  height: 69px;
  display: block;
}
.navbar-right {
  position: absolute;
  right: 45px;
  top: 17px;
}
.navbar-btn {
  display: block;
  width: 159px;
  height: 44px;
  background: url(/dist/images/navbtn.png);
}
.page-head {
  height: 128px;
  position: relative;
  text-align: center;
}
.page-head img {
  width: 300px;
}
.warp-bottom {
  position: absolute;
  bottom: 40px;
  left: 50%;
  margin-left: -250px;
}
.page-contnet-img img {
  height: 100%;
  width: auto;
}
.my-score {
  position: absolute;
  left: 50px;
  color: #fff;
}
.taskpage {
  margin-top: 77px;
  margin-bottom: 100px;
  min-height: 1190px;
}
.page-inner-content {
  width: 652px;
  height: 772px;
  margin: 45px auto 56px auto;
  position: relative;
}
.page-btns-group {
  /* height:320px; */
  width: 554px;
  margin: 0 auto;
}
.page-inner-title {
  padding: 0 40px;
  height: 84px;
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  line-height: 84px;
  font-size: 36px;
  text-align: left;
  color: rgb(237, 160, 12);
  text-shadow: 2px 4px 4px #000;
  font-weight: bold;
  -webkit-text-stroke: 1px #fff;
  overflow: hidden;
}
.page-inner-text {
  position: absolute;
  bottom: 36px;
  height: 190px;
  width: 550px;
  left: 44px;
  padding: 24px 30px;
  font-size: 32px;
  color: #fff;
  text-shadow: 1px 2px 2px #000;
  line-height: 1.3em;
  overflow-y: auto;
}
.text-style {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.page-inner-img {
  position: absolute;
  top: 100px;
  left: 40px;
  right: 40px;
  height: 400px;
}
.page-inner-img img {
  height: 100%;
  width: 100%;
}

/*独立样式*/
img {
  width: 100%;
  vertical-align: middle;
}
.text-center {
  text-align: center;
}
.box-task-info-border,
.panel-border {
  border: 2px solid #b32d3a;
  border-radius: 12px;
}
.box-task-info {
  background: linear-gradient(#e04c59, #f45a69);
  font-size: 17px;
  border: 4px solid #f198a0;
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 16px;
  color: #fff;
}
.box-task-info h2,
.panel-public-gold .panel-heading h2 {
  font-weight: bold;
  -webkit-text-stroke: 2px #fff;
  color: #e04c59;
  text-shadow: 0px 2px 1px #111;
}
.text-center {
  text-align: center;
}
.task-info {
  text-shadow: 0 1px 1px #8c7a7c;
  margin: 10px;
  border-bottom: 1px solid #d1d1d1;
  border-radius: 16px;
  box-shadow: 1px 2px 3px 0px #695066 inset;
  padding: 10px;
  font-size: 2em;
  line-height: 1.5em;
  min-height: 200px;
}
.box-task-info h2,
.panel-public-gold .panel-heading h2 {
  font-weight: bold;
  -webkit-text-stroke: 2px #fff;
  color: #e04c59;
  text-shadow: 0px 2px 1px #111;
  font-size: 2.4em;
  margin: 0.5em;
  padding: 0;
}
h2 {
  font-size: 1.4em;
  margin: 0;
  padding: 0;
  margin-bottom: 0.5em;
  /* border-bottom: solid 2px #ccc; */
  padding-bottom: 0.5em;
}
.box-task-btn {
  margin: 32px auto 0;
  width: 70%;
}
.btn-border {
  border: 2px solid #fff;
  border-radius: 12px;
  box-shadow: 2px 2px 4px #555;
  margin: 20px 0;
}
.btn-border:nth-child(1) {
  margin-bottom: 20px;
}
.btn-green {
  color: #fff;
  text-shadow: 0 -2px 0 rgba(0, 0, 0, 0.2);
  background: linear-gradient(#6acc36, #2bb05e);
  box-shadow: 2px 4px 6px 0px rgba(163, 255, 83, 0.9) inset;
}
.btn-red {
  color: #fff;
  text-shadow: 0 -2px 0 rgba(0, 0, 0, 0.2);
  background: linear-gradient(#ef7564, #e54e3f);
  box-shadow: 2px 4px 6px 0px rgba(242, 178, 184, 0.9) inset;
}
.btn-lg {
  border-radius: 11px;
  border: none;
  padding: 20px 16px;
  font-size: 17px;
  line-height: 1.25;
}
.btn-block {
  display: block;
  width: 100%;
  font-size: 2.5em;
  text-align: center;
}
</style>