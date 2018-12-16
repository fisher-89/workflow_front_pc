import fetchStaffs from '../services/staff';
import { makerFilters } from '../utils/utils';

export default {
  namespace: 'staff',
  state: {
    source: {},
  },

  subscriptions: {},

  effects: {
    *fetchStaffs({ payload }, { call, put }) {
      const { params, cb } = payload;
      const newParams = makerFilters(params);
      const data = yield call(fetchStaffs, newParams);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'source',
            data,
          },
        });
        if (cb) {
          cb(data);
        }
      }
    },
  },

  reducers: {
    save(state, action) {
      const { store, id, data } = action.payload;
      if (id === undefined) {
        return {
          ...state,
          [store]: data,
        };
      }
      const originalStore = state[`${store}Details`];
      return {
        ...state,
        [`${store}Details`]: {
          ...originalStore,
          [id]: data,
        },
      };
    },
  },
};
