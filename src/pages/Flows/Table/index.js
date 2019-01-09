import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import ProcessingTable from './processing';
import FinishedTable from './finished';
import RejectedTable from './rejected';
import WithDrawTablw from './withdraw';

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
      <div style={{ marginRight: '50px' }}>
        <Tabs defaultActiveKey="processing">
          <Tabs.TabPane key="processing" tab="处理中">
            <ProcessingTable />
          </Tabs.TabPane>
          <Tabs.TabPane key="finished" tab="已完成">
            <FinishedTable />
          </Tabs.TabPane>
          <Tabs.TabPane key="rejected" tab="已驳回">
            <RejectedTable />
          </Tabs.TabPane>
          <Tabs.TabPane key="withdraw" tab="已撤回">
            <WithDrawTablw />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}
export default Index;
