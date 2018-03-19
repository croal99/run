<template>
  <div class="rank-page">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->

    <div class="setting-page-content">
      <div v-for="tool in tools_list" :key="tool.id">
        <div>
          <img :src="tool.question.content" style="width:100%">
          <span v-if="tool.count>1">{{tool.count}}</span>
        </div>
      </div>


      <div>
        <p>个人成绩</p>
        <span>成绩：</span>{{$store.state.record_list.mark}}分
        <span>用时：</span>{{$store.state.record_list.time}}
        <span>距离：</span>{{$store.state.record_list.mark}}米
      </div>
    </div>

  </div>
</template>

<script>
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      tools_list: []
    };
  },
  created() {
    let temp_list = this.$store.state.record_list.tools;
    let question_list = this.$store.state.game_config.question_list;
    let tools_list = [];

    // 将道具添加到列表
    for (let key in temp_list) {
      let qid = temp_list[key];
      let question = question_list[qid];
      if (question == undefined) {
        continue;
      }
      if (question.items != "tool") {
        continue;
      }

      // 检查是否存在道具
      let tid = this.get_tools(tools_list, question.id);
      if (tid == -1) {
        let tool = {
          question: question,
          count: 1
        };
        tools_list.push(tool);
      } else {
        let tool = tools_list[tid];
        tool.count++;
      }
    }
    this.tools_list = tools_list;
  },
  mounted() {},
  methods: {
    get_tools(tools_list, id) {
      for (let key in tools_list) {
        let tool = tools_list[key];
        if (tool.question.id == id) {
          return key;
        }
      }

      return -1;
    }
  }
};
</script>

