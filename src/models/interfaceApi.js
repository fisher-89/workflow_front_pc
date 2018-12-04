import getApiDataSource from '../services/interface';
// import * as defaultReducers from './reducers/default';

export default {
  namespace: 'interfaceApi',
  state: {
    sourceDetails: {},
  },

  subscriptions: {},

  effects: {
    *fetchApi({ payload }, { call, put, select }) {
      const { id, cb } = payload;
      const { sourceDetails } = yield select(_ => _.interfaceApi);
      if (sourceDetails[id] && sourceDetails[id].length) {
        return;
      }
      const data = yield call(getApiDataSource, id);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'source',
            id,
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
