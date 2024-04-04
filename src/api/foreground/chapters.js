import request from '@/utils/request'

// 查询书籍章节列表
export function listChapters(query) {
  return request({
    url: '/foreground/chapters/list',
    method: 'get',
    params: query
  })
}

// 查询书籍章节详细
export function getChapters(chapterId) {
  return request({
    url: '/foreground/chapters/' + chapterId,
    method: 'get'
  })
}

// 新增书籍章节
export function addChapters(data) {
  return request({
    url: '/foreground/chapters',
    method: 'post',
    data: data
  })
}

// 修改书籍章节
export function updateChapters(data) {
  return request({
    url: '/foreground/chapters',
    method: 'put',
    data: data
  })
}

// 删除书籍章节
export function delChapters(chapterId) {
  return request({
    url: '/foreground/chapters/' + chapterId,
    method: 'delete'
  })
}
