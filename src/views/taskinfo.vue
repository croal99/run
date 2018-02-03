<template>
  <!-- <div>
    <div v-if="checkpoint">
      <mt-button type="primary" size="large">{{checkpoint.name}}</mt-button>
      <img :src="checkpoint.image" style="width:100%">
      <div v-for="record in record_list" v-bind:key="record.id">
        <mt-button type="primary" size="large">得分：{{record.mark}}</mt-button>
        <mt-button type="primary" size="large">成绩：{{record.success}}</mt-button>
        <mt-button type="primary" size="large">题目：{{record.question.content}}</mt-button>
        <mt-button type="primary" size="large">类型：{{record.question.type_name}}</mt-button>
        <hr/>
      </div>
    </div>
  </div> -->
    <div class="page-warp taskpage" v-if="checkpoint">
      <div class="box-task animated fadeInLeft delay-time03">
        <div class="box-task-info-border">
          <div class="box-task-info">
            <h2 class="text-center"> {{checkpoint.name}}</h2>
            <img :src="checkpoint.image">
          </div>
        </div>
      <div v-for="record in record_list" v-bind:key="record.id">
        <mt-button type="primary" size="large">得分：{{record.mark}}</mt-button>
        <mt-button type="primary" size="large">成绩：{{record.success}}</mt-button>
        <mt-button type="primary" size="large">题目：{{record.question.content}}</mt-button>
        <mt-button type="primary" size="large">类型：{{record.question.type_name}}</mt-button>
        <hr/>
      </div>
      </div>
   </div>
</template>
<script>
export default {
  data() {
    return {
      checkpoint: null,
      record_list: []
    };
  },
  mounted() {
    let game_config = this.$store.state.game_config;
    let id = this.$route.params.id;

    // 关卡信息
    this.checkpoint = game_config.checkpoint_list[id];

    // record list
    let record_list = this.$store.state.record.list;
    for (var key in record_list) {
      let record = record_list[key];
      if ((record.cid == this.checkpoint.id)) {
        record["question"] = game_config.question_list[record.qid];
        this.record_list.push(record);
        console.log("record", record);
      }
    }
  },
  methods: {
    set_task(checkpoint) {
      // console.log(checkpoint);
      checkpoint.status = 1;
      this.$store.state.task.checkpoint = checkpoint;
      this.$router.push("/task");
    }
  }
};
</script>
<style>
.taskinfo-bg {
  background: url(/dist/images/taskinfo.png) no-repeat;
}
.btn-1 {
  background: url(/dist/images/btn5.png) no-repeat;
  margin-bottom: 30px;
}
.btn-2 {
  background: url(/dist/images/btn6.png) no-repeat;
}
</style>