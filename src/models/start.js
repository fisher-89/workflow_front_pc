import {
  getFlowList,
  getFlowInfo,
  preSet,
  getStartList,
  stepStart,
  doWithdraw,
  startDetail,
} from '../services/start';
import defaultReducers from '../reducers';

export default {
  namespace: 'start',
  state: {
    flowDetails: {},
    availableFlows: [],
    processingStart: {},
    preStepData: {},
    startDetails: {},
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
    // 正式提交
    *stepStart({ payload }, { call }) {
      const data = yield call(stepStart, payload.data);
      if (data && !data.error) {
        payload.cb();
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
            store: `${params.type}Start`,
          },
        });
      }
    },
    *fetchStepInfo({ payload }, { call, put }) {
      const data = yield call(startDetail, payload);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: 'start',
            id: payload,
          },
        });
      }
    },

    *doWithDraw({ payload }, { call, put }) {
      const data = yield call(doWithdraw, payload);
      if (data && !data.error) {
        yield put({
          type: 'update',
          payload: {
            data,
            store: 'processingStart',
            id: payload.flow_run_id,
          },
        });
      }
    },
  },

  reducers: {
    ...defaultReducers,
  },
};
