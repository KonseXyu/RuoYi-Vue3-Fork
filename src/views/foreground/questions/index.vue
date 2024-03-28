<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="题目名称" prop="questionName">
            <el-input
                    v-model="queryParams.questionName"
                    placeholder="请输入题目名称"
                    clearable
                    @keyup.enter="handleQuery"
            />
        </el-form-item>
      <el-form-item label="题目类型" prop="questionType">
        <el-select v-model="queryParams.questionType" placeholder="请选择题目类型" clearable>
          <el-option
            v-for="dict in tbl_question_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['foreground:questions:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['foreground:questions:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['foreground:questions:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['foreground:questions:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="questionsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题目id" align="center" prop="questionId" />
      <el-table-column label="题目类型" align="center" prop="questionType">
        <template #default="scope">
          <dict-tag :options="tbl_question_type" :value="scope.row.questionType"/>
        </template>
      </el-table-column>
      <el-table-column label="题目名称" align="center" prop="questionName" />
      <el-table-column label="题目选项内容" align="center" prop="questionContent" />
      <el-table-column label="题目答案" align="center" prop="ans" />
      <el-table-column label="题目解析" align="center" prop="ansAnalysis" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['foreground:questions:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['foreground:questions:remove']">删除</el-button>
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

    <!-- 添加或修改题目对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="questionsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题目类型" prop="questionType">
          <el-select v-model="form.questionType" placeholder="请选择题目类型">
            <el-option
              v-for="dict in tbl_question_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目名称" prop="questionName">
          <el-input v-model="form.questionName" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="题目选项内容">
          <editor v-model="form.questionContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="题目答案" prop="ans">
          <el-input v-model="form.ans" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="题目解析" prop="ansAnalysis">
          <el-input v-model="form.ansAnalysis" type="textarea" placeholder="请输入内容" />
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

<script setup name="Questions">
import { listQuestions, getQuestions, delQuestions, addQuestions, updateQuestions } from "@/api/foreground/questions";

const { proxy } = getCurrentInstance();
const { tbl_question_type } = proxy.useDict('tbl_question_type');

const questionsList = ref([]);
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
    questionType: null,
    questionName: null,
  },
  rules: {
    questionType: [
      { required: true, message: "题目类型不能为空", trigger: "change" }
    ],
    questionName: [
      { required: true, message: "题目名称不能为空", trigger: "blur" }
    ],
    questionContent: [
      { required: true, message: "题目选项内容不能为空", trigger: "blur" }
    ],
    bookId: [
      { required: true, message: "书本id不能为空", trigger: "blur" }
    ],
    chapterId: [
      { required: true, message: "章节id不能为空", trigger: "blur" }
    ],
    version: [
      { required: true, message: "乐观锁不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询题目列表 */
function getList() {
  loading.value = true;
  listQuestions(queryParams.value).then(response => {
    questionsList.value = response.rows;
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
    questionId: null,
    questionType: null,
    questionName: null,
    questionContent: null,
    ans: null,
    ansAnalysis: null,
    bookId: null,
    chapterId: null,
    version: null
  };
  proxy.resetForm("questionsRef");
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
  ids.value = selection.map(item => item.questionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加题目";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _questionId = row.questionId || ids.value
  getQuestions(_questionId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改题目";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["questionsRef"].validate(valid => {
    if (valid) {
      if (form.value.questionId != null) {
        updateQuestions(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addQuestions(form.value).then(response => {
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
  const _questionIds = row.questionId || ids.value;
  proxy.$modal.confirm('是否确认删除题目编号为"' + _questionIds + '"的数据项？').then(function() {
    return delQuestions(_questionIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('foreground/questions/export', {
    ...queryParams.value
  }, `questions_${new Date().getTime()}.xlsx`)
}

getList();
</script>
