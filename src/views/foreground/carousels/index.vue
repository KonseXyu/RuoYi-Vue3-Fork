<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="carouselTitle">
        <el-input
          v-model="queryParams.carouselTitle"
          placeholder="请输入轮播图标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="更新时间" prop="updateTime">
        <el-date-picker clearable
          v-model="queryParams.updateTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择更新时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker clearable
          v-model="queryParams.createTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新人" prop="updateBy">
        <el-input
          v-model="queryParams.updateBy"
          placeholder="请输入更新人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入创建人"
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
          v-hasPermi="['foreground:carousels:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['foreground:carousels:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['foreground:carousels:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['foreground:carousels:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="carouselsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="轮播图id" align="center" prop="carouselId" />
      <el-table-column label="轮播图标题" align="center" prop="carouselTitle" />
      <el-table-column label="轮播图预览" align="center" prop="carouselUrl" >
          <template #default="scope">
              <image-preview :src="scope.row.carouselUrl" :width="200" :height="100" />
          </template>
      </el-table-column>
      <el-table-column label="轮播图描述" align="center" prop="carouselDescribe" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
      </el-table-column>
        <el-table-column label="更新人" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
              <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['foreground:carousels:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['foreground:carousels:remove']">删除</el-button>
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

    <!-- 添加或修改轮播图图片对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="carouselsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="carouselTitle">
          <el-input v-model="form.carouselTitle" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="图片" prop="carouselUrl">
            <image-upload
                    v-model="form.carouselUrl"
                    :limit="1"
            />
        </el-form-item>
        <el-form-item label="描述" prop="carouselDescribe">
          <el-input v-model="form.carouselDescribe" type="textarea" placeholder="请输入内容" />
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

<script setup name="Carousels">
import { listCarousels, getCarousels, delCarousels, addCarousels, updateCarousels } from "@/api/foreground/carousels";
import ImageUpload from "@/components/ImageUpload/index.vue";
import ImagePreview from "@/components/ImagePreview/index.vue";

const { proxy } = getCurrentInstance();

const carouselsList = ref([]);
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
    pageSize: 10,
    carouselTitle: null,
    carouselUrl: null,
    updateTime: null,
    createTime: null,
    updateBy: null,
    createBy: null
  },
  rules: {
    carouselTitle: [
      { required: true, message: "轮播图标题不能为空", trigger: "blur" }
    ],
    carouselUrl: [
      { required: true, message: "轮播图路径不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询轮播图图片列表 */
function getList() {
  loading.value = true;
  listCarousels(queryParams.value).then(response => {
    carouselsList.value = response.rows;
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
    carouselId: null,
    carouselTitle: null,
    carouselUrl: null,
    carouselDescribe: null,
    version: null,
    updateTime: null,
    createTime: null,
    updateBy: null,
    createBy: null
  };
  proxy.resetForm("carouselsRef");
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
  ids.value = selection.map(item => item.carouselId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加轮播图图片";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _carouselId = row.carouselId || ids.value
  getCarousels(_carouselId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改轮播图图片";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["carouselsRef"].validate(valid => {
    if (valid) {
      if (form.value.carouselId != null) {
        updateCarousels(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCarousels(form.value).then(response => {
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
  const _carouselIds = row.carouselId || ids.value;
  proxy.$modal.confirm('是否确认删除轮播图图片编号为"' + _carouselIds + '"的数据项？').then(function() {
    return delCarousels(_carouselIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('foreground/carousels/export', {
    ...queryParams.value
  }, `carousels_${new Date().getTime()}.xlsx`)
}

getList();
</script>
