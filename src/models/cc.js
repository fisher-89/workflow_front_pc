import { getCCList, getCCDetail } from '../services/start';

export default {
  namespace: 'cc',
  state: {
    ccList: {},
    ccDetails: {},
  },

  subscriptions: {},

  effects: {
    *fetchCCList({ payload }, { call, put }) {
      const { params } = payload;
      const data = yield call(getCCList, params);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: 'ccList',
          },
        });
      }
    },
    *fetchStepInfo({ payload }, { call, put }) {
      const { id, cb } = payload;
      const data = yield call(getCCDetail, id);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            id,
            store: 'cc',
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
