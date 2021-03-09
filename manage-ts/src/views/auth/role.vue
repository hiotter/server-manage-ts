<template>
  <div class="container-normal container-new">
    <a-button type="primary" @click="callCreate">创建角色</a-button>
    <!-- {{ roles }} -->
    <a-table
      class="mt-2"
      :columns="columns"
      :dataSource="roles"
      rowKey="name"
      bordered
      :pagination="false"
    >
      <template #action="record">
        <div v-if="record.record.name !== '管理员'">
          <a-button type="dashed" class="mr-1" @click="callEdit(record.record)"
            >编辑</a-button
          >
          <a-button
            type="danger"
            @click="callDelete(record.record)"
            :disabled="record.record.staffsCount !== 0"
            >删除</a-button
          >
        </div>
      </template>
    </a-table>
    <!-- 编辑界面 -->
    <a-modal
      :title="modal === 'edit' ? '编辑角色' : '创建角色'"
      width="800px"
      :destroyOnClose="true"
      centered
      :visible="modal !== ''"
      @ok="callSave"
      @cancel="callCancel"
      :confirmLoading="processing"
    >
      <a-input
        addonBefore="名称"
        placeholder="角色名称"
        v-model:value="role.name"
        class="mb-1"
      />
      <a-input
        addonBefore="描述"
        placeholder="描述"
        v-model:value="role.desc"
      />
      <div class="d-flex mt-3">
        <div class="flex-1 d-flex flex-column a-center">
          <div style="font-weight: bold; color: black">页面级权限分配</div>
          <a-tree
            checkable
            @expand="onExpandPageLevel"
            :expandedKeys="pageLevel.expandedKeys"
            :autoExpandParent="pageLevel.autoExpandParent"
            v-model:checkedKeys="pageLevel.checkedKeys"
            @select="onSelectPageLevel"
            :selectedKeys="pageLevel.selectedKeys"
            :treeData="pageLevel.treeData"
            @check="onCheckPageLevel"
          />
        </div>
        <div class="flex-1 d-flex flex-column a-center">
          <div style="font-weight: bold; color: black">按钮级权限分配</div>
          <a-tree
            checkable
            @expand="onExpandButtonLevel"
            :expandedKeys="buttonLevel.expandedKeys"
            :autoExpandParent="buttonLevel.autoExpandParent"
            v-model:checkedKeys="buttonLevel.checkedKeys"
            @select="onSelectButtonLevel"
            :selectedKeys="buttonLevel.selectedKeys"
            :treeData="buttonLevel.treeData"
            @check="onCheckButtonLevel"
          />
        </div>
        <div class="flex-1 d-flex flex-column a-center">
          <div style="font-weight: bold; color: black">内容级权限分配</div>
          <a-tree
            checkable
            @expand="onExpandContentLevel"
            :expandedKeys="contentLevel.expandedKeys"
            :autoExpandParent="contentLevel.autoExpandParent"
            v-model:checkedKeys="contentLevel.checkedKeys"
            @select="onSelectContentLevel"
            :selectedKeys="contentLevel.selectedKeys"
            :treeData="contentLevel.treeData"
            @check="onCheckContentLevel"
          />
        </div>
        <div class="flex-1 d-flex flex-column a-center">
          <div style="font-weight: bold; color: black" class="mb-1">
            其他权限
          </div>
          <a-checkbox-group
            :defaultValue="role.othersAuths"
            @change="onChangeOthers"
          >
            <a-row>
              <a-col
                :span="24"
                v-for="(other, index) in othersAuths"
                :key="index"
                ><a-checkbox :value="other">{{ other }}</a-checkbox></a-col
              >
            </a-row>
          </a-checkbox-group>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import api from "@/api/role";
import { asyncRoutes } from "@/router/routes";
import { defineComponent, inject, onMounted, ref } from "vue";
import { buttonsAuthsMap, contentsAuthsMap, othersAuthsMap } from "../../directive/permission";
import { MessageApi } from "ant-design-vue/lib/message";
import { RouteRecordRaw } from "vue-router";
import { uniq } from "lodash";
import { RoleProp, PageLevelProp, ChildrenProp } from "../../types/role";

const renderPageTree = (routes: RouteRecordRaw[]) => {
  return routes.map((route) => {
    return {
      title: route.name,
      key: route.name,
      children: route.children
        ? route.children.map((child) => {
            return {
              title: child.name,
              key: child.name,
            };
          })
        : "",
    };
  });
};
const renderButtonTree = () => {
  return buttonsAuthsMap;
};
const renderContentTree = () => {
  return contentsAuthsMap;
};

