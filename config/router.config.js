export default [
  // Auth
  {
    path: '/passport/get_access_token',
    component: './Auth/AccessToken',
  },
  {
    path: '/passport/redirect_to_getAccessToken',
    component: './Auth/RedirectToAuthorize',
  },

  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['token'],
    routes: [
      // dashboard
      { path: '/', redirect: '/test' },
      {
        path: '/test1',
        name: '发起流程',
        component: './Test/test',
      },
      {
        path: '/test',
        name: '我发起的',
        component: './Test/test',
      },
      {
        path: '/test2',
        name: '审批列表',
        component: './Test/test',
      },
      {
        path: '/test3',
        name: '抄送人列表',
        component: './Test/test',
      },
      {
        path: '/exception/404',
        component: './Exception/404',
      },
      {
        path: '/exception/403',
        component: './Exception/403',
      },
    ],
  },
];
