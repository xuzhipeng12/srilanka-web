import request from '@/utils/request'

export function fetchVersionSwitchTemplateById(query) {
  return request({
    url: '/api/version/template',
    method: 'get',
    params: query
  })
}

export function fetchVersionList(query) {
  return request({
    url: '/api/version/list',
    method: 'get',
    params: query
  })
}

export function createVersion(data) {
  return request({
    url: '/api/version/add',
    method: 'post',
    data
  })
}

export function updateVersion(data) {
  return request({
    url: '/api/version/update',
    method: 'post',
    data
  })
}

export function deleteVersion(data) {
  return request({
    url: '/api/version/delete',
    method: 'post',
    data
  })
}
