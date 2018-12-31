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
      { path: '/', redirect: '/available_flow' },
      {
        path: '/available_flow',
        name: '发起流程',
        component: './Flows/AvailableFlows',
      },
      {
        path: '/start_form/:id',
        component: './Flows',
      },
      {
        path: '/start_list',
        name: '我发起的',
        component: './Flows/Table',
      },
      {
        path: '/start/:id',
        component: './Flows/StartDetail.js',
      },
      {
        path: '/approvelist',
        name: '审批列表',
        component: './Approve/Table',
      },
      {
        path: '/approve/:id',
        component: './Approve/index',
      },
      {
        path: '/cclist',
        name: '抄送人列表',
        component: './CC/Table',
      },
      {
        path: '/cc_detail/:id',
        component: './CC/CcDetail',
      },
      {
        path: '/exception/404',
        component: './Exception/404',
      },
      {
        path: '/exception/403',
        component: './Exception/403',
      },
      {
        component: './Exception/404',
      },
    ],
  },
];
