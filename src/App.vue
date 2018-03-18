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
    this.initGame("1234");
  },
  methods: {
    ...mapActions({
      set_user_info: SET_USER_INFO
    }),
    initGame(game_code) {
      // console.log("initGame", this);
      // 从服务器获取用户信息
      this.$fetch.api_user
        .get_user_info({
          code: game_code
        })
        .then(({data}) => {
          // 检查用户是否登录
          if (!data.login) {
            // 没有用户数据，跳转到微信登录
            let url = "https://game.591cms.com/user/oauth?code=" + game_code;
            // console.log("not login", url);
            window.location.href = url;
            return;
          }
          // 保存用户信息
          this.set_user_info(data);

          // 微信认证
          this.initWeiChat();

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
              // get_record_list
              this.$fetch.api_game_config
                .get_record({
                  code: game_code
                })
                .then(({ data }) => {
                  this.$store.commit("set_record_list", data);
                });
            });
        });
    },
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
    }
  }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "~assets/scss/animate.css";
// @import "~assets/scss/main";

// .fade-enter-active,
// .fade-leave-active {
//   transition: all 0.2s ease;
// }

// .fade-enter,
// .fade-leave-active {
//   opacity: 0;
// }
</style>
