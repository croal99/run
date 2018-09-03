<template>
  <div v-if="checkpoint">
    <div v-if="info_page" class="checkpoint">
      <!-- head begin -->
      <div class="main-title-box">
        <span></span>
      </div>
      <router-link to="/checkpoint/list" class="back-box"></router-link>
      <!-- head end -->
      <div id="info"  v-for="question in html">
        <div v-if="question.type==3" class="record-content-box">这是上传照片<img class="img-responsive" :src="question.answer"></div>
        <div v-if="question.type==6">
          <div v-html="question.content"></div>
          <mt-checklist v-model="value" :options="question.items" class="answer-content-box animated fadeInUp delay-time4"></mt-checklist>
          <div class="record-content-box">选择的答案：{{question.answer}}</div>
        </div>
        <!-- <div class="record-content-box" v-if="question.type==7">7</div>-->
      </div>

<!-- {{this.$store.state.record_list}}
{{this.checkpoint}}-->
      <!-- foot -->
    </div>

  </div>
</template>

<script type="text/javascript">
import { Toast } from "mint-ui";
import { Indicator } from "mint-ui";
import { MessageBox } from "mint-ui";
import md5 from "js-md5";
import wx from "weixin-js-sdk";

export default {
  data() {
    return {
      checkpoint: null,
      record:null,
      question_list:null,

      value:[],

      page_index: 0,
      html: {},
      answer_btn: false,

      info_page: true,
    };
  },
  created() {
    this.checkpoint = this.$store.state.task.checkpoint;
    this.record = this.$store.state.record_list.list[this.checkpoint.id].record;
    this.question_list = this.$store.state.game_config.question_list;
    
    this.show_info();

    // this.html = this.record
    // .map(function(value){
    //   let content = "";

    //   return content;
    // });
  },
  methods: {
    begin_wait() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },

    show_info(){
      for(let questionid in this.record){
        this.html[questionid] = this.question_list[questionid];
        this.html[questionid].answer = this.record[questionid].answer;
        if(this.html[questionid].type == 6){
          let items = this.question_list[questionid].items;
          try{
            let item_list = items.split("<br>");
            this.html[questionid].items = [];
            let index = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let key in item_list) {
              let item = item_list[key];
              if (item.length > 0) {
                let options = {
                  label: item,
                  value: index[key]
                };
                this.html[questionid].items.push(options);
              }
            }
          }catch(e){}
        }
      }
    }
  }
};
</script>
