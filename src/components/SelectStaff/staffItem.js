import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Popover } from 'antd';
import style from './index.less';

class SelectStaff extends PureComponent {
  state = {};

  onClose = e => {
    e.preventDefault();
    console.log('ee');
  };

  handleClick = () => {};

  renderPupContent = () => (
    <div className={style.card_info}>
      <div className={style.card_list}>
        <div>
          职位：
          <span>初级专员</span>
        </div>
        <div>
          部门：
          <span>初级专员</span>
        </div>
        <div>
          品牌：
          <span>初级专员</span>
        </div>
      </div>
    </div>
  );

  render() {
    const { extra } = this.props;
    const cls = classnames(style.base_info, style.checked);
    const pupContent = this.renderPupContent();
    return (
      <div className={style.item_info}>
        <div style={{ float: 'left', padding: '' }} className={cls}>
          <img src="/default_avatar.png" alt="默认" />
          <div className={style.right}>
            <div className={style.clearfix} style={{ height: '18px', float: 'left' }}>
              <Popover
                content={pupContent}
                placement="rightBottom"
                title={
                  <div className={style.card_header}>
                    <div className={style.staff_name}>
                      王丽丽
                      <span>(123456)</span>
                    </div>
                    <div className={style.status}>
                      状态：
                      <span>在职</span>
                    </div>
                  </div>
                }
              >
                <div className={style.card} />
              </Popover>
              <div className={style.name}>姓名呢哈哈</div>
              <div className={style.sno}>(123456)</div>
            </div>
            <div className={style.des}>描述</div>
          </div>
        </div>
        <div className={style.extra}>
          <div className={style.delete}>x</div>
        </div>
      </div>
    );
  }
}
SelectStaff.defaultProps = {
  extra: <div className={style.delete}>x</div>,
};
export default SelectStaff;
