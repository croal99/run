<template>
   <div class="page-warp taskpage">
     <div class="map-warp" id='amap'>
      <el-amap class="amap-box" :zoom="zoom" :center="center" :amap-manager="amapManager" :plugin="plugin" vid="amap-vue">
      <el-amap-marker v-for="checkpoint in checkpoint_list" v-if="checkpoint.show" :position="[checkpoint.lng, checkpoint.lat]"
        :icon="checkpoint.icon" v-bind:key="checkpoint.id"></el-amap-marker>
      <el-amap-circle v-if="position" :center="[position.lng, position.lat]" :radius="position.acc" fillOpacity="0.6"></el-amap-circle>
    </el-amap>
     </div>
     <!-- <div class="map-tips">
     </div>
     <div class="page-btns-group map-btn">
       <a href="javascript:;" class="btn btn-6" @click="choose_stage()"></a>
       <a href="javascript:;"  class="btn btn-7"></a>
     </div> -->
   </div>
</template>

<script>
import { MessageBox } from "mint-ui";
import { AMapManager } from "vue-amap";
let amapManager = new AMapManager();

export default {
  data() {
    return {
      zoom: 17,
      center: [],
      checkpoint_list: null,
      show_target: true,
      position: this.$store.state.position,
      // plugin: ['ToolBar', 'Geolocation'],
      plugin: ["ToolBar"],
      amapManager
    };
  },
  mounted() {
    // console.log("map mounted");
    document.getElementById("amap").style.height =
      window.innerHeight - 110 + "px";

    var game_config = this.$store.state.game_config;
    if (game_config === undefined) {
      this.$router.push("index");
      return;
    }

    // 设置自己的位置为地图中心
    this.center = [
      this.$store.state.position.lng,
      this.$store.state.position.lat
    ];
    // this.center = [game_config.area.longitude, game_config.area.latitude];
    var checkpoint = this.$store.state.checkpoint;

    if (checkpoint) {
      this.checkpoint_list = [checkpoint];
      this.show_target = checkpoint.show;
    } else {
      this.checkpoint_list = this.$store.state.checkpoint_list;
    }
  },
  methods: {
    add_map() {
      var imageLayer = new AMap.ImageLayer({
        url:
          "https://images.51fengxun.cn/game/zjh/map/map.jpeg",
        bounds: new AMap.Bounds(
          [104.137215,30.599911],
          [104.145594,30.605184]
        ),
        zooms: [15, 18]
      });

      let o = this.amapManager.getMap();
      imageLayer.setMap(o);
      console.log("amap", o);
    },

    choose_stage() {
      MessageBox.confirm("需要消耗一个红心哟？").then(action => {
        if (action == "confirm") {
          var checkpoint = this.$store.state.checkpoint;
          this.$store.commit("add_checkpoint_map", checkpoint.id);
          // this.markers.push({
          //   position: [checkpoint.lng, checkpoint.lat],
          //   icon: checkpoint.icon
          // });
          this.show_target = true;
        }
      });
    }
  }
};
</script>
<style>
.map-warp{
    height: 1177px !important;
    background:#fff;
  }
  .map-tips{
    width:652px;
    height:256px;
    margin:0 auto;
    background:url(/dist/images/eggs.png) no-repeat;
  }
  .map-btn{
    box-sizing: border-box;
    padding:60px 0;
  }
  .btn-6{
    background:url(/dist/images/btn-10.png) no-repeat;
    margin-bottom:10px;
  }
  .btn-7{
    background:url(/dist/images/btn-11.png) no-repeat;
  }
</style>
