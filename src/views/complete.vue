<template>
  <div class="page-warp taskpage" v-if="question">
    <div class="box-task animated fadeInLeft delay-time03">
      <div class="box-task-info-border">
        <div class="box-task-info">
          <div v-if="task.success">
            <div class="answer-text" v-if="question.type==3">
              <h2 class="text-center">上传成功</h2>
              <img class="question-img" :src="task.answer">
            </div>
            <div class="answer-text" v-else-if="question.type==5">
              <h2 class="text-center">{{question.answer}}</h2>
              <div v-html="question.content"></div>
            </div>
            <div class="answer-text" v-else-if="question.type==7">
              <img class="question-img" src="/dist/images/success.png">
              <p>恭喜你！完成任务</p>
              <p v-if="question.mark>0">获得{{question.mark}}分</p>
            </div>
            <div class="answer-text" v-else-if="question.type==9">
              <h2 class="text-center">{{question.memo}}</h2>
              <div v-html="question.content"></div>
            </div>
            <div class="answer-text" v-else>
              <img class="question-img-default" src="/dist/images/success.png">
              <p>恭喜你！回答正确</p>
              <p v-if="question.mark>0">获得{{question.mark}}分</p>
            </div>
          </div>
          <div v-else>
            <div class="answer-text">
              <img class="question-img-default" src="/dist/images/error.png">
              <p>很遗憾，回答错误</p>
           </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box-task-btn">
      <div class="btn-border">
        <span class="btn btn-block btn-lg btn-green" @click="answer_complete()">确定</span>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      task: this.$store.state.task,
      question: this.$store.state.question
    };
  },
  mounted() {
    if (this.$store.state.task.cid == null) {
      this.$router.push("index");
      return;
    }
  },
  methods: {
    // 答题结束
    answer_complete() {
      console.log('answer_complete');
      this.$store.commit("check_checkpoint");
      this.$router.push("question");
    }
  }
};
</script>
<style>
.correct{
    background:url(/dist/images/complete.png) no-repeat;
}
.answer-text{
    width: 80%;
    text-align: center;
    color: #eda00c;
    text-shadow: 1px 2px 4px #000;
    font-weight: bold;
    -webkit-text-stroke: 1px #fff;
    font-size: 36px;
    line-height: 1.5em;
    margin: 50px 10%;
}
.answer-btn-box{
    height:295px;
}
.answer-btn{
    margin:111px auto 0 auto;
    display: block;
    line-height: 76px;
    width:554px;
    height:76px;
    font-size:26px;
    color:#fff;
    text-align: center;
    background: url(/dist/images/btn-7.png);
}
.question-img{
    width: 80%;
    height: 640px;
    margin: 70px 10%;
    border-radius: 20px;
}
.question-img-default{
   width: 80%;
    height: 520px;
    margin: 70px 10%;
    border-radius: 20px;
}
</style>
