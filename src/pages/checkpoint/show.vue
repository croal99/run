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
      
      <div class="decorate"></div>

      <div @click="next_page">
        <div class="task-info" v-html="html"></div>
      </div>

      <!-- foot -->
      <div v-if="answer_btn" class="btn-checkpoint-box animated fadeIn delay-time1">
        <span v-if="method==2" class="btn-checkpoint" @click="scan_task()">扫一扫</span>
        <!-- <span v-if="method==1" class="btn-checkpoint" @click="scanComplete('test')">扫一扫</span> -->
        <span v-else class="btn-checkpoint" @click="shakeBegin()">摇一摇</span>
      </div>
    </div>

    <div v-if="shake_page" class="shake-page">
      <!-- <mt-button type="primary" @click="shakeComplete()">模拟摇一摇</mt-button>
      <mt-button type="primary" @click="fly2checkpoint()">到达目标点</mt-button> -->
      <div class="shake-info animated wobble">
        <span>摇一摇手机</span>
        <img src="./images/shake.jpg">
      </div>
    </div>

    <div v-if="help_page" class="help-page">
      <div class="main-title-box">
        <span></span>
      </div>

      <div class="help-page-content animated fadeInDown delay-time1">
        <div class="distance-box">
          <span class="distance" @click="use_tool('a01')">提示距离</span>
          <mt-badge size="small" type="error">{{tools_list['a01'].count}}</mt-badge>
          <span class="distance-info"></span>
        </div>
        <div class="map-box">
          <span class="map" @click="use_tool('a02')">显示地图</span>
          <mt-badge size="small" type="error">{{tools_list['a02'].count}}</mt-badge>
          <span class="map-info"></span>
        </div>
        <div class="arrive-box">
          <span class="arrive" @click="use_tool('a03')">直接到达</span>
          <mt-badge size="small" type="error">{{tools_list['a03'].count}}</mt-badge>
          <span class="arrive-info"></span>
        </div>
      </div>

      <div class="btn-close-box animated fadeIn delay-time3">
        <span class="btn-close" @click="close_help()">关闭</span>
      </div>
    </div>

    <div v-if="shake_fail_message_page" class="shake-message-page" @click="close_message">
      <div class="shake-fail-message-content animated tada delay-time1">
        <span class="shake-fail-message">{{message}}</span>
      </div>
    </div>

    <div v-if="distance_message_page" class="distance-message-page" @click="close_message">
      <div class="distance-message-content animated fadeIn delay-time1">
        <span class="distance-message">{{message}}</span>
      </div>
    </div>

    <div v-if="map_page" class="map-page" id='amap'>
      <div class="main-title-box">
        <span></span>
      </div>

      <el-amap class="map-content" :zoom="zoom" :center="[marker.target.lng, marker.target.lat]" vid="amap-vue">
        <el-amap-marker :position="[marker.target.lng, marker.target.lat]"></el-amap-marker>
        <el-amap-circle :center="[marker.self.lng, marker.self.lat]" :radius="position.acc" fillOpacity="0.6" strokeColor="#cd2b4a" fillColor="#ffffff"></el-amap-circle>
        <el-amap-circle :center="[marker.self.lng, marker.self.lat]" radius="5" fillOpacity="1" strokeColor="#cd2b4a" fillColor="#cd2b4a"></el-amap-circle>
      </el-amap>

      <div class="btn-close-box animated fadeIn delay-time3">
        <span class="btn-close" @click="close_map()">关闭</span>
      </div>
    </div>

  </div>
</template>

<script type="text/javascript">
import { Toast } from "mint-ui";
import { Indicator } from "mint-ui";
import { MessageBox } from "mint-ui";
import md5 from "js-md5";
import wx from "weixin-js-sdk";
import { AMapManager } from "vue-amap";
let amapManager = new AMapManager();

