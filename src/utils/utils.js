/* eslint-disable*/

import moment from 'moment';
import React from 'react';
import { parse, stringify } from 'qs';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function unicodeFieldsError(temp, isUnicode = true, values) {
  if (!isUnicode) return temp;
  const fieldsValue = { ...temp };
  const params = {};
  Object.keys(fieldsValue).forEach(key => {
    const value = fieldsValue[key];
    let fieldsValueMd = params;
    const keyGroup = key.split('.');
    keyGroup.forEach((item, index) => {
      if (index === keyGroup.length - 1) {
        if (Object.hasOwnProperty.call(values, item)) {
          fieldsValueMd[item] = { value: values[item], errors: [new Error(value[0])] };
        } else {
          fieldsValueMd[item] = { errors: [new Error(value[0])] };
        }
      } else {
        fieldsValueMd[item] = fieldsValueMd[item] || {};
        fieldsValueMd = fieldsValueMd[item];
      }
    });
  });
  return params;
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          styles={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            lineHeight: 20,
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  routes = routes.map(item => item.replace(path, ''));
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}

/**
 * 验证用户操作权限
 * @param {权限Id} authId
 */
export function customerAuthority(authId) {
  let authAble = false;
  if (window.user && Object.keys(window.user).length) {
    const {
      authorities: { oa },
    } = window.user;
    if (Array.isArray(authId)) {
      authId.forEach(id => {
        if (oa.indexOf(id) !== -1) {
          authAble = true;
        }
      });
    } else {
      authAble = oa.indexOf(authId) !== -1;
    }
  }
  return authAble;
}

/**
 * 验证品牌权限
 */
export function getBrandAuthority(brandId) {
  if (Object.keys(window.user).length) {
    const availableBrands = window.user.authorities.available_brands;
    if (availableBrands.indexOf(brandId) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * 验证部门权限
 */
export function getDepartmentAuthority(departmentId) {
  if (Object.keys(window.user).length) {
    const availableDepartments = window.user.authorities.available_departments;
    if (availableDepartments.indexOf(departmentId) !== -1) {
      return true;
    }
  }
  return false;
}

export function makePositionData(brandId, brand) {
  let conditions = brandId;
  if (brandId.in) {
    conditions = brandId.in;
  }
  const selectBrand = brand.filter(item => conditions.indexOf(item.id.toString()) !== -1);
  const pushPosition = [];
  selectBrand.forEach(item => {
    if (item.positions.length > 0) {
      item.positions.forEach(p => {
        const pushIndex = pushPosition.map(index => index.id);
        if (pushIndex.indexOf(p.id) === -1) {
          pushPosition.push(p);
        }
      });
    }
  });
  return pushPosition;
}

export function dotFieldsValue(fieldsValue, parentKey) {
  let response = {};
  Object.keys(fieldsValue || {}).forEach(key => {
    const value = fieldsValue[key];
    const newKey = parentKey === undefined ? key : `${parentKey}.${key}`;
    if (Array.isArray(value)) {
      if (typeof value[0] === 'object') {
        response = {
          ...response,
          ...dotFieldsValue(value, newKey),
        };
      } else {
        response[newKey] = value;
      }
    } else if (typeof value === 'object') {
      response = {
        ...response,
        ...dotFieldsValue(value, newKey),
      };
    } else {
      response[newKey] = value;
    }
  });
  return response;
}

// table params

export const whereConfig = {
  in: '=',
  like: '~',
  min: '>=',
  max: '<=',
  gt: '>',
  lt: '<',
};

export function dotWheresValue(fields) {
  let fieldsWhere = '';
  Object.keys(fields || {}).forEach(key => {
    const name = key;
    if (typeof fields[key] === 'object') {
      Object.keys(fields[key]).forEach(i => {
        let value = fields[key][i];
        if (Array.isArray(value) && value.length > 0) {
          value = value.length > 1 ? `[${value}]` : value[0];
        }
        if (value) {
          fieldsWhere += `${name}${whereConfig[i]}${value};`;
        }
      });
    } else if (fields[key]) {
      fieldsWhere += `${name}=${fields[key]};`;
    }
  });
  return fieldsWhere;
}

export function makerFilters(params) {
  const { filters } = { ...params };
  let newFilters = '';
  newFilters = dotWheresValue(filters);
  return {
    ...params,
    filters: newFilters,
  };
}

/* selectTree */

export function markTreeData(data = [], { value, lable, parentId }, pid = null) {
  const tree = [];
  data.forEach(item => {
    if (item[parentId] === pid) {
      const temp = {
        value: item[value].toString(),
        label: item[lable],
        key: `${item[value]}`,
      };
      const children = markTreeData(data, { value, lable, parentId }, item[value]);
      if (children.length > 0) {
        temp.children = children;
      }
      tree.push(temp);
    }
  });
  return tree;
}

/**
 * 获取url参数对象
 * @param {参数名称} name
 */
export function getUrlString(name) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

/**
 * 重组属性值
 * @param {名} name
 * @param {读取值}} value
 * @param {多选}} multiple
 */
export function makeInitialValue(name, value, multiple = false) {
  if (!name) return value;
  let newValue = [];
  if (multiple) {
    newValue = value.map(item => {
      const temp = {};
      Object.keys(name).forEach(key => {
        if (item[key]) {
          temp[name[key]] = item[key];
        }
      });
      return temp;
    });
  } else {
    newValue = {};
    Object.keys(name).forEach(key => {
      if (value[key]) {
        newValue[name[key]] = value[key];
      }
    });
  }
  return newValue;
}

/**
 *
 * @param {属性}} name
 * @param {值} value
 * @param {单选多选} multiple
 */
export function dontInitialValue(name, value, multiple = false) {
  if (!name) return value;
  let newValue;
  if (multiple) {
    newValue = [];
    value.forEach((item, i) => {
      newValue[i] = {};
      Object.keys(name).forEach(key => {
        newValue[i][key] = item[name[key]];
      });
    });
  } else {
    newValue = {};
    Object.keys(name).forEach(key => {
      newValue[key] = value[name[key]];
    });
  }
  return newValue;
}

/**
 * 屏幕高度，是否大屏
 */
export function getClientRatio() {
  const { height } = document.body.getBoundingClientRect();
  return {
    height,
    isBigRatio: height > 660,
  };
}
/**
 * 弹窗高度
 */
export function getModalToAndHeight() {
  const { height, isBigRatio } = getClientRatio();
  const style = {};
  const maxHeight = 600;
  const minTo = 30;
  if (isBigRatio) {
    style.height = maxHeight;
    style.top = (height - maxHeight) / 2;
  } else {
    style.height = height - minTo * 2;
    style.top = minTo;
  }
  return style;
}
/**
 * 弹窗内容高度
 */
export function getModalBodyHeight() {
  const { height } = getModalToAndHeight();
  const modalTitleHeight = 40;
  const bodyHeight = height - modalTitleHeight;
  return bodyHeight;
}

/**
 * 弹窗内表格高度
 */
export function getTableBodyHeight(footerAble) {
  const modalBodyHeight = getModalBodyHeight();
  const tableHeader = 46;
  const tableeExtarHegiht = 60;
  const tablePaginatiopnBottom = 35;
  const footer = footerAble ? 50 : 0;
  return modalBodyHeight - (tableHeader + tableeExtarHegiht + tablePaginatiopnBottom + footer);
}

/**
 * 获取id的所有上级数据
 * @param {数据源} data
 * @param {查找的id} id
 */
export function findTreeParent(data, id, key = 'id', pid = 'parent_id') {
  const result = [];
  const findData = data.find(item => item[key] === id);
  if (!findData || !id) return result;
  result.push(findData);
  let perantItem = [];
  perantItem = findTreeParent(data, findData[pid], key, pid);
  return result.concat(perantItem);
}

/**
 * 容器容纳字数
 * @param {容器宽度} width
 * @param {字数} fontSize
 */
export function countViewFontSize(width, fontSize) {
  return Math.floor(width / fontSize);
}
/**
 * str 截取字符串
 * width 容器宽度
 * fontSize 字数
 */
export function getLetfEllipsis(str, width, fontSize) {
  const numberStr = countViewFontSize(width, fontSize);
  if (str.length < numberStr) return str;
  return `...${str.substr(-numberStr + 3)}`;
}

/**
 * 滚动到页面制定元素
 * @param {元素ID} anchorName
 */
export function scrollToAnchor(anchorName) {
  if (anchorName) {
    // 找到锚点
    const anchorElement = document.getElementById(anchorName);
    // 如果对应id的锚点存在，就跳转到锚点
    if (anchorElement) {
      anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }
}

export function isImage(src) {
  let imgtype = '';
  if (src.indexOf('.') > 0) {
    // 如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
    imgtype = src.substring(src.lastIndexOf('.') + 1, src.length);
  }
  imgtype = imgtype.toLowerCase();
  if (
    imgtype === 'png' ||
    imgtype === 'jpeg' ||
    imgtype === 'bmp' ||
    imgtype === 'jpg' ||
    imgtype === 'gif'
  ) {
    return true;
  }
  return false;
}

export function isJSON(str) {
  try {
    const obj = JSON.parse(str);
    if (typeof obj === 'object' && obj) {
      return obj;
    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
}

export function judgeIsNothing(value) {
  let ableSubmit = true;
  if (!value) {
    ableSubmit = false;
  } else if (isArray(value) && !value.length) {
    ableSubmit = false;
  } else if (isObject(value) && JSON.stringify(value) === '{}') {
    ableSubmit = false;
  }
  return ableSubmit;
}

export function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}
export function isObject(obj) {
  return obj instanceof Object;
}

export function uniq(array) {
  var temp = []; //一个新的临时数组
  for (var i = 0; i < array.length; i++) {
    if (temp.indexOf(array[i]) == -1) {
      temp.push(array[i]);
    }
  }
  return temp;
}

Array.prototype.unique = function(name = 'id') {
  const result = this;
  const newData = [];
  const obj = {};
  for (let i = 0; i < result.length; i += 1) {
    if (!obj[result[i][name]]) {
      // 如果能查找到，证明数组元素重复了
      obj[result[i][name]] = 1;
      newData.push(result[i]);
    }
  }
  return newData;
};

export function makeFieldValue(value, name, multiple = false, include = false) {
  const keys = Object.keys(name);
  if (multiple) {
    const newValue = value.map(item => {
      return getFieldValue(item, keys, name, include);
    });
    return newValue;
  }
  const newValue = getFieldValue(value, keys, name, include);
  return newValue;
}

export function getFieldValue(value, keys, name, include) {
  let newValue = {};
  if (include) {
    newValue = { ...value };
  }
  keys.forEach(key => {
    const newKey = name[key];
    delete newValue[key];
    newValue[newKey] = value[key];
  });
  return newValue;
}
