<template>
  <div class="container-normal container-new">
    <div class="d-flex a-center mb-2">
      <a-button type="primary" @click="callCreate">创建员工</a-button>
      <a-button type="primary" class="ml-auto" @click="refresh()"
        >刷新表格</a-button
      >
    </div>
    <a-table
      :data-source="staffs"
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
      <template #avatar="record">
        <img
          :src="record.record.avatar"
          alt=""
          style="width: 60px; height: 60px; cursor: pointer; object-fit: cover"
          @click="avatarHandlePreview(record.record.avatar)"
        />
        <a-modal
          :visible="previewVisibleAvatar"
          :footer="null"
          @cancel="handleCancelAvatar"
        >
          <img alt="example" style="width: 100%" :src="avatarPreviewImage" />
        </a-modal>
      </template>
      <template #role="record">
        {{ record.role.name }}
      </template>
      <template #action="record">
        <a-button
          type="dashed"
          class="mr-1"
          @click="callEdit(record.record)"
          v-permission:btn="'1-0'"
          >编辑</a-button
        >
        <a-button
          type="primary"
          class="mr-1"
          @click="callReset(record.record)"
          v-permission:btn="'1-1'"
          >重置密码</a-button
        >
        <a-button
          type="danger"
          @click="callDelete(record.record)"
          v-permission:btn="'1-2'"
          >删除</a-button
        >
      </template>
    </a-table>
    <!-- 编辑界面 -->
    <a-modal
      v-model:visible="modal"
      :title="modalState === 'edit' ? '编辑员工' : '创建员工'"
      width="600px"
      :destroyOnClose="true"
      centered
      @ok="callSave"
      @cancel="callCancel"
      okText="确定"
      cancelText="取消"
    >
      <div class="mb-1">
        <a-radio-group buttonStyle="solid" v-model:value="staff.role._id">
          <a-radio-button
            :value="item.value"
            v-for="item in roles"
            :key="item.text"
            >{{ item.text }}</a-radio-button
          >
        </a-radio-group>
      </div>
      <div class="mb-1">
        <div>
          <a-input
            placeholder="请输入姓名"
            addon-before="姓名"
            v-model:value="staff.name"
            class="mb-1"
          >
          </a-input>
          <a-input
            placeholder="Nickname"
            addon-before="昵称"
            v-model:value="staff.nickname"
            class="mb-1"
          >
          </a-input>
        </div>
        <div v-if="modalState === 'create'">
          <a-input
            placeholder="请输入用户名"
            v-model:value="staff.username"
            addon-before="用户名"
            :addon-after="email"
            class="mb-1"
          >
          </a-input>
          <a-input
            placeholder="请输入密码"
            v-model:value="staff.password"
            addon-before="密码"
            addon-after="(默认值 12345678 请自行修改)"
          >
          </a-input>
        </div>
      </div>
      <div>
        <div style="width: 100px" class="mb-1">员工头像</div>
        <div class="clearfix">
          <a-upload
            name="picture"
            :action="action + '/uploadsImgLimit'"
            list-type="picture-card"
            :data="{ project: 'marryTest' }"
            v-model:file-list="fileListAvatar"
            @preview="handlePreviewAvatar"
            @change="handleChangeAvatar"
          >
            <div v-if="fileListAvatar.length < 1">
              <plus-outlined />
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
          <a-modal
            :visible="previewVisible"
            :footer="null"
            @cancel="handleCancel"
          >
            <img alt="example" style="width: 100%" :src="previewImage" />
          </a-modal>
        </div>
      </div>
    </a-modal>
    <!-- 重置密码 -->
    <a-modal
      :title="'重置密码'"
      width="400px"
      :destroyOnClose="true"
      centered
      :visible="resetModal"
      @ok="callResetPassword"
      @cancel="resetModal = false"
      okText="确定"
      cancelText="取消"
    >
      <div class="d-flex a-center">
        <a-input
          addonBefore="新密码"
          placeholder="请输入新密码"
          v-model:value="staff.password"
        />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import api from "@/api/staff";
