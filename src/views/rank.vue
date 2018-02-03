<template>
    <div class="page-warp taskpage">
    <div class="page-rank-head">
        <div class="rank-logo head-left">
        </div>
        <!-- <div class="rank-list">
            <div class="rank-logo-s rank-bg-1"></div>
            <div class="rank-logo-s rank-bg-2"></div>
            <div class="rank-logo-s rank-bg-3"></div>
        </div> -->
    </div>
    <div class="page-content">
        <div calss="rank-list-box">
            <ul>
                <li class="rank-list-item" v-for="userinfo in user_list" :key="userinfo.id">
                    <div class="pull-left rank-item-img">
                        <img :src="userinfo.headimgurl">
                    </div>
                    <div class="pull-right rank-item-content">
                        <div class="item-content-cell" style="width:210px;">
                            <span class="item-icon icon-score"></span>
                            {{userinfo.nickname}}
                        </div>
                        <div class="item-content-cell">
                            <span class="item-icon icon-heart"></span>
                            {{userinfo.mark}}
                        </div>
                        <div class="item-content-cell">
                            <span class="item-icon icon-clock"></span>
                            {{userinfo.time}}
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
  </div>

</template>
<script>
import G from "../config/global";
import Util from "../libs/util";

export default {
  data() {
    return {
      user_list: []
    };
  },
  mounted() {
      // 从服务器获取用户信息
      let game_code = this.$store.state.game_config.game_code;
      Util.get_user_list(game_code).then(user_list => {
          this.user_list = user_list;
      });
  },
  methods: {
    // 设置为当前任务
    set_task(checkpoint) {
      // console.log("checkpoint", checkpoint);
      if (checkpoint.status == 0) {
        // 设置当前任务
        this.$store.commit("set_task", checkpoint);
        // 显示任务
        this.$router.push("task");
      } else {
        // 显示任务完成信息
        this.$router.push({ name: 'taskinfo', params: { id: checkpoint.id }})
      }
    }
  }
};
</script>
<style>
.page-rank-head{
    height: 77px;
    box-sizing: border-box;
    padding:19px 50px;
}
.rank-logo{
    width:116px;
    height:39px;
    background:url(/dist/images/rank.png);
    float: left;
}
.rank-list{
    float:right;
}
.rank-logo-s{
    width:84px;
    height:39px;
    float: left;
}
.rank-bg-1{
    background:url(/dist/images/rank_06.png) no-repeat;
    margin-right:5px;
}
.rank-bg-2{
    background:url(/dist/images/rank_09.png) no-repeat;
    margin-right:5px;
}
.rank-bg-3{
     background:url(/dist/images/rank_11.png) no-repeat;
}
.rank-list-item{
    height: 78px;
    width: 648px;
    margin: 10px 50px;
    position: relative;
}
.rank-item-content{
    width:548px;
    height:78px;
    padding:24px 0;
    box-sizing: border-box;
}
.item-content-cell{
    width: 166px;
    height: 30px;
    line-height: 30px;
    float: left;
    text-align: left;
    line-height: 28px;
    font-size: 22px;
    box-sizing: border-box;
    padding:0 20px;
    overflow: hidden;
}
.item-content-cell span{
    margin-top:2px;
    margin-right:10px;
}
.rank-item-img{
    height:78px;
    width:78px;
}
.rank-item-img img{
    height:100%;
    width:100%;
}
.item-icon{
    display: block;
    float: left;
    width:28px;
    height:28px;
}
 .icon-score{
     background:url(/dist/images/score.png) no-repeat;
 }
 .icon-heart{
     background:url(/dist/images/heart.png) no-repeat;
 }
 .icon-clock{
      background:url(/dist/images/clock.png) no-repeat;
 }
</style>