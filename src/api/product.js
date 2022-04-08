import request from '@/utils/request'

export function fetchProdcutList(query) {
  return request({
    url: '/api/product/list',
    method: 'get',
    params: query
  })
}
export function fetchProdcutListDepts(query) {
  return request({
    url: '/api/product/listdepts',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createProduct(data) {
  return request({
    url: '/api/product/add',
    method: 'post',
    data
  })
}

export function updateProduct(data) {
  return request({
    url: '/api/product/update',
    method: 'post',
    data
  })
}

export function deleteProduct(data) {
  return request({
    url: '/api/product/delete',
    method: 'post',
    data
  })
}
