<template>
  <div class="main-page">
    <div class="main-title-box">
      <!--项目名称-->
      <span></span>
    </div>
    <router-link to="/user/setting" class="setting-box">
      <!--设置-->
    </router-link>
    <div class="card-box">
      <!--道具卡-->
    </div>
    <div class="rank-box">
      <!--成绩-->
    </div>
    <div class="tasklist">
      <ul>
        <li v-for="checkpoint in checkpoint_list" v-if="checkpoint.show" :style="checkpoint.css" :key="checkpoint.id" @click="set_task(checkpoint)">
          <mt-button type="default">{{checkpoint.id}}</mt-button>
          <mt-button type="default">{{checkpoint.status}}</mt-button>
          <img :src="checkpoint.image" class="checkpoint-thumbnail">{{checkpoint.status}}
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
    // 复位当前关卡
    this.$store.commit("set_checkpoint", null);

    // 修改关卡状态
    let checkpoint_list = this.$store.state.game_config.checkpoint_list;
    let record_list = this.$store.state.record_list;

    // 根据记录修改关卡状态
    for (let key in record_list.list) {
      let record = record_list.list[key];
      let checkpoint = checkpoint_list[record.cid];
      if (checkpoint) {
        checkpoint.status = record.status;
      }
    }

    // 根据状态，跳转关卡显示图片
    for (let key in checkpoint_list) {
      let checkpoint = checkpoint_list[key];
      switch (checkpoint.status) {
        case 0:
          checkpoint.image = checkpoint.image0;
          break;
        case 1:
          checkpoint.image = checkpoint.image1;
          break;
        case 2:
          checkpoint.image = checkpoint.image2;
          break;
        case 3:
          checkpoint.image = checkpoint.image3;
          break;
        case 4:
          checkpoint.image = checkpoint.image4;
          break;
      }
    }

    // 保存已经调整后的关卡列表信息，用于显示
    this.checkpoint_list = checkpoint_list;
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

      if (checkpoint.status == 1) {
        // 显示任务
        this.$router.push({ name: "task_show" });
      } else if (checkpoint.status == 2) {
        // 显示题目
        this.$store.commit("set_question", checkpoint);
        this.$router.push({ name: "question_show" });
      } else {
        this.begin_wait();
        this.$fetch.api_game_config
          .set_record({
            code: this.$store.state.game_config.game_code,
            type: 2, // 修改关卡状态
            checkpoint_id: checkpoint.id,
            status: 1 // 选中目标
          })
          .then(({ data }) => {
            Indicator.close();

            // 保存游戏配置信息
            this.$store.commit("set_record_list", data);

            // 显示任务
            this.$router.push({ name: "task_show" });
          });
      }
    }
  }
};
</script>
