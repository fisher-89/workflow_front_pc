import getCurrentManager from '@/services/manager';
import { setAuthority } from '@/utils/authority';

export default {
  namespace: 'manager',
  state: { current: {} },
  effects: {
    *getCurrentManger(_, { call, put }) {
      const response = yield call(getCurrentManager);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },
  reducers: {
    save(state, { payload }) {
      const currentManager = { ...payload };
      if (JSON.stringify(currentManager)) {
        const {
          authorities: { oa },
        } = currentManager;
        setAuthority(oa);
        localStorage.setItem('manager', JSON.stringify(currentManager));
      }
      return {
        ...state,
        current: currentManager,
      };
    },
  },
};
