<template>
  <div class="main-page">
    <div class="main-title-box">
      <!--项目名称-->
      <span></span>
    </div>
    <router-link to="/user/setting" class="setting-box">
      <!--设置-->
    </router-link>
    <router-link to="/user/rank" class="rank-box">
      <!--排行榜-->
    </router-link>
    <router-link to="/user/tools" class="card-box">
      <!--道具卡-->
    </router-link>
    <!-- <div class="rank-box">
    </div> -->
    <div class="tasklist">
      <ul>
        <li v-for="checkpoint in checkpoint_list" v-if="checkpoint.show" :key="checkpoint.id" @click="set_task(checkpoint)">
          <img v-if="checkpoint.change" :src="checkpoint.image" :class="checkpoint.css1">
          <img v-else :src="checkpoint.image" :class="checkpoint.css">
        </li>
      </ul>
    </div>

  </div>
</template>

<script type="text/javascript">
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      checkpoint_list: null
    };
  },
  created() {
    // 初始化当前任务
    // console.log("list created");
    this.begin_wait();
    this.$store.commit("init_task");

    // 重新获取游戏记录
    this.$fetch.api_game_config
      .get_record({
        code: this.$store.state.game_config.game_code,
        id: this.$store.state.user_info.openid,
      })
      .then(({ data }) => {
        // 关闭等待
        Indicator.close();
        this.$store.commit("set_record_list", data);
        if (this.$store.state.record_list.status == 3) {
          // 游戏结束
          this.$router.push({ name: "login" });
          return;
        }
        // 保存已经调整后的关卡列表信息，用于显示
        this.checkpoint_list = this.$store.state.game_config.checkpoint_list;
      });

    // this.checkpoint_list = this.$store.state.game_config.checkpoint_list;
  },
  mounted() {
    // console.log("list mounted");
  },
  methods: {
    begin_wait() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },

    // 设置为当前任务
    set_task(checkpoint) {
      this.$store.commit("set_checkpoint", checkpoint);

      if (checkpoint.status == 0) {
        // 更新状态
        this.begin_wait();
        this.$fetch.api_game_config
          .set_record({
            code: this.$store.state.game_config.game_code,
            id: this.$store.state.user_info.openid,
            cid: checkpoint.id,
            type: 2, // 修改关卡状态
            status: 1 // 选中目标
          })
          .then(({ data }) => {
            Indicator.close();
            // 保存游戏记录信息
            // this.$store.commit("set_record_list", data);
            // 显示任务
            this.$router.push({ name: "task_show" });
          });
      } else if (checkpoint.status == 1) {
        // 显示任务
        this.$router.push({ name: "task_show" });
      } else if (checkpoint.status == 2) {
        // 关卡关联的默认题目
        let question = this.$store.state.game_config.question_list[
          checkpoint.question
        ];
        console.log('question', question);

        // 检查该关卡是否有记录，如果有，按照记录执行
        let record = this.$store.state.record_list.list[checkpoint.id];
        if (record) {
          if(record.qid>0) {
            question = this.$store.state.game_config.question_list[record.qid];
            console.log('other question', question);
          }
        }
        this.$store.commit("set_question", question);
        // 进入回答问题
        this.$router.push({ name: "question_show" });
      } else {
        // 3/4都是已经完成的状态，因此不需要跳转页面
      }
    }
  }
};
</script>
