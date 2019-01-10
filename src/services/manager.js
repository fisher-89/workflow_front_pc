import request from '@/utils/request';

export default function getCurrentManager() {
  return request('/api/oa/current-user');
}
