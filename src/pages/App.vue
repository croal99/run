<template>
  <div class="container">
      <router-view></router-view>
  </div>
</template>
<script type="text/javascript">
export default {
  name: "page",
  created() {
    console.log("app2 create");
  }
};
</script>
