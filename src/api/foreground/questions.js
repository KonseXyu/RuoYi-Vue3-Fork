import request from '@/utils/request'

// 查询题目列表
export function listQuestions(query) {
    return request({
        url: '/foreground/questions/list',
        method: 'get',
        params: query
    })
}

// 查询题目详细
export function getQuestions(questionId) {
    return request({
        url: '/foreground/questions/' + questionId,
        method: 'get'
    })
}

// 新增题目
export function addQuestions(data) {
    return request({
        url: '/foreground/questions',
        method: 'post',
        data: data
    })
}

export function addQuestionsAndAiAnalysis(verifyId, data) {
    return request({
        url: '/foreground/questions/' + verifyId,
        method: 'post',
        data: data
    })
}

// 修改题目
export function updateQuestions(data) {
    return request({
        url: '/foreground/questions',
        method: 'put',
        data: data
    })
}

export function updateQuestionsAndAiAnalysis(verifyId, data) {
    return request({
        url: '/foreground/questions/' + verifyId,
        method: 'put',
        data: data
    })
}


// 删除题目
export function delQuestions(questionId) {
    return request({
        url: '/foreground/questions/' + questionId,
        method: 'delete'
    })
}
