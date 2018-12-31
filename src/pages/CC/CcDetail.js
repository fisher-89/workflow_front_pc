import React, { PureComponent } from 'react';
import { Spin } from 'antd';
import { connect } from 'dva';
import { FormDetail } from '../../components/Form/index';
import style from '../Flows/index.less';

@connect(({ cc, loading }) => ({
  ccDetails: cc.ccDetails,
  startLoading: loading.effects['cc/getFlowInfo'],
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
      type: 'cc/fetchStepInfo',
      payload: {
        id,
      },
    });
  }

  render() {
    const { ccDetails, startLoading } = this.props;
    const startflow = ccDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }

    return (
      <Spin spinning={startLoading || false}>
        <div style={{ maxWidth: '900px', paddingBottom: '20px' }}>
          <div className={style.clearfix}>
            <span className={style.flow_title}>流程名称</span>
            <span className={style.flow_des}>{startflow.flow_run.name}</span>
          </div>
          <FormDetail startflow={startflow} />
        </div>
      </Spin>
    );
  }
}
export default StartDetail;
