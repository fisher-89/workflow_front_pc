// import fetch from 'dva/fetch';
import axios from 'axios';

import router from 'umi/router';
import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const fetch = (url, options) => {
  const { method, body, headers } = options;
  const axo = axios.create({
    timeout: 20000,
    headers,
  });

  const newMethod = method.toLowerCase();
  switch (true) {
    case newMethod === 'get':
      return axo.get(url);
    case newMethod === 'post':
      return axo.post(url, body);
    case newMethod === 'put' && body === undefined:
      return axo.put(url);
    case newMethod === 'put':
      return axo.put(url, body);
    case newMethod === 'delete':
      return axo.delete(url);
    case newMethod === 'patch':
      return axo.patch(url, body);
    default:
      return axo.get(url);
  }
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */

export default function request(uri, params) {
  let urlParam = uri;

  const defaultOptions = {
    credentials: 'include',
  };
  if (uri.match(/\/api\//)) {
    if (
      localStorage.getItem('OA_access_token') &&
      localStorage.getItem('OA_access_token_expires_in') > new Date().getTime()
    ) {
      defaultOptions.headers = {
        Authorization: `Bearer ${localStorage.getItem('OA_access_token')}`,
      };
    } else {
      window.location.href = `${OA_PATH}/oauth/authorize?client_id=${OA_CLIENT_ID}&response_type=code`;
    }
  }
  const newOptions = {
    ...defaultOptions,
    ...params,
    method: params ? params.method : 'GET',
  };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
      ...newOptions.headers,
    };
  } else if (newOptions.method === 'GET' && newOptions.body) {
    const paramsArray = [];
    Object.keys(newOptions.body).forEach(key => {
      let param = newOptions.body[key];
      if (typeof param === 'object') {
        param = JSON.stringify(param);
      }
      paramsArray.push(`${key}=${param}`);
    });
    if (uri.search(/\?/) === -1 && paramsArray.length > 0) {
      urlParam += `?${paramsArray.join('&')}`;
    } else if (paramsArray.length > 0) {
      urlParam += `&${paramsArray.join('&')}`;
    }
  }
  return (
    fetch(urlParam, newOptions)
      // .then(checkStatus)
      .then(response => {
        // DELETE and 204 do not return data by default
        // using .json will report an error.
        if (newOptions.method === 'DELETE' || response.status === 204) {
          // return response.text();
          const obj = { status: '204', message: '删除成功' };
          return new Promise(resolve => {
            resolve(obj);
          });
        }
        return new Promise(resolve => {
          resolve(response.data);
        });
      })
      .catch(e => {
        const {
          response,
          response: { status, message },
        } = e;
        if (status === 422) {
          return new Promise(resolve => {
            resolve({
              status: 422,
              error: true,
              errors: response.data.errors,
            });
          });
        }
        if (status === 401) {
          // @HACK
          /* eslint-disable no-underscore-dangle */
          window.g_app._store.dispatch({
            type: 'login/logout',
          });

          return new Promise(resolve => {
            resolve({
              error: true,
            });
          });
        }
        if (status === 400) {
          notification.open({
            message: '错误提示',
            description: message,
          });
          return new Promise(resolve => {
            resolve({
              error: true,
              status: 400,
              message,
            });
          });
        }
        // environment should not be used
        if (status === 403) {
          router.push('/exception/403');
          return new Promise(resolve => {
            resolve({
              error: true,
            });
          });
        }
        if (status <= 504 && status >= 500) {
          router.push('/exception/500');
          return new Promise(resolve => {
            resolve({
              error: true,
            });
          });
        }
        if (status >= 404 && status < 422) {
          router.push('/exception/404');
          return new Promise(resolve => {
            resolve({
              error: true,
            });
          });
        }
        notification.open({
          message: '错误提示',
          description: codeMessage[status],
        });
        return new Promise(resolve => {
          resolve({
            error: true,
          });
        });
      })
      .catch(e => {
        console.log(e);
      })
  );
}
