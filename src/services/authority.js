import request from '@/utils/request';

export default async function getAccessToken(params) {
  return request('/oauth/token', { method: 'POST', body: params });
}
