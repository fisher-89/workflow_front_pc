/* eslint-disable  consistent-return */
/* eslint-disable no-nested-ternary */
import { notification } from 'antd';

export default {
  save(state, action) {
    const { store, data } = action.payload;

    const { staffSn } = action.payload;
    if (staffSn === undefined) {
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
        [`${staffSn}`]: data,
      },
    };
  },
  setTotal(state, action) {
    const { total } = action.payload;
    return {
      ...state,
      total,
    };
  },
  combine(state, action) {
    const { store, data } = action.payload;
    const originalStore = state[store].data || [];
    const newStore = originalStore;
    const originalKey = originalStore.map(item => item.staff_sn);
    data.forEach(item => {
      const index = originalKey.indexOf(item.staff_sn);
      if (index === -1) {
        newStore.push(item);
      } else {
        newStore[index] = item;
      }
    });
    return {
      ...state,
      [store]: newStore,
    };
  },
  add(state, action) {
    const { store, data } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return;
    }
    notification.success({
      message: '添加成功',
    });
    let dataState = state[store];
    if (Array.isArray(state[store])) {
      dataState = [...state[store]];
      dataState.push(data);
    } else if (state[store].data) {
      dataState = { ...state[store] };
      dataState.data = [...state[store].data];
      dataState.data.push(data);
      dataState.total = state[store].total + 1;
    }
    return {
      ...state,
      [store]: dataState,
    };
  },
  update(state, action) {
    const { store, data } = action.payload;
    const staffSn = action.payload.staff_sn;

    const dataSource = Array.isArray(state[store]) ? state[store] : state[store].data || [];
    let updated = false;
    const newStore = dataSource.map(item => {
      if (parseInt(item.staff_sn, 0) === parseInt(staffSn, 0)) {
        updated = true;
        return data;
      }
      return item;
    });
    if (!updated) {
      newStore.push(data);
    }
    notification.success({
      message: '操作成功',
    });
    return {
      ...state,
      [store]: Array.isArray(state[store]) ? newStore : { ...state[store], data: newStore },
    };
  },
  delete(state, action) {
    const { store, data } = action.payload;
    const staffSn = action.payload.staff_sn;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return;
    }
    notification.success({
      message: '删除成功',
    });
    const dataState = Array.isArray(state[store])
      ? state[store]
        ? state[store].filter(item => item.staff_sn !== staffSn)
        : []
      : state[store].data
        ? {
            ...state[store],
            total: state[store].total - 1,
            data: state[store].data.filter(item => item.staff_sn !== staffSn),
          }
        : {};
    return {
      ...state,
      [store]: dataState,
    };
  },
  import(state, action) {
    const { store } = action.payload;
    notification.success({
      message: '导入成功',
    });
    return {
      ...state[store],
    };
  },
  merge(state, action) {
    const { store, data } = action.payload;
    const staffSn = action.payload.staff_sn;
    notification.success({
      message: data.message,
    });
    const dataSource = Array.isArray(state[store]) ? state[store] : state[store].data || [];
    const newStore = dataSource.map(item => {
      if (parseInt(item.staff_sn, 0) === parseInt(staffSn, 0)) {
        return { ...item, ...data.changes };
      }
      return item;
    });
    return {
      ...state,
      [store]: Array.isArray(state[store]) ? newStore : { ...state[store], data: newStore },
    };
  },
};
