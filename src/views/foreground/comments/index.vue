<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="创建时间" style="width: 308px">
                <el-date-picker
                    v-model="daterangeCreateTime"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="更新时间" style="width: 308px">
                <el-date-picker
                    v-model="daterangeUpdateTime"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                ></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="info"
                        plain
                        icon="Sort"
                        @click="toggleExpandAll"
                >展开/折叠
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="Delete"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['foreground:comments:remove']"
                >删除
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table
                v-if="refreshTable"
                lazy
                row-key="commentId"
                :default-expand-all="isExpandAll"
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                v-loading="loading" :data="commentsList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="评论id" align="center" prop="commentId"/>
            <el-table-column label="评论人" align="center" prop="userName"/>
            <el-table-column label="评论详情" align="center" prop="commentContent" show-overflow-tooltip/>
            <el-table-column label="书籍名" align="center" prop="bookName"/>
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="@回复者" align="center" prop="linkUserName"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['foreground:comments:remove']">删除
                    </el-button>
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

        <!-- 添加或修改评论管理对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="commentsRef" :model="form" :rules="rules" label-width="80px">
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

<script setup name="Comments">
import {delComments, delCommentsAndReply, delReply, getComments, listComments} from "@/api/foreground/comments";
import {parseTime} from "@/utils/ruoyi.js";

const {proxy} = getCurrentInstance();

const commentsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const daterangeCreateTime = ref([]);
const daterangeUpdateTime = ref([]);
const REPLY_HEADER = "-reply: ";
const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,

        commentContent: null,
        createTime: null,
        updateTime: null,

    },
});

const {queryParams, form, rules} = toRefs(data);

/** 查询评论管理列表 */
function getList() {
    loading.value = true;
    queryParams.value.params = {};
    if (null != daterangeCreateTime && '' !== daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
    }
    if (null != daterangeUpdateTime && '' !== daterangeUpdateTime) {
        queryParams.value.params["beginUpdateTime"] = daterangeUpdateTime.value[0];
        queryParams.value.params["endUpdateTime"] = daterangeUpdateTime.value[1];
    }
    listComments(queryParams.value).then(response => {
        commentsList.value = response.data;
        for (let i = 0; i < commentsList.value.length; i++) {
            for (let j = 0; j < commentsList.value[i].children.length; j++) {
                commentsList.value[i].children[j].bookName = commentsList.value[i].bookName;
                commentsList.value[i].children[j].commentContent = commentsList.value[i].children[j].replyContent
                //commentID 备用
                commentsList.value[i].children[j].commentIdBack = commentsList.value[i].commentId

                commentsList.value[i].children[j].commentId = commentsList.value[i].commentId + REPLY_HEADER + commentsList.value[i].children[j].replyId

            }
        }
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
        commentId: null,
        commentContent: null,
        userId: null,
        bookId: null,
        version: null,
        createTime: null,
        updateTime: null,
        commentLike: null
    };
    proxy.resetForm("commentsRef");
}

/** 展开/折叠操作 */
function toggleExpandAll() {
    refreshTable.value = false;
    isExpandAll.value = !isExpandAll.value;
    nextTick(() => {
        refreshTable.value = true;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    daterangeCreateTime.value = [];
    daterangeUpdateTime.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.commentId);
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加评论管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const _commentId = row.commentId || ids.value
    getComments(_commentId).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改评论管理";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["commentsRef"].validate(valid => {
        if (valid) {
            if (form.value.commentId != null) {
                updateComments(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addComments(form.value).then(response => {
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
    const _commentIds = row.commentId || ids.value;
    const commentIdMain = _commentIds.filter(item => !item.toString().includes(REPLY_HEADER))
    //不存在commentIdMain中的子项
    const replyIdList = _commentIds.filter(item => item.toString().includes(REPLY_HEADER))
    const replyIds = [];
    for(let i = 0; i < replyIdList.length; i++){
        let headerId = Number(replyIdList[i].toString().split(REPLY_HEADER).shift())
        let replyId = Number(replyIdList[i].toString().split(REPLY_HEADER)[1])
        if(commentIdMain.includes(headerId)) continue;
        else replyIds.push(replyId)
    }
    if (commentIdMain.length > 0) {
        let temp_c;
        if(replyIds.length > 0){
            temp_c = '是否确认删除评论管理评论编号为"' + commentIdMain + ", 回复编号为"+ replyIds +  '"的数据项？';
            proxy.$modal.confirm(temp_c).then(function () {
                return delCommentsAndReply(commentIdMain, replyIds)
            }).then(() => {
                getList();
                proxy.$modal.msgSuccess("删除成功");
            }).catch(() => {
            });
        }else {
            temp_c = '是否确认删除评论管理评论编号为"' + commentIdMain + '"的数据项？';
            proxy.$modal.confirm(temp_c).then(function () {
                return delComments(commentIdMain)
            }).then(() => {
                getList();
                proxy.$modal.msgSuccess("删除成功");
            }).catch(() => {
            });
        }

    }else{
        proxy.$modal.confirm('是否确认删除评论管理回复编号为"' + replyIds + '"的数据项？').then(function () {
            return delReply(replyIds);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {
        });
    }

}

getList();
</script>
