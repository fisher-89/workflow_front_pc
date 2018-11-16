import React, { Component } from 'react';
import { connect } from 'dva';
import { keys } from "lodash";
import Loading from "@/components/Loading";

@connect(({ manager }) => ({ current: manager.current }))
class GetAccessToken extends Component {
  componentWillMount() {
    const { location: { query: { code } }, dispatch } = this.props;
    const params = { code };
    dispatch({
      type: 'oauth/getAccessTokenByAuthCode',
      payload: params,
      callBack: () => dispatch({ type: 'manager/getCurrentManger' }),
    });
  }

  componentWillReceiveProps(nextProps) {
    if (keys(nextProps.current).length) {
      window.location.href = '/';
    }
  }

  render() {
    return <Loading />
  }
}
export default GetAccessToken;
