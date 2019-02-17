export function dealThumbImg(url, str) {
  const i = url.lastIndexOf('.');
  const newImg = url.slice(0, i) + str + url.slice(i);
  return newImg;
}

export function reAgainImg(url, str) {
  const i = url.lastIndexOf(str);
  const newImg = url.slice(0, i) + url.slice(i + str.length);
  return newImg;
}

export function rebackImg(url, prefix, str) {
  const i = url.lastIndexOf('.');
  const m = prefix.length;
  const n = url.lastIndexOf(str);
  const newImg = url.slice(m, n) + url.slice(i);

  return newImg;
}

export const shopStatus = [
  { value: 1, text: '未营业' },
  { value: 2, text: '营业中' },
  { value: 3, text: '闭店' },
  { value: 4, text: '结束' },
];

export function convertShopStatus(id) {
  switch (id) {
    case 1:
      return '未营业';
    case 2:
      return '营业中';
    case 3:
      return '闭店';
    case 4:
      return '结束';
    default:
      return '';
  }
}

// 发起状态
export const startState = [
  { title: '处理中', type: 'processing' },
  { title: '已完成', type: 'finished' },
  { title: '被驳回', type: 'rejected' },
  { title: '撤回', type: 'withdraw' },
];
export const startConverSta = [
  { title: '已撤回', value: -2 },
  { title: '被驳回', value: -1 },
  { title: '进行中', value: 0 },
  { title: '已完成', value: 1 },
];
export const getStartState = state => {
  switch (state) {
    case -2:
      return '已撤回';
    case -1:
      return '被驳回';
    case 0:
      return '进行中';
    case 1:
      return '已完成';
    default:
      return '其他';
  }
};
// 审批状态
export const approvalState = [
  { title: '待审批', type: 'processing' },
  { title: '已审批', type: 'approved' },
];

export const approConverSta = [
  { title: '已驳回', value: -1 },
  { title: '待审批', value: 0 },
  { title: '已通过', value: 2 },
  { title: '已转交', value: 3 },
];

export const getApprState = state => {
  switch (state) {
    case -1:
      return '已驳回';
    case 0:
      return '待审批';
    case 2:
      return '已通过';
    case 3:
      return '已转交';
    default:
      return '其他';
  }
};

export const flowchartStatus = status => {
  switch (status - 0) {
    case 0:
      return '待审批';
    case 1:
      return '发起';
    case 2:
      return '通过';
    case 3:
      return '转交';
    case -1:
      return '驳回';
    case -2:
      return '撤回';
    case -3:
      return '取消';
    default:
      return '其他';
  }
};

export const flowchartStatusColor = status => {
  switch (status - 0) {
    case 0:
      return 'rgb(245, 166, 35)';
    case 1:
      return 'rgb(102,102,102)';
    case 2:
    case 3:
      return '#1890ff';
    case -1:
      return 'rgb(245,34,45)';
    case -2:
      return 'rgb(245,34,45)';
    case -3:
      return 'rgb(245,34,45)';
    default:
      return 'rgb(245,34,45)';
  }
};
