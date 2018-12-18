import * as staffServer from '../services/staff';

const { fetchDepartment, fetchStaffs } = staffServer;
export default {
  namespace: 'staff',
  state: {
    source: { data: [], total: 0, page: 1, pagesize: 12 },
    department: [],
  },

  subscriptions: {},

  effects: {
    *fetchStaffs({ payload }, { call, put }) {
      const { params, cb } = payload;
      // const newParams = makerFilters(params);
      const data = yield call(fetchStaffs, params);
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
    *fetchDepartment({ payload }, { call, put, select }) {
      const { params, cb } = payload || {};
      const { department } = yield select(model => model.staff);
      if (department.length) {
        return;
      }
      const data = yield call(fetchDepartment, params);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'department',
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
