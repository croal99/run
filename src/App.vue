<template>
      <router-view></router-view>
  <!-- <section class="body-warp">
    <transition name="fade" mode="out-in">
    </transition>
  </section> -->
</template>
<script type="text/javascript">
import { mapActions } from "vuex";
import { SET_USER_INFO } from "store/actions/type";
import wx from "weixin-js-sdk";

export default {
  name: "app",
  created() {
    console.log("app create");
    // 游戏基础数据
    if (process.env.NODE_ENV == "development") {
      // this.initGame("debug");
      this.initGame("1234");
    } else {
      this.initGame("1234");
    }
    // 微信认证
    this.initWeiChat();
    // 位置定位
    this.getLocation_h5();
  },
  methods: {
    ...mapActions({
      set_user_info: SET_USER_INFO
    }),

    // 初始化游戏
    initGame(game_code) {
      // console.log("initGame", this);
      // 从服务器获取用户信息
      this.$fetch.api_user
        .get_user_info({
          code: game_code
        })
        .then(({ data }) => {
          // 检查用户是否登录
          if (!data.login) {
            // 没有用户数据，跳转到微信登录
            let url = "https://game.591cms.com/user/oauth?code=" + game_code;
            // console.log("not login", url);
            window.location.href = url;
            return;
          }
          // 保存用户信息
          data.game_code = game_code;
          this.set_user_info(data);

          // 获取游戏配置信息
          this.$fetch.api_game_config
            .get_config({
              code: game_code
            })
            .then(({ data }) => {
              // 保存游戏配置信息
              // console.log(data);
              this.$store.commit("set_game_config", data);
              // get_from_local
              this.$store.commit("get_from_local");
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
      // console.log("initWeiChat", path);
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
              "scanQRCode"
            ]
          });

          // 等待配置
          wx.ready(function() {
            wx.checkJsApi({
              jsApiList: [
                "chooseImage",
                "uploadImage",
                "downloadImage",
                "scanQRCode"
              ],
              success: function(res) {
                // this.$store.state.weixin_status = true;
                console.log("init weixin success");
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
      console.log("initWebSocket");
      this.$store.state.ws = new WebSocket("wss://api.51fengxun.cn:7273/");
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
      let data = JSON.parse(msg.data);
      switch (data.type) {
        case "ping":
          // 心跳
          break;

        case "multi_shake":
          console.log("multi shake", msg);
          // 多人摇一摇
          this.$store.commit("set_multi_shake");
          break;

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
    }
  }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "~assets/scss/animate.css";
</style>
