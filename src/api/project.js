import request from '@/utils/request'

export function fetchProjectList(query) {
  return request({
    url: '/api/project/list',
    method: 'get',
    params: query
  })
}

export function createProject(data) {
  return request({
    url: '/api/project/add',
    method: 'post',
    data
  })
}

export function updateProject(data) {
  return request({
    url: '/api/project/update',
    method: 'post',
    data
  })
}

export function deleteProject(data) {
  return request({
    url: '/api/project/delete',
    method: 'post',
    data
  })
}
