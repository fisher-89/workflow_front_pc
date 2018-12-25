import request from '../utils/request';

// 可发起的流程
export function getFlowList() {
  return request('/api/list');
}
// 获取发起流程
export function getFlowInfo(id) {
  return request(`/api/start/${id}`);
}
// 发起列表
export function getStartList(data) {
  return request('/api/sponsor', {
    method: 'GET',
    body: data,
  });
}

// 预提交
export function preSet(data) {
  return request('/api/preset', {
    method: 'POST',
    body: data,
  });
}

export function stepStart(data) {
  return request('/api/start', {
    method: 'POST',
    body: data,
  });
}

// 发起详情
export function startDetail(id) {
  return request(`/api/sponsor/${id}`);
}

export function doWithdraw(data) {
  return request('/api/withdraw', {
    method: 'PATCH',
    body: data,
  });
}

export async function getUserInfo() {
  return request('/api/oa/current-user');
}

// 抄送列表
export function getCCList(data) {
  return request('/api/cc', {
    method: 'GET',
    body: data,
  });
}

// 抄送列表
export function fetchApproveList(data) {
  return request('/api/approval', {
    method: 'GET',
    body: data,
  });
}
