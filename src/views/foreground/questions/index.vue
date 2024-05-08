<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="书籍名称" prop="bookName">
                <el-input
                    v-model="queryParams.bookName"
                    placeholder="请输入书籍名称"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="章节名称" prop="chapterInfo">
                <el-input
                    v-model="queryParams.chapterInfo"
                    placeholder="请输入章节名称"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
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
                        v-hasPermi="['foreground:questions:add']"
                >新增
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="success"
                        plain
                        icon="Edit"
                        :disabled="single"
                        @click="handleUpdate"
                        v-hasPermi="['foreground:questions:edit']"
                >修改
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="Delete"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['foreground:questions:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['foreground:questions:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="questionsList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="题目id" align="center" prop="questionId"/>
            <el-table-column label="书籍名称" align="center" prop="bookName" show-overflow-tooltip/>
            <el-table-column label="章节名称" align="center" prop="chapterInfo" show-overflow-tooltip/>
            <el-table-column label="题目类型" align="center" prop="questionType">
                <template #default="scope">
                    <dict-tag :options="tbl_question_type" :value="scope.row.questionType"/>
                </template>
            </el-table-column>
            <el-table-column label="题目名称" align="center" prop="questionName" show-overflow-tooltip/>
            <el-table-column label="题目选项内容" align="center" prop="questionContent" show-overflow-tooltip/>
            <el-table-column label="题目答案" align="center" prop="ans" show-overflow-tooltip>
                <template #default="scope">
                    <!--              不是判断题就不显示-->
                    <div v-if="scope.row.questionType === QUESTIONS_TYPE.JUDGE">
                        <span>{{ scope.row.ans === "1" ? '√' : '×' }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="题目解析" align="center" prop="ansAnalysis" show-overflow-tooltip/>
            <el-table-column label="AI解析" align="center" prop="aiAnalysis" show-overflow-tooltip/>
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
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['foreground:questions:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['foreground:questions:remove']">删除
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

        <!-- 添加或修改题目对话框 -->
        <el-dialog :title="title" v-model="open" width="550px" append-to-body>
            <el-form ref="questionsRef" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="所选书籍" prop="books">

                    <el-select v-model="form.bookId" placeholder="Select" style="width: 240px" @change="changeBook()">
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
                <el-form-item label="所选章节" prop="chapters">
                    <el-select v-model="form.chapterId" placeholder="Select" style="width: 240px">
                        <el-option
                            v-for="item in form.chapters"
                            :key="item.chapterId"
                            :label="item.chapterInfo"
                            :value="item.chapterId"
                        >
                            <span style="float: left">{{ item.chapterInfo }}</span>
                            <span
                                style="
          float: right;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        "
                            >{{ item.chapterId }}</span
                            >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="题目类型" prop="questionType">
                    <el-select v-model="form.questionType" placeholder="请选择题目类型" :disabled="updateStatus">
                        <el-option
                                v-for="dict in tbl_question_type"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="题目名称" prop="questionName">
                    <el-input v-model="form.questionName" type="textarea" placeholder="请输入内容"/>
                </el-form-item>
                <!--       不为填空或者判断时有增加选项的可能      -->
                <el-row :gutter="10" class="mb8" v-if="form.questionType !== QUESTIONS_TYPE.JUDGE && form.questionType !== QUESTIONS_TYPE.COMPLETION">
                    <el-col :span="1.5">
                        <el-button type="primary" icon="Plus" @click="handleAddQuestionsOption">添加</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="danger" icon="Delete" @click="handleDeleteQuestionsOption">删除</el-button>
                    </el-col>
                </el-row>
                <!--       不为填空或者判断时有增加选项的可能      -->
                <el-table :data="questionsOptionList" :row-class-name="rowQuestionsOptionIndex"
                          @selection-change="handleQuestionsOptionSelectionChange"
                          ref="questionOption" v-if="form.questionType !== QUESTIONS_TYPE.JUDGE && form.questionType !== QUESTIONS_TYPE.COMPLETION">
                    <el-table-column type="selection" width="50" align="center"/>
                    <el-table-column label="选项" align="center" prop="index" width="50"/>
                    <el-table-column label="选项内容" prop="option" width="410">
                        <template #default="scope">
                            <el-input v-model="scope.row.option" placeholder="请输入选项信息"/>
                        </template>
                    </el-table-column>
                </el-table>
                <el-form-item label="">
                </el-form-item>
                <!--     单选框       -->
                <el-form-item label="题目答案" prop="checkedAnsSingle"
                              v-if="form.questionType === QUESTIONS_TYPE.SINGLE">
                    <el-radio-group v-model="checkedAnsSingle">
                        <el-radio
                                v-for="ans in ansList"
                                :key="ans.option"
                                :label="ans.index"
                                :value="ans"
                        >{{ ans.index + ":" + ans.option }}
                        </el-radio
                        >
                    </el-radio-group>
                </el-form-item>
                <!--     判断框       -->
                <el-form-item label="题目答案" prop="checkedAnsJudge"
                              v-if="form.questionType === QUESTIONS_TYPE.JUDGE">
                    <el-radio-group v-model="checkedAnsJudge">
                        <el-radio
                            v-for="ans in DEFAULT_JUDGE_OPTION"
                            :key="ans.option"
                            :label="ans.index"
                            :value="ans"
                        >{{ ans.index + ":" + ans.option }}
                        </el-radio
                        >
                    </el-radio-group>
                </el-form-item>
                <!--     多选框       -->
                <el-form-item label="题目答案" prop="checkedAnsMultiple" v-if="form.questionType === QUESTIONS_TYPE.MULTIPLE">
                    <el-checkbox-group v-model="checkedAnsMultiple" :max="26">
                        <el-checkbox
                                v-for="ans in ansList"
                                :key="ans.option"
                                :label="ans"
                                :value="ans"
                        >{{ ans.index + ":" + ans.option }}
                        </el-checkbox
                        >
                    </el-checkbox-group>
                </el-form-item>
                <!--     为填空时为文本框       -->
                <el-form-item label="题目答案" prop="ans" v-if="form.questionType === QUESTIONS_TYPE.COMPLETION">
                    <el-input v-model="form.ans" type="textarea" placeholder="请输入内容"/>
                </el-form-item>
                <el-form-item label="题目解析" prop="ansAnalysis" :autosize="{ minRows: 2, maxRows: 30 }">
                    <el-input v-model="form.ansAnalysis" type="textarea" placeholder="请输入内容"/>
                </el-form-item>
                <el-form-item label="AI解析" prop="aiAnalysis" v-show="showAiText" readonly="true">
                    <el-input v-model="aiAnalysis" type="textarea" placeholder="请输入内容" :autosize="{ minRows: 2, maxRows: 30 }"/>
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

<script setup name="Questions" >
import {
    addQuestions, addQuestionsAndAiAnalysis,
    delQuestions,
    getQuestions,
    listQuestions,
    updateQuestions,
    updateQuestionsAndAiAnalysis
} from "@/api/foreground/questions";
import {getBooks, listBooks} from "@/api/foreground/books.js";
import {parseTime} from "@/utils/ruoyi.js";

const {proxy} = getCurrentInstance();
const {tbl_question_type} = proxy.useDict('tbl_question_type');

const questionsList = ref([]);
const aiAnalysis = ref("");
const showAiText = ref(false);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const bookTotal = ref(0);
const title = ref("");
const questionsOptionList = ref([]);
const checkQuestionsOption = ref([]);
const ansList = ref([]);
const checkedAnsMultiple = ref([]);
const checkedAnsSingle = ref(null);
const checkedAnsJudge = ref(null);
const watchAnsStatus = ref(false);
const addStatus = ref(false);
const updateStatus = ref(false);
const DEFAULT_JUDGE_OPTION = [{index: "A", option: "√"}, {index: "B", option: "×"}]
const QUESTIONS_TYPE = {
    SINGLE: 0,
    MULTIPLE: 1,
    JUDGE: 2,
    COMPLETION: 3
}

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 20,
        questionType: null,
        questionName: null,
        updateTime: null,
        createTime: null,
        updateBy: null,
        createBy: null
    },
    booksParams: {
        pageNum: 1,
        pageSize: 10,
        bookName: null,
        bookIsbn: null,
    },
    rules: {
        questionType: [
            {required: true, message: "题目类型不能为空", trigger: "change"}
        ],
        questionName: [
            {required: true, message: "题目名称不能为空", trigger: "blur"}
        ],
        questionContent: [
            {required: true, message: "题目选项内容不能为空", trigger: "blur"}
        ],
        bookId: [
            {required: true, message: "书本id不能为空", trigger: "blur"}
        ],
        chapterId: [
            {required: true, message: "章节id不能为空", trigger: "blur"}
        ],
        ans: [
            {required: true, message: "答案不能为空", trigger: "blur"}
        ],
        books:[
            {required: true, message: "所选书籍不能为空", trigger: "blur"}
        ],
        chapters:[
            {required: true, message: "所选章节不能为空", trigger: "blur"}
        ],
        checkedAnsMultiple: [
            {validator: checkSelectionMultiple, trigger: "change"}
        ],
        checkedAnsSingle: [
            {validator: checkSelectionSingle, trigger: "change"}
        ],
        checkedAnsJudge: [
            {validator: checkSelectionJudge, trigger: "change"}
        ]
    }
});

