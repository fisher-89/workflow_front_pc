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
