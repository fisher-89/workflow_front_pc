import React, { PureComponent } from 'react';
import { connect } from 'dva';
import style from './index.less';

@connect(({ start }) => ({ availableFlows: start.availableFlows }))
class AvailableFlows extends PureComponent {
  state = {};

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'start/getFlows',
    });
  }

  redirectTo = item => {
    const { history } = this.props;
    history.push(`/start_form/${item.number}`);
  };

  renderFlowList = () => {
    const { availableFlows } = this.props;
    return availableFlows.map(flowType => {
      const { flow } = flowType;
      const flows = flow.map(item => (
        <div className={style.content_item} key={item.id}>
          <img src={`${item.icon || '/default_flow_icon.png'}`} alt="流程" />
          <div className={style.detail} onClick={() => this.redirectTo(item)}>
            <div className={style.name}>{item.name}</div>
            <div className={style.des}>{item.description}</div>
          </div>
        </div>
      ));
      return (
        <React.Fragment key={flowType.id}>
          <div className={style.title}>
            <span />
            <div>{flowType.name}</div>
          </div>
          <div className={style.content}>{flows}</div>
        </React.Fragment>
      );
    });
  };

  render() {
    return (
      <div style={{ paddingLeft: '4px' }}>
        <div>{this.renderFlowList()}</div>
      </div>
    );
  }
}
export default AvailableFlows;