const {queryParams, form, rules, booksParams} = toRefs(data);

const initSSE = (verify_id)=> {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`http://localhost:801/dev-api/chat/${verify_id}`);
        showAiText.value = true;
        // 创建一个SSE对象，连接到后端的/chat接口
        eventSource.onmessage = function (event) {
            let data = JSON.parse(event.data);
            // 在这里处理接收到的数据
            console.log(data);
            nextTick(() => {
                aiAnalysis.value += data.result;
            })

            if (data.is_end === true) {
                eventSource.close();
                resolve();
            }
        };

        eventSource.onerror = function (event) {
            console.error("SSE error", event);
            // 当发生错误时，关闭连接
            eventSource.close();
            reject();
        };
    });
}

// 自定义规则
function checkSelectionMultiple(rule, value, callback) {

    if (checkedAnsMultiple.value.length === 0) {
        callback(new Error('答案不能为空'));
    } else {
        callback();
    }
}

function checkSelectionSingle(rule, value, callback) {
    if (!checkedAnsSingle.value) {
        callback(new Error('答案不能为空'));
    } else {
        callback();
    }
}

function checkSelectionJudge(rule, value, callback) {
    if (!checkedAnsJudge.value) {
        callback(new Error('答案不能为空'));
    } else {
        callback();
    }
}

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
        aiAnalysis: null,
        bookId: null,
        chapterId: null,
        version: null,
        updateTime: null,
        createTime: null,
        updateBy: null,
        createBy: null,
        books:null,
        chapters:null,
    };
    aiAnalysis.value = "";
    showAiText.value= false;
    checkQuestionsOption.value = [];
    questionsOptionList.value = [];
    ansList.value = [];
    checkedAnsMultiple.value = [];
    checkedAnsSingle.value = null;
    checkedAnsJudge.value = null;
    watchAnsStatus.value = false;
    updateStatus.value = false;
    addStatus.value = false;
    proxy.resetForm("questionsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

/** 书籍搜索按钮操作 */
function handleQueryBook() {
    booksParams.value.pageNum = 1;
    freshBookList();
}

// 书籍重置按钮操作
function resetQueryBook() {
    proxy.resetForm("queryBooksRef");
    handleQueryBook();
}


/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.questionId);
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
    addStatus.value = true;
    reset();
    handleAddQuestionsOption();
    //默认单选
    form.value.questionType = QUESTIONS_TYPE.SINGLE;
    watchAnsStatus.value = true;
    getBooksList().then(response => {
        form.value.books = response;
    });
    open.value = true;
    title.value = "添加题目";
}