export default {
  data() {
    return {
      checkpoint: null,
      position: this.$store.state.position,
      marker: {
        target: {
          lat: 0,
          lng: 0
        },
        self: {
          lat: 0,
          lng: 0
        }
      },
      zoom: 17,

      shake_begin: false,
      SHAKE_THRESHOLD: 4000,
      last_update: 0,
      last_x: 0,
      last_y: 0,
      last_z: 0,

      page_index: 0,
      html: "",
      answer_btn: false,

      info_page: true,
      shake_page: false,
      help_page: false,
      map_page: false,
      shake_fail_message_page: false,
      distance_message_page: false,

      // 道具
      tools_list: {
        a01: { id: "a01", count: 0, question: null }, // 距离卡
        a02: { id: "a02", count: 0, question: null }, // 地图卡
        a03: { id: "a03", count: 0, question: null } // 到达卡
      },

      plugin: ["ToolBar"],
      amapManager: null
    };
  },
  mounted() {},
  created() {
    let checkpoint = this.$store.state.task.checkpoint;

    wx.app = this; // 微信对象中保存VUE
    AMap.app = this; // 高德对象中保存VUE

    // 触发条件
    this.method = checkpoint.method;

    // 对content按<page>分页
    checkpoint.page_list = checkpoint.content.split("<page>");
    this.page_index = 0;
    this.html = checkpoint.page_list[this.page_index++];
    this.answer_btn = this.page_index == checkpoint.page_list.length;

    // 注册手机摇一摇事件
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.deviceMotionHandler, false);
    } else {
      alert("您的设备不支持摇一摇");
    }

    this.checkpoint = checkpoint;

    // 查询道具情况
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
        this.tools_list[question.answer].count++;
      }
    }
  },
  methods: {
    begin_wait() {
      Indicator.open({
        text: "数据载入中...",
        spinnerType: "fading-circle"
      });
    },

    next_page() {
      if (this.page_index < this.checkpoint.page_list.length) {
        console.log("next_page", this.page_index);
        this.html = this.checkpoint.page_list[this.page_index++];
        this.answer_btn = this.page_index == this.checkpoint.page_list.length;
      }
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

    // 显示地图
    use_tool(card) {
      this.$fetch.api_game_config
        .use_tool({
          code: this.$store.state.game_config.game_code,
          id: this.$store.state.user_info.openid,
          tid: card
        })
        .then(({ data }) => {
          // 修改剩余卡牌数量
          this.tools_list[data.tid].count = data.count;

          // 根据结果判定是否使用道具
          if (data.success) {
            switch (data.tid) {
              case "a01":
                this.show_distance_message();
                break;
              case "a02":
                this.show_map();
                break;
              case "a03":
                this.fly2checkpoint();
                break;
            }
          } else {
            this.message = "你还没有获得该道具卡";

            // 触发显示
            this.help_page = false;
            this.distance_message_page = true;
          }
        });
    },

    // 显示地图
    show_map() {
      this.begin_wait();

      // 转换坐标
      AMap.convertFrom(
        [
          [this.checkpoint.lng, this.checkpoint.lat],
          [this.position.lng, this.position.lat]
        ],
        "gps",
        function(status, result) {
          // console.log(result);
          Indicator.close();

          // 设置显示点位
          AMap.app.marker.target.lat = result.locations[0].getLat();
          AMap.app.marker.target.lng = result.locations[0].getLng();
          AMap.app.marker.self.lat = result.locations[1].getLat();
          AMap.app.marker.self.lng = result.locations[1].getLng();
          AMap.app.help_page = false;
          AMap.app.map_page = true;
        }
      );
    },

    // 关闭地图
    close_map() {
      this.info_page = true;
      this.map_page = false;
    },

    // 显示距离
    show_distance_message() {
      let distance = this.getDistance(
        this.position.lat,
        this.position.lng,
        this.checkpoint.lat,
        this.checkpoint.lng
      );
      this.message = "距离目标还有：" + distance + "米";

      // 触发显示
      this.help_page = false;
      this.distance_message_page = true;
    },

    // 关闭message
    close_message() {
      this.shake_fail_message_page = false;
      this.distance_message_page = false;
      this.info_page = true;
    },

    // 直接到达点位
    fly2checkpoint() {
      let checkpoint = this.checkpoint;

      // 修改当前坐标
      this.$store.state.position.lat = checkpoint.lat;
      this.$store.state.position.lng = checkpoint.lng;
      this.$store.state.position.acc = checkpoint.range;

      this.onCheckpoint();
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

    shakeComplete() {
      console.log("shakeComplete", this.shake_begin);
      if (!this.shake_begin) return;
      this.shake_begin = false; // 防止多次进入

      this.getLocation_h5();

      // // 检查当前距离是否进入目标范围
      // let distance = this.getDistance(
      //   this.position.lat,
      //   this.position.lng,
      //   this.checkpoint.lat,
      //   this.checkpoint.lng
      // );
      // let range = parseFloat(this.checkpoint.range) > 0 ? parseFloat(this.checkpoint.range) : 50;
      // alert('range:'+range+',distance:'+distance);

      // if (distance > range) {
      //   console.log("distance", distance);
      //   this.message = "你似乎还没有到达目的地，或者，你再摇几次？... ...";

      //   // 触发显示
      //   this.shake_fail_message_page = true;
      //   this.shake_page = false;
      // } else {
      //   // 设置题目
      //   this.onCheckpoint();
      // }
    },

    // GPS定位
    getLocation_h5() {
      // console.log("getLocation_h5");
      if (navigator.geolocation) {
        var geo_options = {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        };

        // 启动位置采集
        navigator.geolocation.getCurrentPosition(
          this.onLocationComplete,
          this.onLocationError,
          geo_options
        );
      } else {
        console.log("Browser does not support Geolocation");
      }
    },

    // 定位失败
    onLocationError(error) {
      switch (error.code) {
        case error.TIMEOUT:
          console.log("onLocationError:TIMEOUT");
          //   alert("onLocationError:TIMEOUT");
          break;
        case error.PERMISSION_DENIED:
          console.log("onLocationError:PERMISSION_DENIED");
          //   alert("onLocationError:PERMISSION_DENIED");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("onLocationError:POSITION_UNAVAILABLE");
          //   alert("onLocationError:POSITION_UNAVAILABLE");
          break;
      }

      MessageBox('出错了', '获取你的位置失败了，请重新刷新页面');
    },

    //解析定位结果，将定位数据存储到localStorage并上传一份数据到服务器
    onLocationComplete(position) {
      // 保存当前位置到本地存储
      let coords = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
        acc: position.coords.accuracy
      };
      this.$store.commit("set_coords", coords);

      // 检查当前距离是否进入目标范围
      let distance = this.getDistance(
        this.position.lat,
        this.position.lng,
        this.checkpoint.lat,
        this.checkpoint.lng
      );
      let range = parseFloat(this.checkpoint.range) > 0 ? parseFloat(this.checkpoint.range) : 50;
      // alert('range:'+range+',distance:'+distance);

      if (distance > range) {
        console.log("distance", distance);
        this.message = "你似乎还没有到达目的地，或者，你再摇几次？... ...";

        // 触发显示
        this.shake_fail_message_page = true;
        this.shake_page = false;
      } else {
        // 设置题目
        this.onCheckpoint();
      }
    },

    //
    shakeBegin() {
      this.info_page = false;
      this.shake_page = true;

      this.shake_begin = true;
      this.distance = 0;
    },

    // 成功到达
    onCheckpoint() {
      this.begin_wait();

      let checkpoint = this.checkpoint;

      // 修改关卡状态
      this.$fetch.api_game_config
        .set_record({
          code: this.$store.state.game_config.game_code,
          id: this.$store.state.user_info.openid,
          cid: checkpoint.id,
          type: 2, // 修改关卡状态
          status: 2 // 到达位置
        })
        .then(({ data }) => {
          Indicator.close();
          // 设置题目
          let question = this.$store.state.game_config.question_list[
            checkpoint.question
          ];
          this.$store.commit("set_question", question);
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
      let code = md5(scan_str);
      if (code == this.checkpoint.code) {
        // 设置题目
        this.onCheckpoint();
      } else {
        this.message = "你似乎还没有到达目的地，或者，你再找找？... ...";
        // 触发显示
        this.shake_fail_message_page = true;
        this.info_page = false;
      }
    }
  }
};
</script>

<style scoped>
.shake-page {
  position:absolute;
  background: #2d3132;
  height: 100%;
  width:100%;
}
.shake-info {
  width: 200px;
  height: 250px;
  margin: 40% auto;
  font-size: 30px;
  text-align: center;
  line-height: 60px;
  color: #fff;
}
.map-content {
  background: #2d3132;
  height: 800px;
}
</style>