import {
  defineComponent,
  inject,
  onMounted,
  ref,
  computed,
  reactive,
} from "vue";
import { MessageApi } from "ant-design-vue/lib/message";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import {
  FilterProp,
  StaffProp,
  RoleProp,
  PaginationProp,
  FileProp,
  FileInfo,
} from "@/types/user";
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
export default defineComponent({
  name: "Login-Log",
  components: {
    SearchOutlined,
    PlusOutlined,
  },
  setup() {
    const message: MessageApi = inject("$message") as MessageApi;
    const filters = ref<FilterProp>({ role: [], name: [] });
    const searchInput = ref();
    const staffs = ref<StaffProp[]>([]);
    const previewVisible = ref<boolean>(false);
    const previewVisibleAvatar = ref<boolean>(false);
    const avatarPreviewImage = ref<string>("");
    const previewImage = ref<string | undefined>("");
    const email = process.env.VUE_APP_BASE_EMAIL;
    const staff = ref<StaffProp>({
      name: "",
      username: "",
      nickname: "",
      role: { name: "", _id: "" },
    });
    const state = reactive({
      searchText: "",
      searchedColumn: "",
    });
    const roles = ref<RoleProp[]>([]);
    const modal = ref<boolean>(false);
    const modalState = ref<string>("");
    const resetModal = ref<boolean>(false);
    const fileListAvatar = ref<FileProp[]>([]);
    const action = process.env.VUE_APP_BASE_ACTION;

    const initFilters = () => {
      filters.value = {
        name: [],
        role: [],
      };
    };
    const pagination = ref<PaginationProp>({
      current: 1,
      pageSize: 5,
      total: 0,
    });

    const queryRoles = async () => {
      const res = await api.getRoles();
      roles.value = res.data.map((role: RoleProp) => {
        return {
          text: role.name,
          value: role._id,
        };
      });
    };

    const queryStaffs = async () => {
      try {
        const { current, pageSize } = pagination.value;
        const res = await api.getStaffs(filters.value, current, pageSize);
        const payload = res.data;
        const total = res.total;
        staffs.value = [...payload];
        pagination.value = { ...pagination.value, total };
        console.log(pagination.value);
      } catch (err) {
        staffs.value = [];
        pagination.value = { ...pagination.value, total: 0 };
        message.error(err.message);
      }
    };

    const refresh = (pag?: PaginationProp) => {
      initFilters();
      pagination.value = {
        current: pag ? pag.current : 1,
        pageSize: pag ? pag.pageSize : 5,
      };
      queryRoles();
      queryStaffs();
    };

    const callCreate = () => {
      modal.value = true;
      modalState.value = "create";
      console.log(modal.value);
      staff.value = {
        nickname: "",
        name: "",
        username: "",
        password: "12345678",
        role: {
          name: "",
          _id: "",
        },
      };
    };

    const callEdit = (record: StaffProp) => {
      console.log(444, record);
      modal.value = true;
      modalState.value = "edit";
      staff.value = {
        ...ref(record).value,
      };

      fileListAvatar.value[0] = {
        uid: "-1",
        name: "image.png",
        status: "done",
        url: ref(record).value.avatar ? ref(record).value.avatar : "",
      };
    };

    const callCancel = () => {
      modal.value = false;
      staff.value = {
        name: "",
        username: "",
        nickname: "",
        avatar: "",
        role: { name: "", _id: "" },
      };
      fileListAvatar.value = [];
    };

    const callSave = async () => {
      if (modalState.value === "create") {
        if (
          !staff.value.name ||
          !staff.value.username ||
          !staff.value.password ||
          (staff.value.role ? !staff.value.role._id : false)
        ) {
          return message.error("请填写完整信息");
        }
      }
      if (modalState.value === "edit") {
        if (!staff.value.name || !staff.value.role) {
          return message.error("请填写完整信息");
        }
      }
      try {
        if (modalState.value === "create") {
          const payload = {
            nickname: staff.value.nickname,
            name: staff.value.name,
            username: staff.value.username + email,
            role: staff.value.role,
            password: staff.value.password,
            avatar:
              fileListAvatar.value.length > 0
                ? fileListAvatar.value[0].url
                : "",
          };
          console.log(5555, fileListAvatar.value);
          await api.createStaff(payload);
          message.success("创建成功");
        }
        if (modalState.value === "edit") {
          const payload = {
            nickname: staff.value.nickname,
            name: staff.value.name,
            username: staff.value.username,
            role: staff.value.role,
            avatar:
              fileListAvatar.value.length > 0
                ? fileListAvatar.value[0].url
                : "",
          };
          await api.updateStaff(
            staff.value._id ? staff.value._id : "",
            payload
          );
          message.success("修改成功");
        }
        refresh(pagination.value);
        callCancel();
      } catch (err) {
        message.error(err.message);
      }
    };

    const callReset = (record: StaffProp) => {
      staff.value = {
        ...ref(record).value,
      };
      resetModal.value = true;
    };

    const handleChange = (pag: PaginationProp, fil: FilterProp) => {
      console.log(55555, filters);
      filters.value = fil;
      // 处理分页
      const pager = { ...pag };
      pager.current = pag.current;
      pagination.value = pager;
      queryStaffs();
    };

    const callResetPassword = async () => {
      try {
        console.log(staff.value);
        await api.resetPassword(
          staff.value._id ? staff.value._id : "",
          staff.value.password ? staff.value.password : ""
        );
        message.success("密码重置成功");
      } catch (err) {
        message.error(err.message);
      }
      resetModal.value = false;
    };

    const callDelete = async (record: StaffProp) => {
      Modal.confirm({
        title: `确定要删除该员工：${record.name}?`,
        onOk: async () => {
          try {
            await api.deleteStaff(record._id ? record._id : "");
            refresh(pagination.value);
            message.success("删除成功");
          } catch (err) {
            message.error(err.message);
          }
        },
        okText: "确认",
        cancelText: "取消",
      });
    };

    const handleCancel = () => {
      previewVisible.value = false;
    };

    const handlePreviewAvatar = async (file: FileProp) => {
      if (!file.url && !file.preview) {
        file.preview = (await getBase64(file.originFileObj)) as string;
      }
      previewImage.value = file.url || file.preview;
      previewVisible.value = true;
    };

    const handleChangeAvatar = ({ fileList: newFileList }: FileInfo) => {
      newFileList = newFileList.map((file) => {
        if (file.response) {
          file.url = file.response.imageUrl;
        }
        return file;
      });
      fileListAvatar.value = newFileList;
    };

    const handleCancelAvatar = () => {
      previewVisibleAvatar.value = false;
    };
    const avatarHandlePreview = (url: string) => {
      //列表预览头像
      avatarPreviewImage.value = url;
      previewVisibleAvatar.value = true;
    };

    const handleSearch = (
      selectedKeys: string,
      confirm: any,
      dataIndex: string
    ) => {
      // console.log(selectedKeys,dataIndex)
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = (clearFilters: any) => {
      clearFilters();
      state.searchText = "";
    };

    const getData = async () => {
      queryStaffs();
      queryRoles();
    };

    onMounted(() => {
      getData();
    });

    const columns = computed(() => {
      return [
        {
          title: "用户名",
          dataIndex: "name",
          key: "name",
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
        },
        {
          title: "昵称",
          dataIndex: "nickname",
          key: "nickname",
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
        },
        {
          title: "角色",
          key: "role.name",
          dataIndex: "role.name",
          align: "center",
          filters: roles.value,
          filteredValue: filters.value.role,
          width: 140,
        },
        {
          title: "账号",
          key: "username",
          dataIndex: "username",
          align: "center",
        },
        {
          title: "员工头像",
          key: "avatar",
          dataIndex: "avatar",
          slots: {
            customRender: "avatar",
          },
          align: "center",
        },
        {
          title: "操作",
          key: "action",
          slots: { customRender: "action" },
          width: 300,
          align: "center",
        },
      ];
    });

    return {
      // 集中控制过滤
      filters: {
        username: [],
        name: [],
      },
      email,
      SearchOutlined,
      columns,
      modal,
      resetModal,
      modalState,
      staffs,
      staff,
      roles,
      pagination,
      handleChange,
      callCreate,
      callCancel,
      callReset,
      callEdit,
      callSave,
      callResetPassword,
      callDelete,
      previewVisible,
      previewImage,
      fileListAvatar,
      handleCancel,
      handlePreviewAvatar,
      handleChangeAvatar,
      refresh,
      avatarHandlePreview,
      avatarPreviewImage,
      previewVisibleAvatar,
      handleCancelAvatar,
      handleSearch,
      handleReset,
      action,
    };
  },
});
</script>

<style scoped>
@media screen and (max-width: 1250px) {
  .container-new {
    min-width: 1010px;
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
