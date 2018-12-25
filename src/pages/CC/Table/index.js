import React, { PureComponent } from 'react';
import { connect } from 'dva';
import CCTable from './list';

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
    return <CCTable />;
  }
}
export default Index;
