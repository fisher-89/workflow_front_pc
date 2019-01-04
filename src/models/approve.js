import {
  fetchApproveList,
  fetchStepInfo,
  doReject,
  doDeliver,
  getThrough,
} from '../services/start';
import defaultReducers from '../reducers';

export default {
  namespace: 'approve',
  state: {
    approveDetails: {},
    processingApprove: {},
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
            store: `${params.type}Approve`,
          },
        });
      }
    },
    *fetchStepInfo(
      {
        payload: { id, cb },
      },
      { call, put }
    ) {
      const data = yield call(fetchStepInfo, id);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: 'approve',
            id,
          },
        });
        if (cb) cb(data);
      }
    },
    *doDeliver({ payload }, { call }) {
      const { params, cb } = payload;
      const data = yield call(doDeliver, params);
      if (data && !data.error) {
        if (cb) {
          cb(data);
        }
      }
    },
    *doReject({ payload }, { call }) {
      const { params, cb } = payload;
      const data = yield call(doReject, params);
      if (data && !data.error) {
        if (cb) {
          cb(data);
        }
      }
    },
    *getThrough({ payload }, { call }) {
      const { params, cb } = payload;
      const data = yield call(getThrough, params);
      if (data && !data.error) {
        if (cb) {
          cb(data);
        }
      }
    },
  },

  reducers: {
    ...defaultReducers,
  },
};
