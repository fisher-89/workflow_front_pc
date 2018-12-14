import React, { PureComponent } from 'react';
import SelectStaff from '../../components/SelectStaff';
// @connect(({ test }) => ({test }))

class Test extends PureComponent {
  state = {};

  render() {
    console.log(this.props);
    return <SelectStaff />;
  }
}
export default Test;
