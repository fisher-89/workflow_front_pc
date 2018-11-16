// use localStorage to store the authority info, which might be sent from server in actual project.

export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? localStorage.getItem(`${AUTH_NAME}authority`) : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority = [];
  if (localStorage.getItem(`${TOKEN_PREFIX}access_token`)
    && localStorage.getItem(`${TOKEN_PREFIX}access_token_expires_in`) > new Date().getTime()) {
    authority.push('token');
  }
  if (localStorage.getItem(`${TOKEN_PREFIX}refresh_token`)) {
    authority.push('refresh-token');
  }
  try {
    const parseArr = JSON.parse(authorityString);
    if (Array.isArray(parseArr)) {
      authority = authority.concat(parseArr);
    }
  } catch (e) {
    if (typeof authorityString === 'string') {
      authority.push(authorityString);
    }
  }
  return authority || [];
}

export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem(`${AUTH_NAME}authority`, JSON.stringify(proAuthority));
}
