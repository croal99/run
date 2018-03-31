<template>
  <div class="tool-page">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->
    
    <div class="tool-page-content animated fadeInDown">
      <span class="tool-page-title3"></span>
      <div class="data-box">
        <div class="data">
          <span class="myMark">成绩：</span>{{$store.state.record_list.mark}}
          <span class="myTime">用时：</span>{{$store.state.record_list.time}}
          <!-- <span class="myDistance">距离：</span>{{$store.state.record_list.mark}}米 -->
        </div>
      </div>
    
      <span class="tool-page-title1"></span>
      <div class="tool-box">
        <div v-for="tool in tools_list" :key="tool.id" class="tool-card">
          <img v-if="tool.count>0" :src="tool.question.content">
          <img v-else src="./images/tool.jpg">
          <span >{{tool.count}}</span>
        </div>
      </div>
    
      <span class="tool-page-title2"></span>
      <div class="treasure-box">
        <div v-for="treasure in treasure_list" :key="treasure.id" class="treasure-card">
          <img v-if="treasure.count>0" :src="treasure.question.content">
          <img v-else src="./images/treasure.jpg">
          <span v-if="treasure.count>1">{{treasure.count}}</span>
        </div>
      </div>
    
    </div>
  </div>
</template>

<script>
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      tools_list: {
        a01: { id:'a01', count: 0, question: null },
        a02: { id:'a02', count: 0, question: null },
        a03: { id:'a03', count: 0, question: null },
      },
      treasure_list: {
        b01: { id:'b01', count: 0, question: null },
        b02: { id:'b02', count: 0, question: null },
        b03: { id:'b03', count: 0, question: null },
        b04: { id:'b04', count: 0, question: null },
      },
    };
  },
  created() {
    let tools_list = this.$store.state.record_list.tools;
    let question_list = this.$store.state.game_config.question_list;

    // 将道具添加到列表
    for (let key in tools_list) {
      let qid = tools_list[key];
      let question = question_list[qid];
      if (question == undefined) {
        continue;
      }

      // 对道具进行识别
      if (question.items == "tool") {
        this.get_tools(this.tools_list, question);
      }
      else if (question.items == "treasure") {
        this.get_tools(this.treasure_list, question);
      }
    }
  },
  mounted() {},
  methods: {
    get_tools(tools_list, question) {
      // console.log('tools_list', tools_list);
      // console.log('question', question);
      for (let key in tools_list) {
        let tool = tools_list[key];
        if (tool.id == question.answer) {
          // console.log('find', question.answer);
          tool.count++;
          tool.question = question;
          return key;
        }
      }

      return -1;
    }
  }
};
</script>

