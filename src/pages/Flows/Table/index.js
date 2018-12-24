import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import ProcessingTable from './processing';
import FinishedTable from './finished';

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
        <Tabs.TabPane key="finished" tab="已完成">
          <FinishedTable />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
export default Index;
