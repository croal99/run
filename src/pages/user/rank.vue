<template>
  <div class="setting-page">
    <!-- head begin -->
    <div class="main-title-box">
      <span></span>
    </div>
    <router-link to="/checkpoint/list" class="back-box"></router-link>
    <!-- head end -->
    <div class="info-content-box">
        <div class="dialog3 animated fadeIn">
            <iframe :src="iframeurl">
            <p>Your browser does not support iframes.</p>
            </iframe>
        </div>
    </div>
  </div>
</template>

<script>
import { Indicator } from "mint-ui";

export default {
  data() {
    return {
        iframeurl:"https://game.591cms.com/api3/user_rank?code="+this.$store.state.game_config.game_code+"&id="+this.$store.state.user_info.openid
    };
  },
  created() {},
  mounted() {
  },
  methods: {}
};
</script>

