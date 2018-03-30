<template>
  <div>
    <div v-html="html" class="welcome"></div>
    <div v-if="welcome_page" class="btn-welcome-box">
      <span class="btn-welcome" >{{$store.state.record_list.openid}}</span>
      <span class="btn-welcome" @click="begin_game">让我们开始吧</span>
    </div>
    <div v-if="end_page" class="btn-welcome-box">
      <span class="btn-welcome" @click="end_game">我的记录</span>
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
    // this.beginWait();

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
