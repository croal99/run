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
          <span class="myMark">成绩：{{$store.state.record_list.mark}}</span>
          <span class="myTime">用时：{{$store.state.record_list.time}}</span>
          <!-- <span class="myDistance">距离：</span>{{$store.state.record_list.mark}}米 -->
        </div>
      </div>
    
      <span class="tool-page-title1"></span>
      <div class="tool-box">
        <div class="tool-card">
          <img :src="tools_list['a01'].question.content">
          <span >{{tools_list['a01'].count}}</span>
        </div>
        <div class="tool-card">
          <img :src="tools_list['a02'].question.content">
          <span >{{tools_list['a02'].count}}</span>
        </div>
        <div class="tool-card">
          <img :src="tools_list['a03'].question.content">
          <span >{{tools_list['a03'].count}}</span>
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
        a01: { id:'a01', count: 0, question: {content : "/play/static/images/b4cc69ac.jpg"} },
        a02: { id:'a02', count: 0, question: {content : "/play/static/images/6c1d87f7.jpg"} },
        a03: { id:'a03', count: 0, question: {content : "/play/static/images/fa3c0520.jpg"} },
      },
      treasure_list: {
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
        this.get_treasure(question);
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
    },
    get_treasure(question) {
      // console.log('tools_list', tools_list);
      // console.log('question', question);
      let id = question.answer;
      this.treasure_list[id] = { id:id, count: 0, question: null };
      for (let key in this.treasure_list) {
        let tool = this.treasure_list[key];
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

