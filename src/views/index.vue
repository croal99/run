<template>
  <div>
    <yd-cell-group title="GPS">
      <yd-button type="primary">{{position.lng}}</yd-button>
      <yd-button type="primary">{{position.lat}}</yd-button>
      <yd-button type="primary">{{position.acc}}</yd-button>
      <yd-button type="primary">{{position.time}}</yd-button>
    </yd-cell-group>
    <yd-cell-group title="RANK">
      <yd-button type="primary">mark: {{record.mark}}</yd-button>
      <yd-button type="primary">time:{{record.time}}</yd-button>
    </yd-cell-group>
    <yd-cell-group title="TOOLS">
      <img v-for="question in tools_list" v-if="question.items=='x01'" :src="question.memo" v-bind:key="question.id">
    </yd-cell-group>
    <yd-button type="primary" size="large" @click.native="test1()">到达目标点坐标</yd-button>
    <yd-button type="primary" size="large" @click.native="test2()">Send2OB</yd-button>
    <!-- <yd-button type="primary" size="large" @click.native="add_checkpoint()">AddCheckpoint</yd-button> -->
    <!-- <yd-button type="primary" size="large" @click.native="get_openid()">GetOpenID</yd-button> -->
    <!-- <yd-button type="primary" size="large" @click="initWeiChat2()">初始化微信</yd-button> -->
    <mt-button type="primary" size="large" @click="initWeiChat">初始化微信</mt-button>
    <!-- <yd-button type="primary" size="large" @click.native="chooseImage()">照片</yd-button> -->
    <!-- <yd-button type="primary" size="large" @click.native="saveImage('5ZcZl7AvbabsP_OcKV0rdM9CHVuDfPxAzKk-bQZQiEI2vjtjZ2PkAJhRTJjNJVeC')">下载照片</yd-button> -->
  </div>
</template>
<script>
import Util from "../libs/util";
import wx from "weixin-js-sdk";
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      position: this.$store.state.position,
      checkpoint_list: this.$store.state.checkpoint_list,
      tools_list: [],
      image: "",
      photoID: "",
      serverId: "",
      openId: "",
      headimgurl: "",
      record: this.$store.state.record
    };
  },
  mounted() {
    var tools_list = this.$store.state.record.tools;
    var question_list = this.$store.state.game_config.question;

    // 将道具添加到列表
    for (var key in tools_list) {
      var qid = tools_list[key];
      var question = question_list[qid];
      if (question == undefined) {
        continue;
      }
      this.tools_list.push(question);
    }
  },
  methods: {
    test1() {
      this.$store.state.position.lat = this.$store.state.checkpoint.lat;
      this.$store.state.position.lng = this.$store.state.checkpoint.lng;
      this.$store.state.position.acc = 50;
    },
    test2() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },
  }
};
</script>