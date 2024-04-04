<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="书籍名字" prop="bookName">
        <el-input
          v-model="queryParams.bookName"
          placeholder="请输入书籍名字"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="书籍作者" prop="bookAuthor">
        <el-input
          v-model="queryParams.bookAuthor"
          placeholder="请输入书籍作者"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="书籍封面" prop="bookCover">
        <el-input
          v-model="queryParams.bookCover"
          placeholder="请输入书籍封面"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="ISBN" prop="bookIsbn">
        <el-input
          v-model="queryParams.bookIsbn"
          placeholder="请输入书籍ISBN号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="更新时间" prop="lastUpdate">
          <el-date-picker clearable
                          v-model="queryParams.lastUpdate"
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
          v-hasPermi="['foreground:books:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['foreground:books:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['foreground:books:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['foreground:books:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="booksList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="书籍id" align="center" prop="bookId" />
      <el-table-column label="书籍名字" align="center" prop="bookName" />
      <el-table-column label="书籍作者" align="center" prop="bookAuthor" />
      <el-table-column label="书籍封面" align="center" prop="bookCover" >
        <template #default="scope">
            <image-preview :width=40 :height=50 :src="scope.row.bookCover" />
        </template>
      </el-table-column>
      <el-table-column label="书籍ISBN号" align="center" prop="bookIsbn" />
      <el-table-column label="书籍简介" align="center" prop="bookSummary" show-overflow-tooltip/>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="lastUpdate" width="180">
          <template #default="scope">
              <span>{{ parseTime(scope.row.lastUpdate, '{y}-{m}-{d}') }}</span>
          </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['foreground:books:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['foreground:books:remove']">删除</el-button>
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

    <!-- 添加或修改书籍信息对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="booksRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="书籍名字" prop="bookName">
          <el-input v-model="form.bookName" placeholder="请输入书籍名字" />
        </el-form-item>
        <el-form-item label="书籍作者" prop="bookAuthor">
          <el-input v-model="form.bookAuthor" placeholder="请输入书籍作者" />
        </el-form-item>
<!--        <el-form-item label="" prop="bookCover" v-if="form.bookCover || false" >-->
<!--        </el-form-item>-->
        <el-form-item label="书籍封面" prop="bookCover">
            <image-upload
                    v-model="form.bookCover"
                    :limit="1"
            />

        </el-form-item>
        <el-form-item label="书籍ISBN号" prop="bookIsbn">
          <el-input v-model="form.bookIsbn" placeholder="请输入书籍ISBN号" />
        </el-form-item>
        <el-form-item label="书籍简介" prop="bookSummary">
          <el-input v-model="form.bookSummary" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">书籍的章节信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddBookChapters">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteBookChapters">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="bookChaptersList" :row-class-name="rowBookChaptersIndex" @selection-change="handleBookChaptersSelectionChange" ref="bookChapters">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="章节信息" prop="chapterInfo" width="450">
            <template #default="scope">
              <el-input v-model="scope.row.chapterInfo" placeholder="请输入章节信息" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Books" >
import {listBooks, getBooks, delBooks, addBooks, updateBooks} from "@/api/foreground/books";
import {getToken} from "@/utils/auth.js";
import ImagePreview from "@/components/ImagePreview/index.vue";
import ImageUpload from "@/components/ImageUpload/index.vue";
import {parseTime} from "@/utils/ruoyi.js";

const { proxy } = getCurrentInstance();

const booksList = ref([]);
const bookChaptersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedBookChapters = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    bookName: null,
    bookAuthor: null,
    bookCover: null,
    bookIsbn: null,
    bookSummary: null,
    createTime: null,
    updateBy: null,
    createBy: null,
    lastUpdate: null,
  },
  rules: {
    bookName: [
      { required: true, message: "书籍名字不能为空", trigger: "blur" }
    ],
    bookAuthor: [
      { required: true, message: "书籍作者不能为空", trigger: "blur" }
    ],
    bookIsbn: [
      { required: true, message: "书籍ISBN号不能为空", trigger: "blur" }
    ],
    lastUpdate: [
      { required: true, message: "最后更新时间不能为空", trigger: "blur" }
    ],
  }
});


const { queryParams, form, rules } = toRefs(data);

/** 查询书籍信息列表 */
function getList() {
  loading.value = true;
  listBooks(queryParams.value).then(response => {
    booksList.value = response.rows;
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
    bookId: null,
    bookName: null,
    bookAuthor: null,
    bookCover: null,
    bookIsbn: null,
    bookSummary: null,
    lastChapter: null,
    version: null,
    createTime: null,
    updateBy: null,
    createBy: null,
    lastUpdate: null,
  };
  bookChaptersList.value = [];
  proxy.resetForm("booksRef");
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
  ids.value = selection.map(item => item.bookId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加书籍信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _bookId = row.bookId || ids.value
  getBooks(_bookId).then(response => {
    form.value = response.data;
    bookChaptersList.value = response.data.bookChaptersList;
    open.value = true;
    title.value = "修改书籍信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["booksRef"].validate(valid => {
    if (valid) {
      form.value.bookChaptersList = bookChaptersList.value;
        console.log(form.value)
      if (form.value.bookId != null) {
        updateBooks(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBooks(form.value).then(() => {
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
  const _bookIds = row.bookId || ids.value;
  proxy.$modal.confirm('是否确认删除书籍信息编号为"' + _bookIds + '"的数据项？').then(function() {
    return delBooks(_bookIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 书籍的章节信息序号 */
function rowBookChaptersIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 书籍的章节信息添加按钮操作 */
function handleAddBookChapters() {
  let obj = {};
  obj.chapterInfo = "";
  bookChaptersList.value.push(obj);
}

/** 书籍的章节信息删除按钮操作 */
function handleDeleteBookChapters() {
  if (checkedBookChapters.value.length === 0) {
    proxy.$modal.msgError("请先选择要删除的书籍的章节信息数据");
  } else {
    const bookChapterss = bookChaptersList.value;
    const checkedBookChapterss = checkedBookChapters.value;
    bookChaptersList.value = bookChapterss.filter(function(item) {
      return checkedBookChapterss.indexOf(item.index) === -1
    });
  }
}

/** 复选框选中数据 */
function handleBookChaptersSelectionChange(selection) {
  checkedBookChapters.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('foreground/books/export', {
    ...queryParams.value
  }, `books_${new Date().getTime()}.xlsx`)
}

getList();
</script>
