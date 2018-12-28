/* eslint no-nested-ternary:0 */
import { notification } from 'antd';

export default {
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
  add(state, action) {
    const { store, data, message } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return state;
    }
    notification.success({
      message: message || '添加成功',
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
    const { store, shopSn, data, message } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return { ...state };
    }
    notification.success({
      message: message || '编辑成功',
    });
    const originalStore = { ...state[`${store}Details`] };
    Object.keys(originalStore).forEach(key => {
      if (`${shopSn}` === `${key}`) {
        originalStore[key] = data;
      }
    });

    const dataSource = Array.isArray(state[store]) ? state[store] : state[store].data || [];
    let updated = false;
    const newStore = dataSource.map(item => {
      if (item.shop_sn === shopSn) {
        updated = true;
        return data;
      }
      return item;
    });
    if (!updated) {
      newStore.push(data);
    }
    let dataState;
    if (Array.isArray(state[store])) {
      dataState = state[store] ? [...newStore] : [];
    } else {
      dataState = state[store].data
        ? {
            ...state[store],
            data: newStore,
          }
        : {};
    }
    return {
      ...state,
      [store]: dataState,
      [`${store}Details`]: originalStore,
    };
  },
  delete(state, action) {
    const { store, shopSn } = action.payload;
    notification.success({
      message: '删除成功',
    });
    const dataState = Array.isArray(state[store])
      ? state[store]
        ? state[store].filter(item => item.shop_sn !== shopSn)
        : []
      : state[store].data
        ? {
            ...state[store],
            total: state[store].total - 1,
            data: state[store].data.filter(item => item.shop_sn !== shopSn),
          }
        : {};
    return {
      ...state,
      [store]: dataState,
    };
  },
};
