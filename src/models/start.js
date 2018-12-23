import { getFlowList, getFlowInfo, preSet, getStartList } from '../services/start';

export default {
  namespace: 'start',
  state: {
    flowDetails: {},
    availableFlows: [],
    startListDetails: {},
  },

  subscriptions: {},

  effects: {
    *getFlows(_, { call, put, select }) {
      const { availableFlows } = yield select(model => model.start);
      if (availableFlows.length) {
        return;
      }
      const data = yield call(getFlowList);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'availableFlows',
            data,
          },
        });
      }
    },

    *getFlowInfo({ payload }, { call, put }) {
      const { id, cb } = payload;
      const data = yield call(getFlowInfo, id);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            id,
            store: 'flow',
            data,
          },
        });
        if (cb) {
          cb(data);
        }
      }
    },

    // 预提交
    *preSet({ payload }, { call, put }) {
      const data = yield call(preSet, payload.data);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'preStepData',
            data,
          },
        });

        if (payload.cb) {
          payload.cb(data);
        }
      } else if (data.status === 422) {
        payload.cb(data);
      }
    },
    *fetchStartList({ payload }, { call, put }) {
      const { params } = payload;
      const data = yield call(getStartList, params);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: 'startList',
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
