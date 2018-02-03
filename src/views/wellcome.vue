<template>
  <div id="welcome" class="welcome">
    <div class="wel_page_1" v-if="currentPage == 1">
      <img class="wel_title" src="https://images.51fengxun.cn/game/zjh/img/actor1.png">
      <img class="wel_title animated fadeInUp" src="https://images.51fengxun.cn/game/zjh/img/title2.png">
      <div class="wel_page_btn animated fadeIn">
        <button type="button" class="welcome-btn" @click="nextPage">下一页</button>
      </div>
    </div>
    <div class="wel_page_2" v-else-if="currentPage == 2">
      <div class="welcome-notice">
        <h2 class="text-center text-danger wel_page_title">温馨提示</h2>
        <p>为了给本次活动增添一点乐趣，我们特别为成都市志愿服务交流展示会设计了此次活动。</p>
        <p>本次活动范围在主会场区域内，所有项目或者参观内容均在场地内，无需到其他地方寻找。</p>
        <p>户外进行，请参加者注意安全，并保管好自己的财务。</p>
      </div>
      <div class="wel_page_btn animated fadeIn">
        <button type="button" class="welcome-btn" @click="nextPage">下一页</button>
      </div>
    </div>
    <div class="wel_page_3" v-else-if="currentPage == 3">
      <div class="welcome-notice">
        <h2 class="text-center text-danger wel_page_title">关于小志带你游展会的一点说明</h2>
        <p>作为云公益科技志愿者服务队，在本次成都市志愿服务交流展示会引入“蜂寻”系统技术，体验志愿服务与科技的有效结合，“蜂寻”系统采用微信平台作为志愿服务版块体验入口和实际体验平台，利用导览图显示的线上活动环节设计，线下志愿活动的参与体验，引导大家参与导览图上的志愿服务体验版块，拓宽志愿服务的影响力。</p>
      </div>
      <div class="wel_page_btn animated fadeIn">
        <button type="button" class="welcome-btn" @click="nextPage">下一页</button>
      </div>
    </div>
    <div class="wel_page_3" v-else-if="currentPage == 4">
      <div class="welcome-notice">
        <h2 class="text-center text-danger wel_page_title">“寻宝集爱心 公益我争先”活动说明</h2>
        <p class="strong">比比看，谁的爱心收集得多？</p>
        <p>收集爱心的方法一：在场地内每个主题区域，都藏着一个二维码。找到它，扫描它，系统会随机发送不同数量的爱心给您。</p>
        <p>收集爱心的方法二：场地内隐藏了三颗彩蛋，如果您能找到，也有惊喜哦。</p>
        <p>我们会根据您收集的爱心数量，给予不同的奖励。收集11颗以上爱心者，会获得一等奖。收集6-10颗爱心的，获得二等奖。收集2-5颗爱心的，获得纪念奖。</p>
        <p>我们由衷希望您能够多参与，多积攒爱心，多多助力公益事业。</p>
      </div>
      <div class="wel_page_btn animated fadeIn">
        <button type="button" class="welcome-btn" @click="begin_game">让我们开始吧</button>
      </div>
    </div>
  </div>
</template>
<script>
import G from "../config/global";
import Util from "../libs/util";
import config from "../config/config";
import { Indicator } from "mint-ui";

export default {
  created() {
    // console.log("created");
  },
  data() {
    return {
      userinfo: null,
      currentPage: 0
    };
  },
  mounted() {
    this.url = this.$route.query.redirect;
    Indicator.open({
      text: "数据载入中...",
      spinnerType: "fading-circle"
    });

    // 检查数据载入状态
    setTimeout(this.check_load_status, 1000);
  },
  methods: {
    get_next_page(page) {
      document
        .getElementById(page)
        .css("display", "block")
        .siblings("div")
        .css("display", "none");
    },

    nextPage() {
      this.currentPage = this.currentPage + 1;
    },

    begin_game() {
      this.$store.state.load_status = 2;
      this.$store.commit("set_begin_time");
      this.$router.push("tasklist");
    },

    //
    check_load_status() {
      console.log("checkLoading", this.$store.state);
      if (this.$store.state.userinfo) {
        if (this.$store.state.load_status == 1) {
          Indicator.close();
          if (this.$store.state.record.begin_time == 0) {
            this.currentPage = 1;
          } else {
            this.$store.state.load_status = 2;
            this.$router.push("tasklist");
          }
          return;
        }
      }

      // 继续检查状态
      setTimeout(this.check_load_status, 1000);
    }
  }
};
</script>
<style>
.welcome {
  background-image: url("https://images.51fengxun.cn/game/zjh/img/bg-welcome.jpg");
  background-size: 100%;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}
.strong {
  font-weight: bold;
}
.welcome .welcome-btn {
  width: 400px;
  height: 60px;
  background: #4caf50;
  color: #fff;
  text-align: center;
  border: none;
  border-radius: 10px;
  font-size: 28px;
  margin: 50px 184px;
}
.wel_page_title {
  font-size: 42px;
  margin-bottom: 26px;
}
.welcome-notice p {
  margin-bottom: 26px;
}
.with-padding {
  padding: 0;
}
.welcome .welcome-notice {
  font-size: 32px;
  padding: 250px 30px 10px 28px;
  line-height: 1.5em;
}
.with-padding #body {
  position: absolute;
  top: 0;
  background: #dfcdba;
}
#footer.footer4 .footer-navigation li {
  width: 33.333%;
}

.task-title {
  width: 180px;
  height: 60px;
  margin-left: auto;
  margin-right: auto;
  background-image: url("/Application/Game/Static/v0037/images/task-list-title.png");
}
.checkpoint-list .checkpoint-list-img {
  border: 6px solid #fff;
}
.checkpoint-list .col-xs-12,
.checkpoint-list .col-xs-6 {
  margin-bottom: 4px;
}
.box-task {
  margin: 50px 9px 80px;
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
}
.box-task-info-border {
  border: 2px solid #b32d3a;
  border-radius: 16px;
}
.box-task-info {
  background: linear-gradient(#e04c59, #f45a69);
  box-shadow: 2px 2px 3px #333333;
  font-size: 17px;
  border: 4px solid #f198a0;
  border-radius: 16px;
  padding-left: 16px;
  padding-right: 16px;
  color: #fff;
}
.box-task-info h2 {
  font-weight: bold;
  -webkit-text-stroke: 1px #fff;
  color: #e04c59;
  text-shadow: 1px 2px 2px #a5a5a5;
}
.text-center {
  text-align: center;
}
.text-danger {
  color: #ea644a;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: normal;
  padding-bottom: 0;
  padding-top: 5px;
}
h2 {
  font-size: 1.4em;
  margin: 0;
  padding: 0;
  margin-bottom: 0.5em;
  /* border-bottom: solid 2px #ccc; */
  padding-bottom: 0.5em;
}
</style>