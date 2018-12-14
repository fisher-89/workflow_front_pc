import React, { PureComponent } from 'react';
import { Tag } from 'antd';
import StaffModal from './StaffModal';
import style from './index.less';

class SelectStaff extends PureComponent {
  state = {
    visible: false,
  };

  onClose = e => {
    e.preventDefault();
    console.log('ee');
  };

  handleClick = () => {
    this.setState({
      visible: true,
    });
  };

  render() {
    return (
      <div>
        <div className={style.result} style={{ width: '900px' }} onClick={this.handleClick}>
          <div className={style.tagItem} onClick={this.onClose}>
            <Tag closable onClose={this.onClose}>
              tet
            </Tag>
          </div>
        </div>
        <StaffModal visible={this.state.visible} />
      </div>
    );
  }
}
export default SelectStaff;
