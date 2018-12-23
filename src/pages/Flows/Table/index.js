import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import ProcessingTable from './processing';

// export default function Container() {
@connect()
class Index extends PureComponent {
  componentWillMount() {
    this.fetchFlows();
  }

  fetchFlows = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'start/getFlows',
    });
  };

  render() {
    return (
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane key="processing" tab="处理中">
          <ProcessingTable />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
export default Index;
