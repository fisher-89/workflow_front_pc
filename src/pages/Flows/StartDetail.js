import React, { PureComponent } from 'react';
import { Button, Spin } from 'antd';
import { connect } from 'dva';
import { FormDetail } from '../../components/Form/index';
import style from './index.less';

@connect(({ start, loading, match }) => ({
  startDetails: start.startDetails,
  startLoading: loading.effects['start/getFlowInfo'],
  presetSubmit: loading.effects['start/preSet'],
  match,
}))
class StartForm extends PureComponent {
  componentWillMount() {
    const { dispatch } = this.props;
    this.id = 227;
    dispatch({
      type: 'start/fetchStepInfo',
      payload: this.id,
    });
  }

  handleSubmit = e => {
    e.preventDefault();
  };

  render() {
    const { startDetails, startLoading, presetSubmit } = this.props;
    const startflow = startDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }
    return (
      <Spin spinning={startLoading || presetSubmit === true}>
        <div style={{ maxWidth: '900px', paddingBottom: '20px' }}>
          <div className={style.clearfix}>
            <span className={style.flow_title}>流程名称</span>
            <span className={style.flow_des}>{startflow.flow_run.name}</span>
          </div>
          <FormDetail startflow={startflow} readonly />
          <div style={{ paddingLeft: '120px', marginTop: '20px' }}>
            <Button type="primary" onClick={this.handleSubmit}>
              撤回
            </Button>
          </div>
        </div>
      </Spin>
    );
  }
}
export default StartForm;
