<template>
    <div class="page-warp taskpage">
     <div class="page-inner-content set-bg">
        <div class="set-title">
          游戏：志交会 邀请码：ZJH
        </div>
        <div class="set-content">
          <div class="pull-left">
            <div class="game-img">
              <img :src="userinfo.headimgurl">
            </div>
            <span class="name">{{userinfo.nickname}}</span>
          </div>
          <a class="pull-right reset-btn" @click="renew()"></a>
        </div>
     </div>
   </div>
</template>
<script>
import G from "../config/global";
import Util from "../libs/util";
import config from "../config/config";
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      tools_list: [],
      userinfo: this.$store.state.userinfo,
      record: this.$store.state.record
    };
  },
  mounted() {
    var tools_list = this.$store.state.record.tools;
    var question_list = this.$store.state.game_config.question;

    // 将道具添加到列表
    for (var key in tools_list) {
      var qid = tools_list[key];
      var question = question_list[qid];
      if (question == undefined) {
        continue;
      }
      this.tools_list.push(question);
    }
  },
  methods: {
    renew() {
      console.log("renew");
      localStorage.clear();
      this.tools_list = [];

      // 重新获取配置数据
      var game_code = this.$store.state.game_config.game_code;
      this.$store.commit("init_config", game_code);

      // 从服务器获取游戏配置
      Util.get_config(game_code).then(game_config => {
        // console.log(game_config);
        this.$store.state.game_config = game_config;
        this.$store.commit("get_from_local");

        // 跳转到欢迎页面
              // this.$store.state.load_status = 1;

        this.$router.push("wellcome");
      });
    }
  }
};
</script>
<style>
.set-bg {
  background: url(/dist/images/reset.png);
}
.set-title {
  color: #fff;
  font-size: 26px;
  position: absolute;
  left: 60px;
  top: 52px;
}
.set-content {
  position: absolute;
  top: 123px;
  left: 50%;
  margin-left: -300px;
  width: 600px;
  height: 78px;
}
.game-img {
  width: 92px;
  height: 78px;
  float: left;
}
.game-img img {
  width: 100%;
  height: auto;
  border-radius: 50%;
}
.name {
  height: 78px;
  width: 314px;
  line-height: 78px;
  font-size: 26px;
  margin-left: 40px;
  overflow: hidden;
}
.reset-btn {
  width: 160px;
  height: 50px;
  display: block;
  top: 20px !important;
}
</style>
