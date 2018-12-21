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
