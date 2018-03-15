<template>
  <div v-if="checkpoint">
    <div v-if="info_page" class="checkpoint">
      <!-- head begin -->
      <div class="main-title-box">
        <span></span>
      </div>
      <router-link to="/checkpoint/list" class="back-box"></router-link>
      <span class="help-box" @click="show_help"></span>
      <!-- head end -->

      <div class="task-info" v-html="checkpoint.content">
      </div>
      <!-- foot -->
      <div class="btn-checkpoint-box">
        <span v-if="method==2" class="btn-checkpoint" @click="scan_task()">扫一扫</span>
        <span v-else class="btn-checkpoint" @click="shakeBegin()">摇一摇</span>
      </div>
    </div>

    <div v-if="shake_page" class="shake-page">
        <mt-button type="primary" @click="shakeComplete()">模拟摇一摇</mt-button>
        <mt-button type="primary" @click="shakeDebug()">到达目标点</mt-button>
      <div class="shake-info animated wobble">
        <span>摇一摇手机</span>
        <img src="./images/shake.jpg">
      </div>
    </div>

    <div v-if="help_page" class="help-page">
      <div class="main-title-box">
        <span></span>
      </div>

      <div class="help-page-content">
        <div class="distance-box">
          <span class="distance">提示距离</span>
          <span class="distance-info"></span>
        </div>
        <div class="map-box">
          <span class="map">显示地图</span>
          <span class="map-info"></span>
        </div>
        <div class="arrive-box">
          <span class="arrive" @click="shakeDebug()">直接到达</span>
          <span class="arrive-info"></span>
        </div>
      </div>

      <div class="btn-close-box">
        <span class="btn-close" @click="close_help()">关闭</span>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
      checkpoint: null,
      position: this.$store.state.position,
      distance: 0,
      shake_begin: false,
      shake_end: false,
      SHAKE_THRESHOLD: 4000,
      last_update: 0,
      last_x: 0,
      last_y: 0,
      last_z: 0,
      info_page: true,
      shake_page: false,
      help_page: false
    };
  },
  mounted() {},
  created() {
    // let id = this.$route.params.id;
    this.checkpoint = this.$store.state.checkpoint;
    // 触发条件
    this.method = this.checkpoint.method;

    // 注册手机摇一摇事件
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.deviceMotionHandler, false);
    } else {
      alert("您的设备不支持摇一摇");
    }
  },
  methods: {
    begin_wait() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },

    // 显示帮助
    show_help() {
      this.info_page = false;
      this.help_page = true;
    },

    // 关闭帮助
    close_help() {
      this.info_page = true;
      this.help_page = false;
    },

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

            this.info_page = true;
            this.shake_page = false;
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
            this.$store.commit("set_question", question);
            // 进入回答问题
            this.$router.push("question");
          }
        });
      }
    },

    //
    shakeBegin() {
      this.info_page = false;
      this.shake_page = true;

      this.shake_begin = true;
      this.shake_end = false;
      this.distance = 0;
    },

    // 直接到达点位
    shakeDebug() {
      this.begin_wait();

      let checkpoint = this.$store.state.checkpoint;

      // 修改当前坐标
      this.$store.state.position.lat = this.checkpoint.lat;
      this.$store.state.position.lng = this.checkpoint.lng;
      this.$store.state.position.acc = this.checkpoint.range;

      // 修改关卡状态
      this.$fetch.api_game_config
        .set_record({
          code: this.$store.state.game_config.game_code,
          type: 2, // 修改关卡状态
          cid: checkpoint.id,
          status: 2 // 到达位置
        })
        .then(({ data }) => {
          Indicator.close();

          // 设置题目To-do
          this.$store.commit("set_question");
          let question = this.$store.state.question;

          // 保存游戏配置信息，可以不做
          this.$store.commit("set_record_list", data);

          // 进入回答问题
          this.$router.push({ name: "question_show" });
        });
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

<style scoped>
.shake-page {
  background: #2d3132;
  height: 100%;
}
.shake-info {
  width: 200px;
  height: 250px;
  margin: 40% auto 48%;
  font-size: 30px;
  text-align: center;
  line-height: 40px;
  color: #fff;
}
</style>