const freshBookList = ()=> getBooksList().then(response => {
    form.value.books = response;
    getChaptersList(form.value.bookId).then(response => {
        form.value.chapters = response;
    });
});

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    freshBookList();

    updateStatus.value = true;
    const _questionId = row.questionId || ids.value
    getQuestions(_questionId).then(response => {
        form.value = response.data;
        if (form.value.questionType !== QUESTIONS_TYPE.JUDGE && form.value.questionType !== QUESTIONS_TYPE.COMPLETION) { // 判断 或者填空
            questionsOptionList.value = JSON.parse(response.data.questionContent);
        }
        if (form.value.questionContent) {
            //变成 A:xxx B:xxx C:xxx D:xxx
            let questionOptionInfo = [];
            for (let i = 0; i < questionsOptionList.value.length; i++) {
                let obj = {};
                obj.option = questionsOptionList.value[i];
                questionOptionInfo.push(obj);
            }
            questionsOptionList.value = questionOptionInfo;
        }

        if (form.value.questionType === QUESTIONS_TYPE.SINGLE) { //单选
            watchAnsStatus.value = true;
            checkedAnsSingle.value = form.value.ans
        } else if (form.value.questionType === QUESTIONS_TYPE.MULTIPLE) { //多选
            watchAnsStatus.value = true;
            for (let i = 0; i < form.value.ans.length; i++) {
                checkedAnsMultiple.value.push(questionsOptionList.value[form.value.ans[i].charCodeAt(0) - 65])
            }
        } else if (form.value.questionType === QUESTIONS_TYPE.JUDGE) { // 判断
            watchAnsStatus.value = false;
            ansList.value = DEFAULT_JUDGE_OPTION
            checkedAnsJudge.value = form.value.ans === "1" ? DEFAULT_JUDGE_OPTION[0].index : DEFAULT_JUDGE_OPTION[1].index;
        }
        open.value = true;
        title.value = "修改题目";
    });
}

