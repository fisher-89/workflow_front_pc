import request from '../utils/request';

export async function fetchStaffs(params) {
  return request('/api/oa/staff', {
    method: 'GET',
    body: params,
  });
}
export async function fetchDepartment(params) {
  return request('/api/oa/departments', {
    method: 'GET',
    body: params,
  });
}
