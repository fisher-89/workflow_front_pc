import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import ProcessingTable from './processing';
import ApprovedTable from './finished';

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
      <Tabs defaultActiveKey="processing">
        <Tabs.TabPane key="processing" tab="待审批">
          <ProcessingTable />
        </Tabs.TabPane>
        <Tabs.TabPane key="finished" tab="已审批">
          <ApprovedTable />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
export default Index;
