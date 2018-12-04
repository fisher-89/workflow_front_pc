import request from '@/utils/request';

export default function getApiDataSource(id) {
  return request(`/api/oa-api/${id}/`, null, false);
}
