<template>
    <div class="page-warp taskpage" v-if="shake_flag">
      <div class="box-task-info-border">
        <span class="btn btn-block btn-lg btn-green" @click="shakeComplete()">模拟摇一摇</span>
        <span class="btn btn-block btn-lg btn-green" @click="shakeDebug()">到达目标点</span>
        <img src="/dist/images/shake.gif">
      </div>
    </div>
    <div v-else>
    <div class="page-warp taskpage" v-if="checkpoint">
      <div class="box-task animated fadeInLeft delay-time03">
        <div class="box-task-info-border">
          <div class="box-task-info">
            <h2 class="text-center"> {{checkpoint.name}}</h2>
            <img :src="checkpoint.image">
            <div class="task-info" v-html="checkpoint.memo">
            </div>
          </div>
        </div>
         <div class="box-task-btn">
            <div class="btn-border">
              <span class="btn btn-block btn-lg btn-green" @click="shakeBegin()">摇一摇</span>
              <span class="btn btn-block btn-lg btn-green" @click="scan_task()">扫一扫</span>
            </div>
            <div class="btn-border">
              <span class="btn btn-block btn-lg btn-red" @click="abort_task()">放弃</span>
            </div>
          </div>
      </div>
   </div>
  </div>
</template>
<script>
import wx from "weixin-js-sdk";
import G from "../config/global";

export default {
  data() {
    return {
      checkpoint: null,
      position: this.$store.state.position,
      distance: 0,
      shake_flag: false,
      shake_begin: false,
      shake_end: false,
      SHAKE_THRESHOLD: 4000,
      last_update: 0,
      last_x: 0,
      last_y: 0,
      last_z: 0
    };
  },
  mounted() {
    // var cid = this.$store.state.task.checkpoint;
    if (this.$store.state.task.cid == null) {
      this.$router.push("index");
      return;
    }

    // 检查是否有当前任务，如果有，切换到当前任务页面
    var task = this.$store.state.task;
    if (task.status == G.WAIT_SELECT) {
      // 选择任务
      this.$router.push("tasklist");
      return;
    } else if (task.status == G.ANSWER_QUESTION) {
      // 回答问题
      this.$router.push("question");
      return;
    } else if (task.status == G.ANSWER_COMPLETE) {
      // 答题完毕，显示信息
      this.$router.push("complete");
      return;
    }

    this.checkpoint = this.$store.state.checkpoint;

    // 注册手机摇一摇事件
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.deviceMotionHandler, false);
    } else {
      alert("您的设备不支持摇一摇");
    }
  },
  methods: {
    // 放弃任务
    abort_task() {
      this.$store.commit("abort_task");
      this.$router.push("tasklist");
    },

    // 转换函数
    toRad(d) {
      return d * Math.PI / 180;
    },

    // 距离计算（lat为纬度, lng为经度）
    getDistance(lat1, lng1, lat2, lng2) {
      var dis = 0;
      var radLat1 = this.toRad(lat1);
      var radLat2 = this.toRad(lat2);
      var deltaLat = radLat1 - radLat2;
      var deltaLng = this.toRad(lng1) - this.toRad(lng2);
      var dis =
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(deltaLat / 2), 2) +
              Math.cos(radLat1) *
                Math.cos(radLat2) *
                Math.pow(Math.sin(deltaLng / 2), 2)
          )
        );
      return (dis * 6378137).toFixed(2);
    },

    // 摇一摇事件
    deviceMotionHandler(eventData) {
      var acceleration = eventData.accelerationIncludingGravity;
      var curTime = new Date().getTime();
      if (curTime - this.last_update > 100) {
        var diffTime = curTime - this.last_update;
        this.last_update = curTime;
        var x = acceleration.x;
        var y = acceleration.y;
        var z = acceleration.z;
        var speed =
          Math.abs(x + y + z - this.last_x - this.last_y - this.last_z) /
          diffTime *
          10000;
        if (speed > this.SHAKE_THRESHOLD) {
          this.shakeComplete();
        }
        this.last_x = x;
        this.last_y = y;
        this.last_z = z;
      }
    },

    //
    shakeComplete() {
      console.log("shakeComplete", this.shake_begin);
      if (!this.shake_begin) return;
      this.shake_begin = false; // 防止多次进入
      this.distance = this.getDistance(
        this.position.lat,
        this.position.lng,
        this.checkpoint.lat,
        this.checkpoint.lng
      );

      if (this.distance > 50) {
        this.$dialog.toast({
          mes: "距离目标还有" + this.distance + "米",
          timeout: 1500,
          callback: () => {
            // 触发显示
            this.shake_end = true;
            this.shake_flag = false;
          }
        });
      } else {
        this.$dialog.toast({
          mes: "恭喜你找到了！",
          timeout: 1500,
          icon: "success",
          callback: () => {
            // 设置题目
            var question = this.$store.state.game_config.question_list[
              this.checkpoint.question
            ];
            console.log('question', question);
            this.$store.commit("set_question", question);
            // 进入回答问题
            this.$router.push("question");
          }
        });
      }
    },

    //
    shakeBegin() {
      this.shake_flag = true;
      this.shake_begin = true;
      this.shake_end = false;
      this.distance = 0;
    },

    // 直接到达点位
    shakeDebug() {
      this.$store.state.position.lat = this.$store.state.checkpoint.lat;
      this.$store.state.position.lng = this.$store.state.checkpoint.lng;
      this.$store.state.position.acc = 50;
    },

    // 扫一扫
    scan_task() {
      wx.app = this;
      wx.scanQRCode({
        needResult: 1,
        scanType: ["qrCode", "barCode"],
        success: function(res) {
          wx.app.scanComplete(res.resultStr);
        }
      });
    },

    scanComplete(scan_str) {
      // alert(scan_str);
      let coords = scan_str.split(",");
      this.$store.state.position.lng = coords[0];
      this.$store.state.position.lat = coords[1];
      this.$store.state.position.acc = 5;
      this.shake_begin = true;
      this.shakeComplete();
    }
  }
};
</script>