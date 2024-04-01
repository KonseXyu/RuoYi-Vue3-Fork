import request from '@/utils/request'

// 查询轮播图图片列表
export function listCarousels(query) {
  return request({
    url: '/foreground/carousels/list',
    method: 'get',
    params: query
  })
}

// 查询轮播图图片详细
export function getCarousels(carouselId) {
  return request({
    url: '/foreground/carousels/' + carouselId,
    method: 'get'
  })
}

// 新增轮播图图片
export function addCarousels(data) {
  return request({
    url: '/foreground/carousels',
    method: 'post',
    data: data
  })
}

// 修改轮播图图片
export function updateCarousels(data) {
  return request({
    url: '/foreground/carousels',
    method: 'put',
    data: data
  })
}

// 删除轮播图图片
export function delCarousels(carouselId) {
  return request({
    url: '/foreground/carousels/' + carouselId,
    method: 'delete'
  })
}
