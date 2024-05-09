import request from '@/utils/request'

// 查询评论管理列表
export function listComments(query) {
  return request({
    url: '/foreground/comments/list',
    method: 'get',
    params: query
  })
}

// 查询评论管理详细
export function getComments(commentId) {
  return request({
    url: '/foreground/comments/' + commentId,
    method: 'get'
  })
}

// 新增评论管理
export function addComments(data) {
  return request({
    url: '/foreground/comments',
    method: 'post',
    data: data
  })
}

// 修改评论管理
export function updateComments(data) {
  return request({
    url: '/foreground/comments',
    method: 'put',
    data: data
  })
}

// 删除评论管理
export function delComments(commentId) {
  return request({
    url: '/foreground/comments/' + commentId,
    method: 'delete'
  })
}
export function delCommentsAndReply(commentId, replyId){
  return request({
    url: '/foreground/comments/' + commentId + "/" + replyId,
    method: 'delete'
  })
}

export function delReply(replyId){
  return request({
    url: '/foreground/comments/reply/' + replyId,
    method: 'delete'
  })
}
