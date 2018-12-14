<template>
  <div class="question-page" v-if="question">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <audio :src="this.question.voice" controls="controls" preload id="music2" autoplay hidden></audio>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->

    <div v-if="info_page" class="question-info">
      <div v-html="html" @click="next_page">
      </div>

      <div v-if="answer_page" class="answer answer-content-box">
        <input class="answer-input animated fadeIn delay-time2" type="text" v-model="$store.state.task.answer">
      </div>

      <div v-if="selete_page">
        <mt-checklist v-model="$store.state.task.answer" :options="select_options" class="answer-content-box animated fadeInUp delay-time4"></mt-checklist>
      </div>

      <div v-if="$store.state.task.answer.toString().length > 0" class="btn-question-box">
        <span class="btn-question" @click="answer_question">{{btn_text}}</span>
      </div>

      <div v-if="shake_page">
        <img :src="shake_qrcode_url" class="answer-shake">
        <el-progress :text-inside="true" :stroke-width="28" :percentage="$store.state.task.percentage"></el-progress>
        <!-- <input class="answer-input animated fadeIn delay-time2" type="text" v-model="$store.state.task.percentage"> -->
      </div>

      <div v-if="question.type==3||question.type==10" class="btn-question-box">
        <span class="btn-question" @click="answer_question">{{btn_text}}</span>
      </div>
    </div>

    <div v-if="preview_page" class="info-content-box">
      <img class="img-upload" :src="$store.state.task.answer">
      <div class="btn-main-box">
        <button class="btn-upload" @click="set_answer">确认上传</button>
        <button class="btn-cancel" @click="close_preview">取消重拍</button>
      </div>
    </div>

    <div v-else-if="speech_page" class="info-content-box">
      <img class="img-upload" :src="$store.state.task.answer">
      <div>{{speech_text}}</div>
      <!--<div>{{translate}}</div>-->
      <div class="btn-main-box">
        <button id="talk_btn" @click="speech_recognition"><i :class="{'fa-spin': voice.isspeech}" class="fa fa-play-circle fa-5x fa-fw"></i></button>
      </div>

      <div v-if="$store.state.task.answer.toString().length > 0" class="btn-question-box">
        <span class="btn-question" @click="set_answer">确认答案</span>
      </div>
      <button class="btn-cancel" @click="show_speech_page(false)">待会再来</button>
    </div>

  </div>
</template>

<script type="text/javascript">
import wx from "weixin-js-sdk";
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      question: null,

      answer: "",
      weixin_status: true,
      shake_qrcode_url: "",
      error_count: 0,
      voice:{isspeech:false,localId:''}, // 语音内容
      speech_text:"录音状态",
      translate:"识别结果",

      page_index: false, // 分页显示索引
      html: "", // 当前显示页面内容

      select_options: [], // 多选题选项

      info_page: true, // 题目内容页面
      answer_page: false, // 填空题页面
      selete_page: false, // 多选题页面
      shake_page: false, // 多人摇一摇页面
      preview_page: false, // 照片预览页面
      speech_page:false,// 语音识别页面

      btn_text: "确 定", // 按钮名称
      answer_btn: false // 提交按钮页面
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
      let checkpoint = this.$store.state.task.checkpoint;
      let question = this.$store.state.task.question;
      // console.log("show question", question);

      // 初始化页面显示
      this.info_page = true;
      this.answer_page = false;
      this.selete_page = false;
      this.shake_page = false;
      this.preview_page = false;
      this.answer_btn = false;
      this.speech_page = false;

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
      this.btn_text = "确 定";
      this.$store.state.task.answer = "";

      switch (parseInt(question.type)) {
        case 3:
          // 上传照片
          this.btn_text = "上传照片";
          break;
        case 5:
        // get next question
        case 6:
          // 多选&单选
          this.$store.state.task.answer = [];
          this.select_options = [];
          let item_list = question.items.split("<br>");
          let index = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          for (let key in item_list) {
            let item = item_list[key];
            if (item.length > 0) {
              let options = {
                label: item,
                value: index[key]
              };
              this.select_options.push(options);
            }
          }
          // 显示页面
          this.selete_page = true;
          break;
        case 7:
          // 多人摇一摇
          let code =
            "https://game.591cms.com/game/shake?token=" +
            this.$store.state.record_list.token;
          console.log("shake url", code);
          this.shake_qrcode_url =
            "https://game.591cms.com/api3/shake_qrcode?code=" +
            this.$store.state.record_list.token;
          console.log("shake qrcode url", this.shake_qrcode_url);
          this.answer = 0;

          // 显示页面
          this.shake_page = true;
          break;
        case 9:
          // 任务书
          this.$store.state.task.answer = "OK";
          if(question.answer == ''){
            this.btn_text = "确 定";
          }else{
            this.btn_text = question.answer;
          }
          break;
        case 10:
          // 语音识别
          this.btn_text = "语音识别";
          break;
        default:
          this.btn_text = "提 交";
          this.answer = "";
          this.answer_page = true;
      }
      this.question = question;
    },

    answer_question() {
      switch (parseInt(this.question.type)) {
        case 3:
          if (process.env.NODE_ENV == "development") {
            this.$store.state.task.answer = "https://images.51fengxun.cn/media/rightanswer.png";
            this.set_answer();
          } else {
            this.chooseImage();
          }
          break;
        case 10:
          if (process.env.NODE_ENV == "development") {
            this.$store.state.task.answer = this.question.answer;
            this.set_answer();
          } else {
            this.show_speech_page(true);
          }
          break;
        default:
          this.set_answer();
      }
    },

    //
    set_answer() {
      if (parseInt(this.question.type) == 6) {
        // 单选&多选题
        //   需要对选项重新排序，否则不方便判断答案
        let answer = this.$store.state.task.answer;
        this.$store.state.task.answer = answer.sort().toString();
      }

      this.$store.commit("answer_question");

      // 设置下一题
      let question = this.$store.state.task.question;
      this.$store.commit("set_next_question", question);
      this.show_question();
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

      // this.serverID = serverID;
      this.$fetch.api_game_config
        .download_media({
          id: serverID
        })
        .then(({ data }) => {
          Indicator.close();
          // console.log(data);
          this.$store.state.task.answer = data.thumb_url;
          this.info_page = false;
          this.preview_page = true;
        });
    },

    // 关闭预览
    close_preview() {
      this.info_page = true;
      this.preview_page = false;
    },

    // 语音识别页面
    show_speech_page(thepage){
      this.info_page = !thepage;
      this.speech_page = thepage;
    },

    // 语音识别
    speech_recognition(){
      this.voice.isspeech = !this.voice.isspeech;
      if(this.voice.isspeech){
        wx.startRecord({
            success: function(){
              this.speech_text = '正在录音';
            },
            cancel: function () {
              alert('用户拒绝授权录音');
            }
        });
      }else{
        wx.stopRecord({
            success: (res) => {
              this.speech_text = '结束录音';
              this.voice.localId = res.localId;
              wx.playVoice({
                  localId: this.voice.localId // 需要播放的音频的本地ID，由stopRecord接口获得
              });
              wx.translateVoice({
                  localId: this.voice.localId, // 需要识别的音频的本地Id，由录音相关接口获得
                  isShowProgressTips: 1, // 默认为1，显示进度提示
                  success: (res) => {// 语音识别的结果
                    this.$store.state.task.answer = res.translateResult;
                    this.translate = res.translateResult;
                  }
              });
            },
            fail: function (res) {
              alert(JSON.stringify(res));
            }
        });

      }
    },
  }
};
</script>
