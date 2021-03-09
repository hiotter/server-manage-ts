<template>
  <div class="container-normal container-new">
    <div class="d-flex a-center mb-2">
      <a-button type="primary" class="ml-auto" @click="refresh"
        >刷新表格</a-button
      >
    </div>
    <a-table
      :data-source="records"
      :columns="columns"
      @change="handleChange"
      :pagination="pagination"
      bordered
      rowKey="_id"
    >
      <template
        #filterDropdown="{
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          column,
        }"
      >
        <div style="padding: 8px">
          <a-input
            ref="searchInput"
            :placeholder="`Search ${column.dataIndex}`"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="
              (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
            "
            @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
            type="primary"
            size="small"
            style="width: 90px; margin-right: 8px"
            @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
          >
            <template #icon><SearchOutlined /></template>
            Search
          </a-button>
          <a-button
            size="small"
            style="width: 90px"
            @click="handleReset(clearFilters)"
          >
            Reset
          </a-button>
        </div>
      </template>
      <template #filterIcon="filtered">
        <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
      </template>

      <template #time="{ record }">
        <a-tag color="green" v-if="record.status != 'fail'">{{
          dayjs(record.time).format("YYYY年MM月DD日 HH:mm:ss")
        }}</a-tag>
        <a-tag color="red" v-else
          >{{ dayjs(record.time).format("YYYY年MM月DD日 HH:mm:ss") }}
          {{ record.error }}</a-tag
        >
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import api from "@/api/log";
import {
  defineComponent,
  inject,
  onMounted,
  ref,
  computed,
  reactive,
} from "vue";
import { MessageApi } from "ant-design-vue/lib/message";
import { SearchOutlined } from "@ant-design/icons-vue";
import {
  ResOperaProp,
  OperatiomProp,
  PaginationProp,
  FilterOpreationProp,
} from "@/types/log";
import dayjs from "dayjs";

export default defineComponent({
  name: "Login-Log",
  components: {
    SearchOutlined,
  },
  setup() {
    const message: MessageApi = inject("$message") as MessageApi;
    const filters = ref<FilterOpreationProp>({
      username: [],
      name: [],
      module: [],
      type: [],
      operator: [],
      contents: [],
    });
    const searchInput = ref();
    const state = reactive({
      searchText: "",
      searchedColumn: "",
    });
    const initFilters = () => {
      filters.value = {
        username: [],
        name: [],
        module: [],
        type: [],
        operator: [],
        contents: [],
      };
    };
    const pagination = ref<PaginationProp>({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    const records = ref<OperatiomProp[]>([]);

    const queryRecords = async () => {
      try {
        const { current, pageSize } = pagination.value;
        const res: ResOperaProp = await api.getOperationRecords(
          filters.value,
          current,
          pageSize
        );
        const total = res.total;
        records.value = [...res.data];
        pagination.value = { ...pagination.value, total };
      } catch (err) {
        records.value = [];
        pagination.value = { ...pagination.value, total: 0 };
        message.error(err.message);
      }
    };

    const getData = async () => {
      queryRecords();
    };

    onMounted(() => {
      getData();
    });

    const handleSearch = (
      selectedKeys: string,
      confirm: any,
      dataIndex: string
    ) => {
      console.log(5555, selectedKeys);
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };
    const handleChange = (pag: PaginationProp, fil: FilterOpreationProp) => {
      filters.value = fil;
      console.log(filters.value);
      // 处理分页
      const pager = { ...pag };
      pager.current = pag.current;
      pagination.value = pager;
      queryRecords();
    };
    const handleReset = (clearFilters: any) => {
      clearFilters();
      state.searchText = "";
    };

    const columns = computed(() => {
      return [
        {
          title: "模块名称",
          key: "module",
          dataIndex: "module",
          filters: [
            {
              text: "员工管理",
              value: "员工管理",
            },
          ],
          filteredValue: filters.value.module,
        },
        {
          title: "操作类型",
          key: "type",
          dataIndex: "type",
          align: "center",
          filters: [
            {
              text: "创建",
              value: "创建",
            },
            {
              text: "修改",
              value: "修改",
            },
            {
              text: "删除",
              value: "删除",
            },
          ],
          filteredValue: filters.value.type,
          width: 110,
        },
        {
          title: "内容",
          key: "contents",
          dataIndex: "contents",
          slots: {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
            customRender: "customRender",
          },
          onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
              setTimeout(() => {
                searchInput.value.focus();
              }, 0);
            }
          },
          filteredValue: filters.value.contents,
        },
        {
          title: "操作者",
          key: "operator",
          dataIndex: "operator",
          slots: {
            filterDropdown: "filterDropdown",
            filterIcon: "filterIcon",
            customRender: "customRender",
          },
          onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
              setTimeout(() => {
                searchInput.value.focus();
              }, 0);
            }
          },
          filteredValue: filters.value.operator,
          width: 110,
        },
        {
          title: "登录时间",
          key: "time",
          dataIndex: "time",
          slots: { customRender: "time" },
          width: 200,
          align: "center",
        },
      ];
    });

    const refresh = () => {
      initFilters();
      state.searchText = "";
      state.searchedColumn = "";

      pagination.value = {
        current: 1,
        pageSize: 10,
      };
      queryRecords();
    };
    return {
      pagination,
      records,
      columns,
      refresh,
      dayjs,
      searchInput,
      handleSearch,
      handleChange,
      handleReset,
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
</style>
