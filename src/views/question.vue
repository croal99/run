<template>
  <div class="page-warp taskpage" v-if="question">
    <div class="box-task animated fadeInLeft delay-time03">
      <div class="box-task-info-border">
        <div class="box-task-info">
          <h2 class="text-center"> {{question.memo}}</h2>
          <div class="task-info" v-html="question.content"></div>
          <img v-if="shake_qrcode_url" :src="shake_qrcode_url" style="width:100%">
        </div>
      </div>
      <div class="box-task-btn">
        <div class="btn-border" v-if="question.type==3">
          <span class="btn btn-block btn-lg btn-green" @click="chooseImage">选择照片</span>
          <span class="btn btn-block btn-lg btn-green" @click="set_answer('https://images.51fengxun.cn/20171229/f55c19c8ee91d56179916bd48fb46e97.jpg')">模拟上传</span>
          <img v-if="answer" class="question-img" :src="answer">
        </div>
        <div v-else-if="question.type==6">
          <mt-checklist v-model="answer" :options="question.items"></mt-checklist>
        </div>
        <div v-else-if="question.type==7">
            <mt-progress :value="task.multi_shake_count" :bar-height="20">
            <div slot="start">0%</div>
            <div slot="end">100%</div>
          </mt-progress>
          <div class="btn-border" v-if="task.multi_shake_count>question.answer">
            <span class="btn btn-block btn-lg btn-green" @click="set_answer(question.answer)">成功</span>
          </div>
          <!-- <mt-field placeholder="摇一摇进度" v-model="task.multi_shake_count" v-else></mt-field> -->
        </div>
        <div v-else-if="question.type==11">
          <!-- <mt-field placeholder="请输入答案" v-model="answer"></mt-field> -->
          <input class="answer-input" type="text" placeholder="请输入答案" v-model="answer">

        </div>
        <div class="btn-border" v-if="answer">
          <span class="btn btn-block btn-lg btn-green" @click="answer_question">确定</span>
        </div>
        <div class="btn-border">
          <span class="btn btn-block btn-lg btn-red" @click="abort_task()">放弃</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import G from "../config/global";
import Util from "../libs/util";
import wx from "weixin-js-sdk";
import { Indicator,Progress } from "mint-ui";

