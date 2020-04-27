<template>
  <div>
    <router-view></router-view>
    <!-- <div>{{$store.state.position.lng}},{{$store.state.position.lat}},{{$store.state.position.acc}}</div> -->
    <audio
      :src="JSON.stringify(this.$store.state.game_config)!='null'?this.$store.state.game_config.audio:''"
      :volume="this.$store.state.media.loud"
      :paused="!this.$store.state.media.bgm"
      controls="controls" preload id="music1" loop autoplay hidden>
    </audio>
  </div>
</template>
<script type="text/javascript">
import wx from "weixin-js-sdk";
import { Indicator } from "mint-ui";
import { MessageBox } from "mint-ui";

export default {
  name: "app",
  created() {
    console.log("app create");
    // 手机类型判断
    let ua = navigator.userAgent;
    this.isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    this.isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;

    // 获取游戏编码
    let game_code = window.location.href.split("#")[0].split("?")[1];
    if (game_code==undefined) {
      if (!this.$cookies.isKey('game_code')) {
        console.log('add code');
        this.$cookies.set('game_code', 'wjl01');
      }
      game_code = this.$cookies.get('game_code');
    }
    else {
      this.$cookies.set('game_code', game_code);
    }
    console.log('game_code', game_code);

    // 加载CSS文件
    let head = document.getElementsByTagName('HEAD').item(0);
    let style = document.createElement('link');
    let timestamp = Date.parse(new Date());
    style.href = 'https://images.51fengxun.com/game/'+game_code+'/css/game.css?dc='+timestamp;
    style.rel = 'stylesheet';
    style.type = 'text/css';
    head.appendChild(style);

    // 游戏基础数据
    this.initGame(game_code);
    // 微信认证
    this.initWeiChat();
    // 位置定位
    this.getLocation_h5();
  },
  methods: {
    // 初始化游戏
    initGame(game_code) {
      // console.log("initGame", this);
      // 从服务器获取用户信息
      this.$fetch.api_user
        .get_user_info({code: game_code})
        .then(({code, data, msg}) => {
          console.log('get user info', code);
          // 检查用户是否登录
          if (code==100) {
            // 没有用户数据，跳转到微信登录
            let url = "https://game.591cms.com/user/oauth?code=" + game_code;
            // let url = "https://game.591cms.com/user/";
            // console.log("not login", url);
            window.location.href = url;
            return;
          }
          else if (code==101) {
            // 需要认证码
            console.log('need auth code', game_code);
            let user_info = {'game_code': game_code, 'status':2}
            this.$store.commit("set_user_info", user_info);
            return;
          }
          else if (code!=0) {
            MessageBox('出错了！', msg);
            return;
          }

          // 保存用户信息
          this.$store.commit("set_user_info", data);

          // 获取游戏配置信息
          this.$fetch.api_game_config
            .get_config({
              code: game_code
            })
            .then(({ data }) => {
              // 保存游戏配置信息
              // console.log(data);
              this.$store.commit("set_game_config", data);
              // WebSocket
              this.initWebSocket();
              // get_record_list
              this.$fetch.api_game_config
                .get_record({
                  code: game_code,
                  id: this.$store.state.user_info.openid,
                })
                .then(({ data }) => {
                  this.$store.commit("set_record_list", data);
                });
            });
        });
    },

    // 初始化微信
    initWeiChat() {
      let path = window.location.href.split("#")[0];
      console.log("initWeiChat", path);
      this.$fetch.api_user
        .get_package({
          path: path
        })
        .then(({ data }) => {
          let sign_package = data;
          // console.log("sign_package", sign_package, wx);

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
              "scanQRCode",
              'startRecord',
              'stopRecord',
              'playVoice',
              'uploadVoice',
              'downloadVoice',
              'translateVoice'
            ]
          });

          // 等待配置
          wx.ready(function() {
            wx.checkJsApi({
              jsApiList: [
                "chooseImage",
                "uploadImage",
                "downloadImage",
                "scanQRCode",
                'startRecord',
                'stopRecord',
                'playVoice',
                'uploadVoice',
                'downloadVoice',
                'translateVoice'
              ],
              success: function(res) {
                // this.$store.state.weixin_status = true;
                // console.log("init weixin success");
                // alert("授权成功");
              }
            });
          });

          wx.error(function(res) {
            alert("微信授权失败");
            // if (this.error_count < 3) {
            //     this.initWeiChat();
            // } else {
            // }
          });
        });
    },

    // 初始化WebSocket
    initWebSocket() {
      if (this.isAndroid) {
        this.$store.state.ws = new WebSocket("ws://api.51fengxun.com:7273/");
        console.log("init Android WebSocket");
      }
      else {
        this.$store.state.ws = new WebSocket("wss://api.51fengxun.com:4433/");
        console.log("init IOS WebSocket");
      }
      this.$store.state.ws.onopen = this.onOpened;
      this.$store.state.ws.onmessage = this.onMessage;
      this.$store.state.ws.onclose = this.onClose;
      this.$store.state.ws.onerror = this.onError;
    },

    // webSock事件
    onOpened() {
      // console.log("on opened", this);
      // 登录
      var send_data = {
        type: "login",
        user_id: this.$store.state.user_info.openid,
        game_id: this.$store.state.game_config.game_code,
        client: "fengxun",
        client_type: "game"
      };

      var send_json = JSON.stringify(send_data);
      console.log("on open", send_json);
      this.$store.state.ws.send(send_json);
      // this.reportInfo();
    },

    onClose() {
      // console.log("on close", this);
      setTimeout(this.initWebSocket, 3000);
    },

    onError() {
      // console.log("on error", this);
    },

    onMessage(msg) {
      console.log("on message");
      let data = JSON.parse(msg.data);
      switch (data.type) {
        case "ping":
          // 心跳
          break;

        case "multi_shake":
          // console.log("multi shake", data);
          // 多人摇一摇
          this.$store.commit("set_multi_shake");
          var send_data = {
              type: "multi_shake",
              user_id: this.$store.state.user_info.openid,
              game_id: this.$store.state.game_config.game_code,
              client: "fengxun",
              client_type: "game",
              target_id: 'multi_shake',
              message: {
                  type: "multi_shake_count",
                  shake_count: this.$store.state.task.multi_shake_count,
                  answer: this.$store.state.task.answer,
              }
          };

          var send_json = JSON.stringify(send_data);
          // console.log("on shake complete", send_json);
          this.$store.state.ws.send(send_json);
          break;

        case "countdown":
          this.$store.state.sec = data.sec
          console.log("countdown", data.sec);
          // 倒计时
          break;

        case "start":
          try{
            let startbtn = document.getElementsByClassName("btn-welcome-box")[0]
            startbtn.style.display='block'
          }catch(e){
            // console.log(e)
          }
          console.log("start");
          // 倒计时
          break;

        case "helpplayer":
          clearTimeout(this.$store.state.timeout);
          Indicator.close();
          MessageBox('抱歉', data.ms);

          if(data.res == 0){console.log(this.$store.state.task.checkpoint)
            // 修改关卡状态
            this.$fetch.api_game_config
              .set_record({
                code: this.$store.state.game_config.game_code,
                id: this.$store.state.user_info.openid,
                cid: this.$store.state.task.checkpoint.id,
                type: 2, // 修改关卡状态
                status: 2 // 到达位置
              })
              .then(({ data }) => {
                Indicator.close();
                // 设置题目
                let question = this.$store.state.game_config.question_list[
                  this.$store.state.task.checkpoint.question
                ];
                this.$store.commit("set_question", question);
                // 进入回答问题
                this.$router.push({ name: "question_show" });
              });
          }
          console.log(data);
          console.log("helpplayer");
          // 倒计时
          break;

        case "news":
          MessageBox(data.title, data.ms);


        default:
          console.log("unknown message", msg);
          break;
      }
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
        navigator.geolocation.watchPosition(
          this.onLocationComplete,
          this.onLocationError,
          geo_options
        );
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
  }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "~assets/scss/animate.css";
</style>
