import React, { PureComponent } from 'react';
import { Button, Spin } from 'antd';
import { connect } from 'dva';
import { FormDetail } from '../../components/Form/index';
import FlowChart from '../../components/FlowChart/chart';
import style from './index.less';

@connect(({ start, loading }) => ({
  startDetails: start.startDetails,
  startLoading: loading.effects['start/fetchStepInfo'],
  presetSubmit: loading.effects['start/doWithDraw'],
  chartLoading: loading.effects['start/fetchFlowSteps'],
  flowChart: start.flowChart,
}))
class StartDetail extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    this.id = id;
    dispatch({
      type: 'start/fetchStepInfo',
      payload: {
        id,
        cb: detail => {
          dispatch({
            type: 'start/fetchFlowSteps',
            payload: {
              id: detail.step_run.id,
            },
          });
        },
      },
    });
  }

  withDraw = e => {
    e.preventDefault();
    const { dispatch, startDetails, history } = this.props;
    const startflow = startDetails[this.id];
    const flowRun = startflow.flow_run;
    dispatch({
      type: 'start/doWithDraw',
      payload: {
        params: {
          flow_run_id: flowRun.id,
        },
        cb: () => {
          history.goBack(-1);
        },
      },
    });
  };

  render() {
    const { startDetails, startLoading, presetSubmit, flowChart, chartLoading } = this.props;
    const startflow = startDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }
    const flowRun = startflow.flow_run;

    return (
      <div style={{ paddingBottom: '20px', width: '1202px' }}>
        <Spin spinning={startLoading || presetSubmit || false}>
          <div className={style.clearfix} style={{ marginBottom: '30px' }}>
            <span className={style.flow_title}>流程名称</span>
            <span className={style.flow_des}>{startflow.flow_run.name}</span>
          </div>
          <FormDetail startflow={startflow} template={startflow.step.flow.form.pc_template} />
          {flowRun && flowRun.status === 0 ? (
            <div style={{ paddingLeft: '120px', marginTop: '20px' }}>
              <div style={{ width: '150px', height: '40px' }}>
                <Button type="primary" onClick={this.withDraw} block>
                  撤回
                </Button>
              </div>
            </div>
          ) : null}
        </Spin>{' '}
        <Spin spinning={chartLoading || false}>
          {' '}
          <FlowChart dataSource={flowChart} status={startflow.flow_run.status} />
        </Spin>
      </div>
    );
  }
}
export default StartDetail;
