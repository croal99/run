<template>
  <div class="question-page" v-if="question">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->

    <div v-if="info_page" class="question-info">
      <!-- <mt-button type="primary" @click="saveImage('ksyBhWQfJCjcuGMgThgPo7VBXl1-yWegcwZNlwGkY08Qx8lPogNeKZ4QyyE15Rau')">test</mt-button> -->
      <!-- <div v-html="question.content"></div> -->
      <!-- <img v-if="shake_qrcode_url" :src="shake_qrcode_url" style="width:100%"> -->
      <div @click="next_page">
        <div v-html="html"></div>
      </div>

      <div v-if="answer_page" class="answer">
        <br/>
        <br/>
        <input class="answer-input" type="text" v-model="answer">
      </div>

      <div v-if="answer_btn" class="btn-question-box">
        <span class="btn-question" @click="answer_question">{{btn_text}}</span>
      </div>
    </div>

    <div v-if="preview_page" class="question-preview">
      <img v-if="answer" class="question-img" :src="answer">
      <mt-button type="primary" @click="set_answer">确定</mt-button>
      <mt-button type="primary" @click="close_preview">取消</mt-button>
    </div>


  </div>
</template>

<script type="text/javascript">
import wx from "weixin-js-sdk";
import { Indicator } from "mint-ui";

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
      btn_text: "确定",
      page_index: false,
      html: "",

      info_page: true,
      answer_page: false,
      answer_btn: false,
      preview_page: false
    };
  },
  mounted() {},
  created() {
    // 初始化微信接口
    wx.app = this;

    this.show_question();
  },
  methods: {
    begin_wait() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },

    // 显示下一页内容
    next_page() {
      if (this.page_index < this.question.page_list.length) {
        console.log("next_page", this.page_index);
        this.html = this.question.page_list[this.page_index++];
        this.answer_btn = this.page_index == this.question.page_list.length;
      }
    },

    // 显示

    show_question() {
      let question = this.$store.state.task.question;
      // console.log("show question", question);
      if (question == null) {
        // 没有题目，返回列表
        this.$router.push({ name: "task_list" });
        return;
      }

      // 对content按<page>分页
      question.page_list = question.content.split("<page>");
      this.page_index = 0;
      this.html = question.page_list[this.page_index++];
      this.answer_btn = this.page_index == question.page_list.length;

      switch (parseInt(question.type)) {
        case 3:
          // 上传照片
          this.btn_text = "上传照片";
          break;
        case 5:
        // get next question
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
        case 9:
          // 任务书
          this.btn_text = "确定";
          break;
        default:
          this.btn_text = "提交";
          this.answer = "";
          this.answer_page = true;
      }
      this.question = question;
    },

    test1() {
      console.log(
        "answer",
        this.answer,
        this.answer.sort(),
        this.answer.toString()
      );
    },

    answer_question() {
      switch (parseInt(this.question.type)) {
        case 3:
          this.chooseImage();
          break;
        default:
          this.set_answer();
      }
    },

    //
    set_answer() {
      console.log("answer", this.answer);
      this.$store.commit("answer_question", this.answer);

      // 设置下一题
      console.log("answer end");
      let question = this.$store.state.task.question;
      this.$store.commit("set_next_question", question);
      this.show_question();

      return;

      this.begin_wait();

      // 保存答案
      this.$fetch.api_game_config
        .set_record({
          code: this.$store.state.game_config.game_code,
          type: 3, // 记录答题状态
          record: this.$store.state.record
        })
        .then(({ data }) => {
          Indicator.close();

          // 保存游戏配置信息
          // this.$store.commit("set_record_list", data);
        });
    },

    // 回答问题
    answer_question_1() {
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
      // this.photoID = photoID;
      wx.uploadImage({
        localId: photoID,
        isShowProgressTips: 1,
        success: function(res) {
          var serverID = res.serverId;
          wx.app.saveImage(serverID);
        }
      });
    },

    // 从微信服务器下载到SAE
    saveImage(serverID) {
      Indicator.open({
        text: "数据处理中...",
        spinnerType: "fading-circle"
      });

      this.serverID = serverID;
      this.$fetch.api_game_config
        .download_media({
          id: serverID
        })
        .then(({ data }) => {
          Indicator.close();
          // console.log(data);
          this.answer = data.thumb_url;
          this.info_page = false;
          this.preview_page = true;
        });
    },

    // 关闭预览
    close_preview() {
      this.info_page = true;
      this.preview_page = false;
    }
  }
};
</script>
