<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标签名" prop="tagName">
        <el-input
          v-model="queryParams.tagName"
          placeholder="请输入标签名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['foreground:tags:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['foreground:tags:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['foreground:tags:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['foreground:tags:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tagsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标签名" align="center" prop="tagName" />
      <el-table-column label="标签颜色" align="center" prop="tagColor" >
        <template #default="scope">
            <el-tag :color="scope.row.tagColor" >&nbsp&nbsp</el-tag>
            {{scope.row.tagColor}}
        </template>
      </el-table-column>
      <el-table-column label="标签阴影" align="center" prop="tagShadow" >
          <template #default="scope">
              <el-tag :color="scope.row.tagShadow" >&nbsp&nbsp</el-tag>
              {{scope.row.tagShadow}}
          </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['foreground:tags:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['foreground:tags:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改标签对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tagsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标签名" prop="tagName">
          <el-input v-model="form.tagName" placeholder="请输入标签名" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="tagColor">
<!--          <el-input v-model="form.tagColor" placeholder="请输入标签颜色" />-->
            <el-color-picker v-model="form.tagColor" show-alpha :predefine="predefineColors" />

        </el-form-item>
        <el-form-item label="标签阴影" prop="tagShadow">
            <el-color-picker v-model="form.tagShadow" show-alpha :predefine="predefineColors" />
<!--          <el-input v-model="form.tagShadow" placeholder="请输入标签阴影" />-->
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tags">
import { listTags, getTags, delTags, addTags, updateTags } from "@/api/foreground/tags";

const { proxy } = getCurrentInstance();

const tagsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    tagId: null,
    tagName: null,
  },
  rules: {
    tagName: [
      { required: true, message: "标签名不能为空", trigger: "blur" }
    ],
    tagColor: [
      { required: true, message: "标签颜色不能为空", trigger: "blur" }
    ],
    tagShadow: [
      { required: true, message: "标签阴影不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

const predefineColors = ref([
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577',
])

/** 查询标签列表 */
function getList() {
  loading.value = true;
  listTags(queryParams.value).then(response => {
    tagsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    tagId: null,
    tagName: null,
    tagColor: null,
    tagShadow: null
  };
  proxy.resetForm("tagsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.tagId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加标签";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _tagId = row.tagId || ids.value
  getTags(_tagId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改标签";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tagsRef"].validate(valid => {
    if (valid) {
      if (form.value.tagId != null) {
        updateTags(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTags(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _tagIds = row.tagId || ids.value;
  const _tagName = row.tagName || ids.value;
  proxy.$modal.confirm('是否确认删除"' + _tagName + '"的数据项？').then(function() {
    return delTags(_tagIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('foreground/tags/export', {
    ...queryParams.value
  }, `tags_${new Date().getTime()}.xlsx`)
}

getList();
</script>
