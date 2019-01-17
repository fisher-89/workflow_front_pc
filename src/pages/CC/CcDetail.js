import React, { PureComponent } from 'react';
import { Spin } from 'antd';
import { connect } from 'dva';
import { FormDetail } from '../../components/Form/index';
import FlowChart from '../../components/FlowChart/chart';

import style from '../Flows/index.less';

@connect(({ cc, loading, start }) => ({
  ccDetails: cc.ccDetails,
  startLoading: loading.effects['cc/fetchStepInfo'],
  chartLoading: loading.effects['start/fetchFlowSteps'],
  flowChart: start.flowChart,
}))
class CCDetail extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    this.id = id;
    dispatch({
      type: 'cc/fetchStepInfo',
      payload: {
        id,
        cb: detail => {
          dispatch({
            type: 'start/fetchFlowSteps',
            payload: {
              id: detail.step_run_id,
            },
          });
        },
      },
    });
  }

  render() {
    const { ccDetails, startLoading, flowChart, chartLoading } = this.props;
    const startflow = ccDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }

    return (
      <div
        style={{ paddingBottom: '20px', width: '902px', maxWidth: '926px', paddingRight: '24px' }}
      >
        <Spin spinning={startLoading || false}>
          <div className={style.clearfix} style={{ marginBottom: '20px' }}>
            <span className={style.flow_title}> 流程名称</span>
            <span className={style.flow_des}> {startflow.flow_run.name}</span>
          </div>
          <FormDetail startflow={startflow} template={startflow.form.pc_template} />
        </Spin>
        <Spin spinning={chartLoading || false}>
          <FlowChart dataSource={flowChart} status={startflow.flow_run.status} />
        </Spin>
      </div>
    );
  }
}
export default CCDetail;
