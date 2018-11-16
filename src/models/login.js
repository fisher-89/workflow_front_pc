// import { routerRedux } from 'dva/router';
// import { stringify } from 'qs';
import { getFakeCaptcha } from '@/services/api';
// import { setAuthority } from '@/utils/authority';
// import { getPageQuery } from '@/utils/utils';
// import { reloadAuthorized } from '@/utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout() {
      localStorage.clear();
      window.location.href = `${OA_PATH}/logout?url=${OA_PATH}oauth/authorize?client_id=${OA_CLIENT_ID}&response_type=code`;
      yield
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      // setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
