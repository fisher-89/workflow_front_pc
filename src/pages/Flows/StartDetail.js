import React, { PureComponent } from 'react';
import { Button, Spin } from 'antd';
import { connect } from 'dva';
import { FormDetail } from '../../components/Form/index';
import FlowChart from '../../components/FlowChart/chart';
import style from './index.less';

@connect(({ start, loading }) => ({
  startDetails: start.startDetails,
  startLoading: loading.effects['start/getFlowInfo'],
  presetSubmit: loading.effects['start/preSet'],
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
    this.id = 6;
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
    const { startDetails, startLoading, presetSubmit, flowChart } = this.props;
    const startflow = startDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }
    const flowRun = startflow.flow_run;

    return (
      <Spin spinning={startLoading || presetSubmit === true}>
        <div style={{ paddingBottom: '20px', width: '902px' }}>
          <div className={style.clearfix} style={{ marginBottom: '20px' }}>
            <span className={style.flow_title}>流程名称</span>
            <span className={style.flow_des}>{startflow.flow_run.name}</span>
          </div>
          <FormDetail startflow={startflow} template={startflow.step.flow.form.pc_template} />
          {/* <FlowChart dataSource={flowChart} status={startflow.flow_run.status} /> */}
          {flowRun && flowRun.status === 0 ? (
            <div style={{ paddingLeft: '120px', marginTop: '20px' }}>
              <Button type="primary" onClick={this.withDraw}>
                撤回
              </Button>
            </div>
          ) : null}
        </div>
      </Spin>
    );
  }
}
export default StartDetail;
