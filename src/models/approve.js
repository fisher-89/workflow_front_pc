import { fetchApproveList } from '../services/start';

export default {
  namespace: 'approve',
  state: {
    flowDetails: {},
    approveListDetails: {},
  },

  subscriptions: {},

  effects: {
    *fetchApproveList({ payload }, { call, put }) {
      const { params } = payload;
      const data = yield call(fetchApproveList, params);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: 'approveList',
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
