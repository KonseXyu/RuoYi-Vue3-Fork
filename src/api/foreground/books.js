import request from '@/utils/request'

// 查询书籍信息列表
export function listBooks(query) {
  return request({
    url: '/foreground/books/list',
    method: 'get',
    params: query
  })
}

// 查询书籍信息详细
export function getBooks(bookId) {
  return request({
    url: '/foreground/books/' + bookId,
    method: 'get'
  })
}

// 新增书籍信息
export function addBooks(data) {
  return request({
    url: '/foreground/books',
    method: 'post',
    data: data
  })
}

// 修改书籍信息
export function updateBooks(data) {
  return request({
    url: '/foreground/books',
    method: 'put',
    data: data
  })
}

// 删除书籍信息
export function delBooks(bookId) {
  return request({
    url: '/foreground/books/' + bookId,
    method: 'delete'
  })
}
