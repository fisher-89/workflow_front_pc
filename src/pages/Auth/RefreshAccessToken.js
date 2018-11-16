import React, { Component } from 'react';
import { connect } from 'dva';
import BlankLayout from '@/layouts/BlankLayout';

class RefreshAccessToken extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'oauth/refreshAccessToken',
      callBack: () => dispatch({ type: 'currentUser/fetchCurrent' }),
    });
  }

  componentWillUpdate(nextProps) {
    const { accessToken } = nextProps;
    if (accessToken && accessToken.length > 0) {
      window.location.href = '/';
    }
  }

  render() {
    return (
      <BlankLayout />
    );
  }
}
export default connect(({ oauth }) => ({
  accessToken: oauth.accessToken,
}))(RefreshAccessToken);
