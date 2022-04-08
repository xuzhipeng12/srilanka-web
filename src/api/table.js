import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/product/list',
    method: 'get',
    params
  })
}