export default defineComponent({
  name: "Role",
  setup() {
    const message: MessageApi = inject("$message") as MessageApi;
    const roles = ref<RoleProp[]>([]);
    const modal = ref<string>("");
    const processing = ref<boolean>(false);
    const role = ref<RoleProp>({
      name: "",
      desc: "",
      routesAuths: [],
      buttonsAuths: [],
      contentsAuths: [],
      othersAuths: [],
    });
    const pageLevel = ref<PageLevelProp>({
      treeData: [
        {
          key: "",
          title: "",
          children: [],
        },
      ],
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
    });
    const buttonLevel = ref<PageLevelProp>({
      treeData: [
        {
          key: "",
          title: "",
          children: [],
        },
      ],
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
    });
    const contentLevel = ref<PageLevelProp>({
      treeData: [
        {
          key: "",
          title: "",
          children: [],
        },
      ],
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
    });

    const initPageLevel = (routesAuths: string[]) => {
      const treeData = renderPageTree(
        asyncRoutes.filter((route) => route.name !== "权限管理")
      );
      let checkedKeys = [...routesAuths];
      treeData.forEach((item) => {
        if (item.children) {
          if (!(item.children as ChildrenProp[]).every((child) => routesAuths.includes(child.key as string))) {
            checkedKeys = checkedKeys.filter((k) => k !== item.key);
          }
        }
      });
      pageLevel.value = {
        treeData: treeData,
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [...checkedKeys],
        selectedKeys: [],
      };
    };

    const initButtonLevel = (buttonsAuths: string[]) => {
      const treeData = renderButtonTree();
      let checkedKeys = [...buttonsAuths];
      treeData.forEach((item) => {
        if (item.children) {
          if (
            !item.children.every((child) => buttonsAuths.includes(child.key))
          ) {
            checkedKeys = checkedKeys.filter((k) => k !== item.key);
          }
        }
      });
      buttonLevel.value = {
        treeData: treeData,
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [...checkedKeys],
        selectedKeys: [],
      };
    };

    const initContentLevel = (contentsAuths: string[]) => {
      const treeData = renderContentTree();
      let checkedKeys = [...contentsAuths];
      treeData.forEach((item) => {
        if (item.children) {
          if (
            !item.children.every((child) => contentsAuths.includes(child.key))
          ) {
            checkedKeys = checkedKeys.filter((k) => k !== item.key);
          }
        }
      });
      contentLevel.value = {
        treeData: treeData,
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [...checkedKeys],
        selectedKeys: [],
      };
    };

    const onExpandPageLevel = (expandedKeys: string[]) => {
      pageLevel.value.expandedKeys = expandedKeys;
      pageLevel.value.autoExpandParent = false;
    };

    const onSelectPageLevel = (selectedKeys: string[]) => {
      pageLevel.value.selectedKeys = selectedKeys;
    };

    const onCheckPageLevel = (checkedKeys: string[]) => {
      pageLevel.value.checkedKeys = checkedKeys;
    };

    const onExpandButtonLevel = (expandedKeys: string[]) => {
      buttonLevel.value.expandedKeys = expandedKeys;
      buttonLevel.value.autoExpandParent = false;
    };

    const onSelectButtonLevel = (selectedKeys: string[]) => {
      buttonLevel.value.selectedKeys = selectedKeys;
    };

    const onCheckButtonLevel = (checkedKeys: string[]) => {
      buttonLevel.value.checkedKeys = checkedKeys;
    };

    const onExpandContentLevel = (expandedKeys: string[]) => {
      contentLevel.value.expandedKeys = expandedKeys;
      contentLevel.value.autoExpandParent = false;
    };

    const onSelectContentLevel = (selectedKeys: string[]) => {
      contentLevel.value.selectedKeys = selectedKeys;
    };

    const onCheckContentLevel = (checkedKeys: string[]) => {
      contentLevel.value.checkedKeys = checkedKeys;
    };

    const onChangeOthers = (checkedValues: string[]) => {
      role.value.othersAuths = checkedValues;
    };

    const queryRoles = async () => {
      try {
        const res = await api.getRoles();
        roles.value = [...res.data];
      } catch (err) {
        message.error(err.message);
      }
    };

    const callCreate = () => {
      modal.value = "create";
      role.value = {
        name: "",
        desc: "",
        routesAuths: [],
        buttonsAuths: [],
        contentsAuths: [],
        othersAuths: [],
      };
      initPageLevel(role.value.routesAuths);
      initButtonLevel(role.value.buttonsAuths);
      initContentLevel(role.value.contentsAuths);
    };

    const callEdit = (record: RoleProp) => {
      modal.value = "edit";
      role.value = { ...ref(record).value };
      initPageLevel(role.value.routesAuths);
      initButtonLevel(role.value.buttonsAuths);
      initContentLevel(role.value.contentsAuths);
    };

    const callSave = async () => {
      if (!role.value.name || !role.value.desc) {
        return message.error("请填写名称以及描述");
      }
      processing.value = true;
      let routesAuths: (string | symbol | undefined)[] = [];
      pageLevel.value.treeData.forEach((item) => {
        if (item.children && typeof item.children != "string") {
          item.children.forEach((child) => {
            if (
              pageLevel.value.checkedKeys.includes(
                child.key ? child.key.toString() : ""
              )
            ) {
              routesAuths = [...routesAuths, item.key];
            }
          });
        }
      });
      let buttonsAuths: (string | symbol | undefined)[] = [];
      buttonLevel.value.treeData.forEach((item) => {
        if (item.children && typeof item.children != "string") {
          item.children.forEach((child) => {
            if (
              buttonLevel.value.checkedKeys.includes(
                child.key ? child.key.toString() : ""
              )
            ) {
              buttonsAuths = [...buttonsAuths, item.key];
            }
          });
        }
      });
      let contentsAuths: (string | symbol | undefined)[] = [];
      contentLevel.value.treeData.forEach((item) => {
        if (item.children && typeof item.children != "string") {
          item.children.forEach((child) => {
            if (
              contentLevel.value.checkedKeys.includes(
                child.key ? child.key.toString() : ""
              )
            ) {
              contentsAuths = [...contentsAuths, item.key];
            }
          });
        }
      });
      routesAuths = uniq([...routesAuths, ...pageLevel.value.checkedKeys]);
      buttonsAuths = uniq([...buttonsAuths, ...buttonLevel.value.checkedKeys]);
      contentsAuths = uniq([
        ...contentsAuths,
        ...contentLevel.value.checkedKeys,
      ]);

      try {
        const payload: RoleProp = {
          name: role.value.name,
          desc: role.value.desc,
          routesAuths: routesAuths as string[],
          buttonsAuths: buttonsAuths as string[],
          contentsAuths: contentsAuths as string[],
          othersAuths: role.value.othersAuths,
        };

        if (modal.value === "create") {
          await api.createRole(payload);
          message.success("创建成功");
        }
        if (modal.value === "edit") {
          await api.updateRole(role.value._id, payload);
          message.success("修改成功");
        }
        processing.value = false;
        modal.value = "";
        role.value = {
          name: "",
          desc: "",
          routesAuths: [],
          buttonsAuths: [],
          contentsAuths: [],
          othersAuths: [],
        };
      } catch (err) {
        message.error(err.message);
        processing.value = false;
      }
      await queryRoles();
    };

    const callCancel = () => {
      modal.value = "";
      role.value = {
        name: "",
        desc: "",
        routesAuths: [],
        buttonsAuths: [],
        contentsAuths: [],
        othersAuths: [],
      };
    };

    const callDelete = async (record: RoleProp) => {
      processing.value = true;
      try {
        await api.deleteRole(record._id);
        roles.value = roles.value.filter((item) => item._id != record._id);
        message.success("删除成功");
      } catch (err) {
        message.error(err.message);
      }
      processing.value = false;
    };

    const getData = async () => {
      queryRoles();
    };

    onMounted(() => {
      getData();
    });

    return {
      columns: [
        {
          title: "名称",
          key: "name",
          dataIndex: "name",
          width: 200,
        },
        {
          title: "描述",
          key: "desc",
          dataIndex: "desc",
        },
        {
          title: "包含员工数",
          key: "staffsCount",
          dataIndex: "staffsCount",
          width: 120,
          align: "center",
        },
        {
          title: "操作",
          key: "action",
          slots: { customRender: "action" },
          width: 200,
          align: "center",
        },
      ],
      roles,
      role,
      modal,
      processing,
      pageLevel,
      buttonLevel,
      contentLevel,
      othersAuths: othersAuthsMap,
      callCreate,
      callEdit,
      callSave,
      callCancel,
      callDelete,
      onExpandPageLevel,
      onSelectPageLevel,
      onCheckPageLevel,
      onExpandButtonLevel,
      onSelectButtonLevel,
      onExpandContentLevel,
      onSelectContentLevel,
      onChangeOthers,
      onCheckButtonLevel,
      onCheckContentLevel,
    };
  },
});
</script>

<style>
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
