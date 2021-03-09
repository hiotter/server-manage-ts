<template>
  <div class="container-normal container-new">
    <count-cards :items="countsList" />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, onMounted } from "vue";
import { MessageApi } from "ant-design-vue/lib/message";
import countCards from "@/components/count-cards.vue";
import api from "@/api/console";
import { CountsListProp } from "@/types/console";
export default defineComponent({
  name: "console",
  components: {
    countCards,
  },
  setup() {
    const message: MessageApi = inject("$message") as MessageApi;
    const countsList = ref<CountsListProp[]>([
      {
        icon: require("../../assets/icons/未处理投诉.png"),
        theme: "filled",
        bgColor: "#282c37",
        title: "我的员工",
        value: 999,
      },
    ]);
    const initDashboard = async () => {
      try {
        const { counts } = await api.getDashboard();
        for (let i = 0; i < counts.length; i++) {
          countsList.value[i].value = counts[i];
        }
      } catch (err) {
        message.error(err.message);
      }
    };

    const getData = async () => {
      initDashboard();
    };

    onMounted(() => {
      getData();
    });

    return {
      initDashboard,
      countsList,
    };
  },
});
</script>

<style scoped>
@media screen and (max-width: 1650px) {
  .container-new {
    min-width: 1410px;
    display: inline-block;
  }
}

.custom-filter-dropdown {
  padding: 8px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.ant-upload img {
  width: 104px;
  height: 104px;
}
</style>
