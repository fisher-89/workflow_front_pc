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

export function getCCDetail(id) {
  return request(`/api/cc/${id}`);
}
// 审批列表
export function fetchApproveList(data) {
  return request('/api/approval', {
    method: 'GET',
    body: data,
  });
}

// 审批详情
export function fetchStepInfo(id) {
  return request(`/api/approval/${id}`);
}

// 审批同意
export function getThrough(data) {
  return request('/api/through', {
    method: 'PATCH',
    body: data,
  });
}

// 驳回
export function doReject(data) {
  return request('/api/reject', {
    method: 'PATCH',
    body: data,
  });
}
// 转交
export function doDeliver(data) {
  return request('/api/deliver', {
    method: 'POST',
    body: data,
  });
}
