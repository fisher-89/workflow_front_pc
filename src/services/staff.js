import request from '../utils/request';

export async function fetchStaffs(params) {
  return request('/api/staff', {
    method: 'GET',
    body: params,
  });
}
export default fetchStaffs;
