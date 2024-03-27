import request from '@/utils/request'

// 查询标签列表
export function listTags(query) {
  return request({
    url: '/foreground/tags/list',
    method: 'get',
    params: query
  })
}

// 查询标签详细
export function getTags(tagId) {
  return request({
    url: '/foreground/tags/' + tagId,
    method: 'get'
  })
}

// 新增标签
export function addTags(data) {
  return request({
    url: '/foreground/tags',
    method: 'post',
    data: data
  })
}

// 修改标签
export function updateTags(data) {
  return request({
    url: '/foreground/tags',
    method: 'put',
    data: data
  })
}

// 删除标签
export function delTags(tagId) {
  return request({
    url: '/foreground/tags/' + tagId,
    method: 'delete'
  })
}