//监听questionsList,实时变化
watch(questionsOptionList, (newValue) => {
    if (watchAnsStatus.value)
        ansList.value = newValue;
});

/** 提交按钮 */
function submitForm() {
    proxy.$refs["questionsRef"].validate(valid => {
        if (valid) {
            //从[ {"option": "堆排序","index": "A"},...]中取出option
            if (form.value.questionContent) {
                let questionOptionInfo = [];
                for (let i = 0; i < questionsOptionList.value.length; i++) {
                    questionOptionInfo.push(questionsOptionList.value[i].option);
                }
                form.value.questionContent = JSON.stringify(questionOptionInfo);
            }else {
                // 设置 questionContent
                form.value.questionContent = JSON.stringify(questionsOptionList.value.map(item => item.option));
            }
            //处理ANS
            if(QUESTIONS_TYPE.JUDGE === form.value.questionType){
                form.value.ans = checkedAnsJudge.value === "A" ? 1 : 0;
                form.value.questionContent = null; // 判断题没有选项
            }else if(QUESTIONS_TYPE.MULTIPLE === form.value.questionType){
                let ans = [];
                for (let i = 0; i < checkedAnsMultiple.value.length; i++) {
                    ans += checkedAnsMultiple.value[i].index;
                }
                //将ans字典序排序
                form.value.ans = ans.split('').sort().join('');
            }else if(QUESTIONS_TYPE.SINGLE === form.value.questionType){
                form.value.ans = checkedAnsSingle.value;
            }else { //填空题
                form.value.questionContent = null; // 填空题没有选项
            }

            if (form.value.questionId != null) {
                updateQuestions(form.value).then(async response => {
                    console.log(response.data)
                    if (response.data) {
                        await initSSE(response.data)
                        updateQuestionsAndAiAnalysis(response.data, aiAnalysis.value).then(response => {
                        });
                    }
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    reset();
                    getList();
                });
            } else {
                addQuestions(form.value).then(async response => {
                    if (response.data) {
                        await initSSE(response.data)
                        addQuestionsAndAiAnalysis(response.data, aiAnalysis.value).then(response => {
                        });
                    }
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    reset();
                    getList();
                });
            }
        }
    });
    addStatus.value = false;
}

/** 删除按钮操作 */
function handleDelete(row) {
    const _questionIds = row.questionId || ids.value;
    proxy.$modal.confirm('是否确认删除题目编号为"' + _questionIds + '"的数据项？').then(function () {
        return delQuestions(_questionIds);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => {
    });
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('foreground/questions/export', {
        ...queryParams.value
    }, `questions_${new Date().getTime()}.xlsx`)
}

/** 书籍的章节信息序号 */
function rowQuestionsOptionIndex({row, rowIndex}) {
    row.index = String.fromCharCode(65 + rowIndex);
}

/** 书籍的章节信息添加按钮操作 */
function handleAddQuestionsOption() {
    let obj = {};
    obj.option = "";
    questionsOptionList.value.push(obj);
}

/** 书籍的章节信息删除按钮操作 */
function handleDeleteQuestionsOption() {
    if (checkQuestionsOption.value.length === 0) {
        proxy.$modal.msgError("请先选择要删除的书籍的章节信息数据");
    } else {
        const questionsOptions = questionsOptionList.value;
        const checkQuestionsOptions = checkQuestionsOption.value;
        questionsOptionList.value = questionsOptions.filter(function (item) {
            return checkQuestionsOptions.indexOf(item.index) === -1
        });
        //同时删除多选框的勾选选中
        const checkAnsList = checkedAnsMultiple.value;
        const checkAnsDelete = checkQuestionsOption.value;
        checkedAnsMultiple.value = checkAnsList.filter(function (item) {
            return checkAnsDelete.indexOf(item.index) === -1
        });
    }
}

/** 复选框选中数据 */
function handleQuestionsOptionSelectionChange(selection) {
    checkQuestionsOption.value = selection.map(item => item.index)
}

function getBooksList() {
    return new Promise((resolve, reject) => {
        listBooks(booksParams.value).then(response => {
            bookTotal.value = response.total;
            resolve(response.rows);
        });
    });
}

function getChaptersList(bookId) {
    return new Promise((resolve, reject) => {
        getBooks(bookId).then(response => {
            resolve(response.data.bookChaptersList);
        });
    });
}

function changeBook() {
    form.value.chapterId = null;
    getChaptersList(form.value.bookId).then(response => {
        form.value.chapters = response;
    });
}
getList();
</script>
