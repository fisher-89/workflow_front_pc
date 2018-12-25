import { getCCList } from '../services/start';

export default {
  namespace: 'cc',
  state: {
    flowDetails: {},
    ccListDetails: {},
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
            id: params.type,
          },
        });
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
