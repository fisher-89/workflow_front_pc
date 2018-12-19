import * as staffServer from '../services/staff';

const { fetchDepartment, fetchStaffs, fetchBrands, fetchPositions } = staffServer;
export default {
  namespace: 'staff',
  state: {
    source: { data: [], total: 0, page: 1, pagesize: 12 },
    department: [],
    brands: [],
    status: [
      { value: 0, text: '离职中' },
      { value: 1, text: '试用期' },
      { value: 2, text: '在职' },
      { value: 3, text: '停薪留职' },
      { value: -1, text: '离职' },
      { value: -2, text: '自动离职' },
      { value: -3, text: '开除' },
      { value: -4, text: '劝退' },
    ],
    positions: [],
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
    *fetchBrands({ payload }, { call, put, select }) {
      const { params, cb } = payload || {};
      const { brands } = yield select(model => model.staff);
      if (brands.length) {
        return;
      }
      const data = yield call(fetchBrands, params);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'brands',
            data,
          },
        });
        if (cb) {
          cb(data);
        }
      }
    },
    *fetchPositions({ payload }, { call, put, select }) {
      const { params, cb } = payload || {};
      const { positions } = yield select(model => model.staff);
      if (positions.length) {
        return;
      }
      try {
        const data = yield call(fetchPositions, params);
        if (data && !data.error) {
          yield put({
            type: 'save',
            payload: {
              store: 'positions',
              data,
            },
          });
          if (cb) {
            cb(data);
          }
        }
      } catch (err) {
        console.log(err);
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
