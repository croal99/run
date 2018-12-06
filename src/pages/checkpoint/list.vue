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
    <div id="product-sec-countdown" class="time-box"></div>
      <!--计时器-->
    
    <div class="decorate"></div>
    
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
      checkpoint_list: null,
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
        // 用sort进行排序
        let arr = [];
        for (var i in this.$store.state.game_config.checkpoint_list) {
            arr.push(this.$store.state.game_config.checkpoint_list[i]);
        };
        arr.sort(function (a,b) {
          return a['sort'] - b['sort'];
        });
        this.checkpoint_list = arr
      });

    
    if(this.$store.state.int == -1){
      this.$store.state.int = setInterval(()=>{
        this.startcountdown()
      },1000);
    };
    // this.checkpoint_list = this.$store.state.game_config.checkpoint_list;

    
    //  audio实例
    this.$store.state.audio = document.getElementById('music1');
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
        console.log('record', record);
        if (record) {
          if(record.qid>0) {
            question = this.$store.state.game_config.question_list[record.qid];
            console.log('other question', question);
          }
        }
        this.$store.commit("set_question", question);
        // 进入回答问题
        this.$router.push({ name: "question_show" });
      } 
      // else if (checkpoint.status == 3) {
      //   this.$router.push({ name: "task_success" });
      // } else if (checkpoint.status == 4) {
      //   // this.$router.push({ name: "task_default" });
      //   this.$router.push({ name: "task_success" });
      // }
    },


    startcountdown(){
      this.$nextTick(() => {
        if(this.$store.state.sec > 0){
          this.countdown()
        }
      })
    },
    
    countdown () {
      let date = new Date()
      let sec = this.$store.state.sec-parseInt(date.getTime()/1000)
      var hour = 0
      var minute = 0
      var second = 0
      if (sec >= 60) {
        minute = Math.floor(sec / 60)
        second = sec % 60
        if (minute >= 60) {
          hour = Math.floor(minute / 60)
          minute = minute % 60
        } else {
              hour = 0
            }
      } else {
        second = sec
        hour = 0
        minute = 0
      }

      hour = hour < 10 && hour > 0 ? '0' + hour : hour
      minute = minute < 10 && minute > 0 ? '0' + minute : minute
      second = second < 10 && second > 0 ? '0' + second : second
      var countdownStr = '距结束 ' + hour + ':' + minute + ':' + --second
      if (sec <= 0) {
        this.begin_wait()
        this.$fetch.api_game_config
          .set_record({
            code: this.$store.state.game_config.game_code,
            id: this.$store.state.user_info.openid,
            cid: 0,
            type: 1, // 修改关卡状态
            status: 3 // 结束游戏
          })
          .then(({ data }) => {
            console.log(data)
            Indicator.close()
            clearInterval(this.$store.state.int)
            this.$store.state.int = -1
            // 保存游戏记录信息
            // this.$store.commit("set_record_list", data);
            // 显示任务
            // this.$router.push({ name: "task_show" });
            location.reload()
          })
        // location.reload()
      }
      try{
        document.getElementById('product-sec-countdown').innerHTML = countdownStr
      }catch(e){}
    }
  },
};
</script>
