import request from '../utils/request';

export async function fetchStaffs(params) {
  return request('/api/oa/staff', {
    method: 'GET',
    body: params,
  });
}
export default fetchStaffs;
