<template>
    <div class="page-warp taskpage">
    <div class="page-head">
      <img src='/dist/images/tasktitle.png'>
    </div>
    <div class="page-content">
      <ul>
        <li class="list-item" v-for ="checkpoint in checkpoint_list" :key="checkpoint.id"  @click="set_task(checkpoint)">
            <div class="list-item-img">
              <img :src="checkpoint.thumb">
            </div>
            <div class="list-item-title">
              <h1>{{checkpoint.name}}</h1>
            </div>
            <div class="list-item-tag">
              <span v-if="!checkpoint.status" class="item-tag item-tag-start">待选任务</span>
              <span v-else class="item-tag item-tag-end">已完成</span>
            </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import G from "../config/global";

export default {
  data() {
    return {
      checkpoint_list: []
    };
  },
  mounted() {
    var game_config = this.$store.state.game_config;
    if (game_config === undefined) {
      this.$router.push("index");
      return;
    }

    // 检查是否有当前任务，如果有，切换到当前任务页面
    var task = this.$store.state.task;
    if (task.status == G.FIND_CHECKPOINT) {
      // 寻找点位
      this.$router.push("task");
      return;
    } else if (task.status == G.ANSWER_QUESTION) {
      // 回答问题
      this.$router.push("question");
      return;
    } else if (task.status == G.ANSWER_COMPLETE) {
      // 答题完毕，显示信息
      this.$router.push("complete");
      return;
    }

    // 绑定可以选择的关卡数据
    this.checkpoint_list = this.$store.state.checkpoint_list;
  },
  methods: {
    // 设置为当前任务
    set_task(checkpoint) {
      console.log('ok')
      // console.log("checkpoint", checkpoint);
      if (checkpoint.status == 0) {
        // 设置当前任务
        this.$store.commit("set_task", checkpoint);
        // 显示任务
        this.$router.push("task");
      } else {
        // 显示任务完成信息
        this.$router.push({ name: 'taskinfo', params: { id: checkpoint.id }})
      }
    }
  }
};
</script>
<style>
.list-item {
  width: 670px;
  height: 226px;
  margin: 10px 49px;
  background:url(/dist/images/taskitem.png) no-repeat;
  position: relative;
}
.list-item-img {
  height:171px;
  width:156px;
  position: absolute;
  left:38px;
  top:26px;
}
.list-item-img img {
  width:100%;
  height:100%;
  border-radius: 5px;
}
.list-item-title{
  height:226px;
  line-height: 226px;
  text-align: center;
}
.list-item-title h1{
  font-size:28px;
  font-weight: bold;
  color:#fff;
  text-shadow: 2px 2px 5px #000;
}
.list-item-tag {
  position: absolute;
  right: 48px;
  top: 30px;
}
.item-tag{
   display: block;
    width: 105px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    border-radius: 6px;
    font-size: 18px;
    color:#fff;
    border: 1px solid #fff;
}
.item-tag-start{
  background: #8BC34A;
}
.item-tag-end{
  background:#00bcd4;
}
</style>
