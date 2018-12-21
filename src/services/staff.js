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
export async function fetchBrands(params) {
  return request('/api/oa/brands', {
    method: 'GET',
    body: params,
  });
}
export async function fetchPositions(params) {
  return request('/api/oa/positions', {
    method: 'GET',
    body: params,
  });
}
export async function fetchShops(params) {
  return request('/api/oa/shops', {
    method: 'GET',
    body: params,
  });
}
