import React, { PureComponent } from 'react';
import { Tag } from 'antd';
import StaffItem from './staffItem';
import style from './index.less';

class SelectStaff extends PureComponent {
  state = {};

  onClose = e => {
    e.preventDefault();
    console.log('ee');
  };

  handleClick = () => {};

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
        <div>
          <StaffItem />
          <StaffItem />
          <StaffItem />
          <StaffItem />
        </div>
      </div>
    );
  }
}
export default SelectStaff;
