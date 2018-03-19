<template>
  <div class="setting-page">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->

    <div class="tools-page-content">
        <div v-for="tools in tools_list" :key="tools.id">
      <div class="user-info">{{tools.name}}</div>
      <div class="headimage"><img :src="tools.content"></div>
        </div>
    </div>

  </div>
</template>

<script>
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
              tools_list: [],

    };
  },
  created() {
    var tools_list = this.$store.state.record_list.tools;
    var question_list = this.$store.state.game_config.question_list;
    // 将道具添加到列表
    for (var key in tools_list) {
      var qid = tools_list[key];
      var question = question_list[qid];
      if (question == undefined) {
        continue;
      }
      tools_list.push(question);
    }
    this.tools_list = tools_list;
  },
  mounted() {
  },
  methods: {
  }
};
</script>

