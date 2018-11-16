import request from '@/utils/request';

export default function getCurrentManager() {
  return request('/api/current-user');

}
