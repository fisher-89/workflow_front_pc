import React, { PureComponent } from 'react';
import { Card } from 'antd';
import { connect } from 'net';

// @connect(({ test }) => ({test }))

class Test extends PureComponent {
  state = {};

  render() {
    console.log(this.props);
    return <Card bordered={false}>测试题</Card>;
  }
}
export default Test;
