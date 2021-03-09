<template>
  <div id="icon">
    
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from "vue";
import * as icon from "@ant-design/icons-vue";
console.log(3334, icon);
export default defineComponent({
  name: "icon",
  props: {
    iconName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // 返回render函数
    return () => h(icon[props.iconName]);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
