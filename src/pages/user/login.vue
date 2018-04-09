<template>
  <div>
    <div v-html="html" class="welcome"></div>
    <div v-if="welcome_page" class="btn-welcome-box">
      <!-- <span class="btn-welcome" >{{$store.state.record_list.openid}}</span> -->
      <span class="btn-welcome" @click="begin_game"></span>
    </div>
    <div v-if="end_page" class="btn-welcome-box">
      <span class="btn-welcome" @click="poster">活动总结</span>
      <span class="btn-welcome" @click="renew">重来一次</span>
    </div>
  </div>
</template>

<script type="text/javascript">
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      end_page: false,
      welcome_page: false,
      html: null
    };
  },
  mounted() {
    // console.log("login");
    this.begin_wait();

    // 检查数据载入状态
    setTimeout(this.check_load_status, 1000);
  },
  methods: {
    begin_wait() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },

    begin_game() {
      this.begin_wait();
      this.$fetch.api_game_config
        .set_record({
          code: this.$store.state.game_config.game_code,
          id: this.$store.state.user_info.openid,
          type: 1, // 修改游戏状态
          status: 2 // 开始游戏
        })
        .then(({ data }) => {
          Indicator.close();
          this.$router.push({ name: "task_list" });
        });
    },

    end_game() {
      this.$router.push({ name: "setting" });
    },

    // 重来一次
    renew() {
      localStorage.clear();
      // console.log("login");
      this.begin_wait();
      this.end_page = false;

      // 重新获取配置数据
      var game_code = this.$store.state.game_config.game_code;
      this.$store.commit("init_config", game_code);

      // 检查数据载入状态
      setTimeout(this.check_load_status, 1000);

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
              id: this.$store.state.user_info.openid,
              type: 1, // 修改游戏状态
              status: 1 // welcome
            })
            .then(({ data }) => {
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

    // 显示海报
    poster() {
      let game_code = this.$store.state.game_config.game_code;
      let openid = this.$store.state.user_info.openid;
      let url = "https://game.591cms.com/game/end_share?code=" + game_code + '&id=' + openid + '&new_end=1';
      // console.log("not login", url);
      window.location.href = url;
      return;
    },

    //
    check_load_status() {
      // 可能还没有获得记录信息
      if (!this.$store.state.hasOwnProperty("record_list")) {
        // 继续检查状态
        setTimeout(this.check_load_status, 1000);
        return;
      }
      else if (!this.$store.state.record_list.hasOwnProperty("status")) {
        // 继续检查状态
        setTimeout(this.check_load_status, 1000);
        return;
      }

      // console.log("checkLoading", this.$store.state.record_list.status);
      if (this.$store.state.record_list.status > 0) {
        Indicator.close();
        if (this.$store.state.record_list.status == 1) {
          this.html = this.$store.state.game_config.welcome.html;
          this.welcome_page = true;
        } else if (this.$store.state.record_list.status == 3) {
          this.html = this.$store.state.game_config.end.html;
          this.end_page = true;
        } else {
          this.$router.push({ name: "task_list" });
        }
      } else {
        // 继续检查状态
        setTimeout(this.check_load_status, 1000);
      }
    }
  }
};
</script>
