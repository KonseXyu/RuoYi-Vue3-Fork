<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="章节信息" prop="chapterInfo">
                <el-input
                        v-model="queryParams.chapterInfo"
                        placeholder="请输入章节信息"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="更新时间" prop="chapterDate">
                <el-date-picker clearable
                                v-model="queryParams.chapterDate"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="请选择章节更新时间">
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
            <el-form-item label="创建人" prop="createBy">
                <el-input
                        v-model="queryParams.createBy"
                        placeholder="请输入创建人"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="更新人" prop="updateBy">
                <el-input
                        v-model="queryParams.updateBy"
                        placeholder="请输入更新人"
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
                        v-hasPermi="['foreground:chapters:add']"
                >新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="success"
                        plain
                        icon="Edit"
                        :disabled="single"
                        @click="handleUpdate"
                        v-hasPermi="['foreground:chapters:edit']"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="Delete"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['foreground:chapters:remove']"
                >删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['foreground:chapters:export']"
                >导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="chaptersList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="章节id" align="center" prop="chapterId" />
            <el-table-column label="书籍名称" align="center" prop="bookName" />
            <el-table-column label="章节信息" align="center" prop="chapterInfo" />
            <el-table-column label="创建人" align="center" prop="createBy" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column> <el-table-column label="更新人" align="center" prop="updateBy" />
            <el-table-column label="更新时间" align="center" prop="chapterDate" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.chapterDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['foreground:chapters:edit']">修改</el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['foreground:chapters:remove']">删除</el-button>
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

        <!-- 添加或修改书籍章节对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="questionsRef" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="所选书籍" prop="bookName">

                    <el-select v-model="form.bookId" placeholder="Select" style="width: 240px" >
                        <el-form :model="booksParams" ref="queryBooksRef" :inline="true" v-show="showSearch" label-width="68px">
                            <el-form-item label="书籍名称" prop="bookName">
                                <el-input
                                        v-model="booksParams.bookName"
                                        placeholder="请输入书籍名称"
                                        clearable
                                        @keyup.enter="handleQueryBook"
                                />
                            </el-form-item>
                            <el-form-item label="ISBN" prop="bookIsbn">
                                <el-input
                                        v-model="booksParams.bookIsbn"
                                        placeholder="请输入ISBN"
                                        clearable
                                        @keyup.enter="handleQueryBook"
                                />
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" icon="Search" @click="handleQueryBook">搜索</el-button>
                                <el-button icon="Refresh" @click="resetQueryBook">重置</el-button>
                            </el-form-item>
                        </el-form>
                        <el-option
                                v-for="item in form.books"
                                :key="item.bookId"
                                :label="item.bookName"
                                :value="item.bookId"
                        >
                            <span style="float: left">{{ item.bookName }}</span>
                            <span
                                    style="
          float: right;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        "
                            >{{ item.bookIsbn }}</span
                            >

                        </el-option>
                        <pagination
                                v-show="bookTotal>0"
                                :total="bookTotal"
                                v-model:page="booksParams.pageNum"
                                v-model:limit="booksParams.pageSize"
                                @pagination="freshBookList"
                        />

                    </el-select>
                </el-form-item>
            </el-form>

            <el-form ref="chaptersRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="章节信息" prop="chapterInfo">
                    <el-input v-model="form.chapterInfo" placeholder="请输入章节信息" />
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

<script setup name="Chapters">
import { listChapters, getChapters, delChapters, addChapters, updateChapters } from "@/api/foreground/chapters";
import {parseTime} from "@/utils/ruoyi.js";
import {listBooks} from "@/api/foreground/books.js";

const { proxy } = getCurrentInstance();

const chaptersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const bookTotal = ref(0);
const title = ref("");

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        chapterInfo: null,
        chapterDate: null,
        createTime: null,
        createBy: null,
        updateBy: null,
        bookName: null
    },
    booksParams: {
        pageNum: 1,
        pageSize: 10,
        bookName: null,
        bookIsbn: null,
    },
    rules: {
        chapterInfo: [
            { required: true, message: "章节信息不能为空", trigger: "blur" }
        ],
        bookName: [
            { required: true, message: "书籍名称不能为空", trigger: "blur" }
        ]
    }
});

const { queryParams, form, rules, booksParams } = toRefs(data);

/** 查询书籍章节列表 */
function getList() {
    loading.value = true;
    listChapters(queryParams.value).then(response => {
        chaptersList.value = response.rows;
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
        chapterId: null,
        chapterInfo: null,
        chapterDate: null,
        bookId: null,
        version: null,
        createTime: null,
        createBy: null,
        updateBy: null,
        bookName: null
    };
    proxy.resetForm("chaptersRef");
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

function handleQueryBook() {
    booksParams.value.pageNum = 1;
    freshBookList();
}

const freshBookList = ()=> getBooksList().then(response => {
    form.value.books = response;
});

function getBooksList() {
    return new Promise((resolve, reject) => {
        listBooks(booksParams.value).then(response => {
            bookTotal.value = response.total;
            resolve(response.rows);
        });
    });
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
}

// 书籍重置按钮操作
function resetQueryBook() {
    proxy.resetForm("queryBooksRef");
    handleQueryBook();
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.chapterId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
    reset();
    freshBookList();
    open.value = true;
    title.value = "添加书籍章节";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    freshBookList();

    const _chapterId = row.chapterId || ids.value
    getChapters(_chapterId).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改书籍章节";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["chaptersRef"].validate(valid => {
        if (valid) {
            if (form.value.chapterId != null) {
                updateChapters(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addChapters(form.value).then(response => {
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
    const _chapterIds = row.chapterId || ids.value;
    proxy.$modal.confirm('是否确认删除书籍章节编号为"' + _chapterIds + '"的数据项？').then(function() {
        return delChapters(_chapterIds);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('foreground/chapters/export', {
        ...queryParams.value
    }, `chapters_${new Date().getTime()}.xlsx`)
}

getList();
</script>