export default {
  data() {
    return {
      task: this.$store.state.task,
      question: null,
      question_list: this.$store.state.question_list,
      image: "",
      photoID: "",
      serverID: "",
      answer: "",
      weixin_status: true,
      shake_qrcode_url: "",
      error_count: 0,
      btn_text: "确定"
    };
  },
  mounted() {
    if (this.$store.state.task.cid == null) {
      this.$router.push("tasklist");
      return;
    }

    // 检查是否有当前任务，如果有，切换到当前任务页面
    var task = this.$store.state.task;
    if (task.status == G.WAIT_SELECT) {
      // 选择任务
      this.$router.push("tasklist");
      return;
    } else if (task.status == G.FIND_CHECKPOINT) {
      // 寻找点位
      this.$router.push("task");
      return;
    } else if (task.status == G.ANSWER_COMPLETE) {
      // 答题完毕，显示信息
      this.$router.push("complete");
      return;
    }

    let question = this.$store.state.question;
    console.log("question", question);
    switch (parseInt(question.type)) {
      case 3:
        // 上传照片
        this.btn_text = "上传照片";
        break;
      case 6:
        // 多选&单选
        this.answer = [];
        break;
      case 7:
        // 多人摇一摇
        let code =
          "https://game.591cms.com/game/shake?id=" +
          this.$store.state.userinfo.openid +
          "&game=" +
          this.$store.state.game_config.game_code +
          "&cid=" +
          this.$store.state.checkpoint.id;
        console.log("code", code);
        this.shake_qrcode_url =
          "https://game.591cms.com/api3/shake_qrcode?code=" + code;
        console.log("shake_qrcode_url", this.shake_qrcode_url);
        this.answer = 0;
        break;
      default:
        this.answer = "";
    }
    this.question = question;

    // 如果是上传照片，需要初始化微信接口
    wx.app = this;
  },
  methods: {
    test1() {
      console.log(
        "answer",
        this.answer,
        this.answer.sort(),
        this.answer.toString()
      );
    },

    // 随机换一题
    random_select() {
      this.$store.commit("set_random_question");
      this.question = this.$store.state.question;
    },

    // 放弃任务
    abort_task() {
      this.$store.commit("abort_task");
      this.$router.push("tasklist");
    },

    //
    set_answer(answer) {
      this.answer = answer;
      this.answer_question();
    },

    // 回答问题
    answer_question() {
      let answer = this.answer;
      if (parseInt(this.question.type) == 6) {
        // 单选&多选题
        //   需要对选项重新排序，否则不方便判断答案
        answer = this.answer.sort().toString();
      }

      console.log("answer", answer);
      this.$store.commit("answer_question", this.answer);
      this.$router.push("complete");
    },

    // 选择照片
    chooseImage() {
      wx.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: function(res) {
          var photoID = res.localIds[0];
          wx.app.uploadImage(photoID);
        }
      });
    },

    // 上传照片到微信
    uploadImage(photoID) {
      Indicator.open({
        text: "数据处理中...",
        spinnerType: "fading-circle"
      });

      // this.photoID = photoID;
      wx.uploadImage({
        localId: photoID,
        isShowProgressTips: 0,
        success: function(res) {
          var serverID = res.serverId;
          wx.app.saveImage(serverID);
        }
      });
    },

    // 从微信服务器下载到SAE
    saveImage(serverID) {
      // this.serverID = serverID;
      Util.download_media(serverID).then(res => {
        // console.log(res);
        Indicator.close();
        this.answer = res.thumb_url;
        // this.answer_question();
      });
    }
  }
};
</script>
<style>
.question-bg {
  background: url(/dist/images/question.png) no-repeat;
}
.question-title {
  position: absolute;
  top: 135px;
  width: 460px;
  height: 280px;
  left: 50%;
  margin-left: -230px;
  -webkit-text-stroke: 1px #ccc;
  font-size: 32px;
  color: #fff;
  text-shadow: 2px 2px 4px #000;
  overflow-y: auto;
  line-height: 1.2em;
}
.option-list {
  width: 524px;
  height: 168px;
  position: absolute;
  bottom: 50px;
  left: 68px;
}
.option-list-item {
  display: block;
  height: 42px;
  line-height: 42px;
  text-align: left;
  color: #fff;
  font-size: 22px;
}
.option-btn {
  float: left;
  width: 30px;
  height: 42px;
  margin-right: 20px;
}
.option-btn span {
  content: "\2714";
}
.question-btns-group {
  width: 554px;
  margin: 0 auto;
}
.btn-3 {
  margin: 50px auto 0 auto;
  display: block;
  line-height: 76px;
  width: 554px;
  height: 76px;
  font-size: 26px;
  color: #fff;
  text-align: center;
  background: url(/dist/images/btn-7.png);
}
.btn-4 {
  margin-top: 30px;
  background: url(/dist/images/btn6.png);
}
.answer-input{
    height: 81px;
    width: 100%;
    border-radius: 10px;
    background: #fff;
    margin-bottom: 40px;
    font-size: 28px;
    padding: 0 10px;
    box-shadow: 2px 2px 4px #727272 inset;
}
.mt-progress, .mt-progress>*{
      font-size: 28px;
}
.mint-cell{
  background:transparent !important;
}
.mint-checkbox-label{
      font-size: 28px;
      margin-left:12px !important; 
}
.mint-checkbox-core{
  width:40px !important;
  height:40px !important;
}
.mint-checklist .mint-checkbox-core:after{
    border: 2px solid transparent;
    top: 0px;
    left: 8px;
     width: 16px;
    height: 32px;
}
.mt-progress-content{
  margin: 0 20px;
}
.mt-progress-progress,.mt-progress-runway{
  border-radius: 20px;
}
</style>