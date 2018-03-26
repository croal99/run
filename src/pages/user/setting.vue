<template>
  <div class="setting-page">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->

    <div class="setting-page-content animated fadeInDown">
      
      <div class="user-info">
        <img :src="user_info.headimgurl" class="headimage">
        <span class="name">{{user_info.nickname}}</span>
      </div>
      
      <div class="gamecontrol">
        <span class="reset" @click="renew">重来</span>
        <span class="music-setting"></span>
      </div>
      
      <div class="about">
        <span class="aboutus"></span>
        <span class="copyright"></span>
      </div>
      
      <div class="admincontrol">
        <span class="admin"></span>
      </div>
      
    </div>

  </div>
</template>

<script>
import { Indicator } from "mint-ui";

export default {
  data() {
    return {};
  },
  created() {
    this.user_info = this.$store.state.user_info;
  },
  mounted() {
    // var tools_list = this.$store.state.record.tools;
    // var question_list = this.$store.state.game_config.question;
    // // 将道具添加到列表
    // for (var key in tools_list) {
    //   var qid = tools_list[key];
    //   var question = question_list[qid];
    //   if (question == undefined) {
    //     continue;
    //   }
    //   this.tools_list.push(question);
    // }
  },
  methods: {
    renew() {
      localStorage.clear();

      // 重新获取配置数据
      var game_code = this.$store.state.game_config.game_code;
      this.$store.commit("init_config", game_code);

      // 跳转到欢迎页面
      this.$router.push({ name: "login" });

      // 获取游戏配置信息
      this.$fetch.api_game_config
        .get_config({
          code: game_code
        })
        .then(({ data }) => {
          // 保存游戏配置信息
          // console.log(data);
          this.$store.commit("set_game_config", data);

          //
          this.$store.commit("get_from_local");

          // 重新初始化用户记录
          this.$fetch.api_game_config
            .set_record({
              code: game_code,
              type: 1, // 修改游戏状态
              status: 1 // welcome
            })
            .then(({ data }) => {
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
    }
  }
};
</script>

