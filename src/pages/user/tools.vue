<template>
  <div class="tool-page-content">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->
    
    <span class="tool-page-title">我的道具卡</span>
    <div class="tool-box">
      <div v-for="tool in tools_list" :key="tool.id" class="tool-card">
        <img v-if="tool.count>1" :src="tool.question.content">
        <img v-else src="./images/treasure.png">
        <span v-if="tool.count>1">{{tool.count}}</span>
      </div>
    </div>
    
    <span class="tool-page-title">我的宝藏卡</span>
    <div class="treasure-box">
      <div v-for="tool in treasure_list" :key="tool.id" class="treasure-card">
        <img v-if="tool.count>1" :src="tool.question.content">
        <img v-else src="./images/treasure.png">
        <span v-if="tool.count>1">{{tool.count}}</span>
      </div>
    </div>
    
    <span class="tool-page-title">我的数据</span>
    <div class="data-box">
      <div class="data">
        <span class="myMark">成绩：</span>{{$store.state.record_list.mark}}分
        <span class="myTime">用时：</span>{{$store.state.record_list.time}}
        <span class="myDistance">距离：</span>{{$store.state.record_list.mark}}米
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
      for (let key in tools_list) {
        let tool = tools_list[key];
        if (tool.id == question.answer) {
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

