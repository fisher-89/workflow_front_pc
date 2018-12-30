/* eslint-disable no-nested-ternary */
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
  multiupdate(state, action) {
    const { store, data, message } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return { ...state };
    }
    notification.success({
      message: message || '编辑成功',
    });
    const updata = { ...data };
    const dataSource = Array.isArray(state[store]) ? state[store] : state[store].data || [];
    const midStore = dataSource;
    let index;
    Object.keys(updata).forEach(key => {
      index = 0;
      midStore.map(item => {
        if (parseInt(item.id, 0) === parseInt(updata[key].id, 0)) {
          midStore[index] = updata[key];
          index += 1;
          return null;
        }
        index += 1;
        return null;
      });
    });
    let dataState;
    if (Array.isArray(state[store])) {
      dataState = state[store] ? [...midStore] : [];
    } else {
      dataState = state[store].data
        ? {
            ...state[store],
            data: midStore,
          }
        : {};
    }
    return {
      ...state,
      [store]: dataState,
    };
  },
  updateList(state, action) {
    const { store, id, data, message, noti = true } = action.payload;
    if (noti) {
      if (data.message) {
        notification.error({
          message: data.message,
        });
        return { ...state };
      }
      notification.success({
        message: message || '编辑成功',
      });
    }

    const dataSource = Array.isArray(state[store]) ? state[store] : state[store].data || [];
    let updated = false;
    const newStore = dataSource.map(item => {
      if (parseInt(item.id, 0) === parseInt(id, 0)) {
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
    };
  },
  update(state, action) {
    const { store, id, data, message, listStore } = action.payload;
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
      if (`${id}` === `${key}`) {
        originalStore[key] = data;
      }
    });

    const dataSource = Array.isArray(state[listStore || store])
      ? state[listStore || store]
      : state[listStore || store].data || [];
    let updated = false;
    const newStore = dataSource.map(item => {
      if (parseInt(item.id, 0) === parseInt(id, 0)) {
        updated = true;
        return data;
      }
      return item;
    });
    if (!updated) {
      newStore.push(data);
    }
    let dataState;
    if (Array.isArray(state[listStore || store])) {
      dataState = state[listStore || store] ? [...newStore] : [];
    } else {
      dataState = state[listStore || store].data
        ? {
            ...state[listStore || store],
            data: newStore,
          }
        : {};
    }
    return {
      ...state,
      [listStore || store]: dataState,
      [`${store}Details`]: originalStore,
    };
  },
  delete(state, action) {
    const { store, id, data = [], message, listStore } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return { ...state };
    }
    notification.success({
      message: message || '删除成功',
    });
    const originalStore = { ...state[`${store}Details`] };
    Object.keys(originalStore).forEach(key => {
      if (id === key) {
        delete originalStore[key];
      }
    });

    const dataState = Array.isArray(state[listStore || store])
      ? state[listStore || store]
        ? state[store].filter(item => item.id !== id)
        : []
      : state[listStore || store].data
        ? {
            ...state[listStore || store],
            total: state[listStore || store].total - 1,
            data: state[listStore || store].data.filter(item => item.id !== id),
          }
        : {};
    return {
      ...state,
      [listStore || store]: dataState,
      [`${store}Details`]: originalStore,
    };
  },
  exportExcel(state, action) {
    const { data, filename, message } = action.payload;
    data.blob().then(body => {
      const blob = new Blob([body]);
      const newFilename = filename || 'excel.xls';
      if ('download' in document.createElement('a')) {
        const downloadElement = document.createElement('a');
        let href = '';
        if (window.URL) href = window.URL.createObjectURL(blob);
        else href = window.webkitURL.createObjectURL(blob);
        downloadElement.href = href;
        downloadElement.download = newFilename;
        downloadElement.click();
        if (window.URL) window.URL.revokeObjectURL(href);
        else window.webkitURL.revokeObjectURL(href);
        notification.success({
          message: message || '导出成功',
        });
      }
    });
    return state;
  },
};
